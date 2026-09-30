"use client";
/* eslint-disable @next/next/no-img-element -- IndexedDB Blob URLs are local and cannot use the Next image optimizer. */

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { BottomNavigation } from "./BottomNavigation";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { db } from "@/lib/db";
import { getDisplayImage, type ClothingItem, type OutfitPiece } from "@/lib/types";
import styles from "./FigmaSavedOutfits.module.css";

function PreviewPiece({ piece, item }: { piece: OutfitPiece; item: ClothingItem }) {
  const url = useObjectUrl(getDisplayImage(item));
  if (!url) return null;
  return <img className={styles.piece} src={url} alt="" style={{ left: `${piece.xPct * 100}%`, top: `${piece.yPct * 100}%`, width: `${piece.widthPct * 100}%`, height: `${piece.heightPct * 100}%`, zIndex: piece.layer }} />;
}

export default function FigmaSavedOutfits() {
  const [search, setSearch] = useState("");
  const outfitsQuery = useLiveQuery(async () => {
    try { return { outfits: await db.outfits.orderBy("updatedAt").reverse().toArray(), error: "" }; }
    catch { return { outfits: [], error: "Saved outfits could not be opened in this browser." }; }
  }, []);
  const itemsQuery = useLiveQuery(async () => {
    try { return { items: await db.clothingItems.toArray(), error: "" }; }
    catch { return { items: [], error: "Clothing images could not be opened in this browser." }; }
  }, []);
  const outfits = outfitsQuery?.outfits;
  const items = itemsQuery?.items;
  const databaseError = outfitsQuery?.error || itemsQuery?.error || "";
  const itemMap = useMemo(() => new Map((items ?? []).map((item) => [item.id, item])), [items]);
  const filteredOutfits = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return (outfits ?? []).filter((outfit) =>
      !query || outfit.name.toLocaleLowerCase().includes(query),
    );
  }, [outfits, search]);

  return <div data-layer="AUTO / Saved Outfits" className={styles.screen}>
    <header className={styles.header}>
      <div className={styles.brand}>E-CLOSET</div>
      <div className={styles.title}>Saved Outfits</div>
      <div className={styles.subtitle}>Tap a card to reopen it in Outfit Builder.</div>
    </header>

    <label className={styles.search}>
      <span className={styles.searchIcon} aria-hidden="true">⌕</span>
      <input type="search" value={search} maxLength={60} placeholder="Search saved outfits" aria-label="Search saved outfits by name" onChange={(event) => setSearch(event.target.value)} />
    </label>

    <section className={styles.content}>
      <div data-layer="Frame 12" className={styles.grid}>
        {outfits === undefined || items === undefined ? <p className={styles.state}>Loading saved outfits…</p> : null}
        {databaseError ? <p className={styles.state}>{databaseError}</p> : null}
        {outfits?.length === 0 ? <p className={styles.state}>No saved outfits yet. <Link href="/outfits/new">Create your first outfit.</Link></p> : null}
        {outfits && outfits.length > 0 && filteredOutfits.length === 0 ? <p className={styles.state}>No outfits match this search.</p> : null}
        {filteredOutfits.map((outfit) => <Link key={outfit.id} href={`/outfits/${outfit.id}`} aria-label={`Open ${outfit.name}`} className={styles.card}>
          <div className={styles.preview}>
            <div className={styles.composition}>{outfit.pieces.map((piece) => {
              const item = itemMap.get(piece.clothingId);
              return item ? <PreviewPiece key={piece.instanceId} piece={piece} item={item} /> : null;
            })}</div>
          </div>
          <div className={styles.name}>{outfit.name}</div>
        </Link>)}
      </div>
    </section>
    <BottomNavigation active="saved" />
  </div>;
}
