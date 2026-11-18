"use client";
/* eslint-disable @next/next/no-img-element -- IndexedDB Blob URLs are local and cannot use the Next image optimizer. */

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { BottomNavigation } from "./BottomNavigation";
import { CollagePageHeader } from "./CollagePageHeader";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { useWardrobe } from "./AccountProvider";
import { getDisplayImage, type ClothingItem, type Outfit, type OutfitPiece } from "@/lib/types";
import styles from "./FigmaSavedOutfits.module.css";

function PreviewPiece({ piece, item }: { piece: OutfitPiece; item: ClothingItem }) {
  const url = useObjectUrl(getDisplayImage(item));
  if (!url) return null;
  return <img className={styles.piece} src={url} alt="" style={{ left: `${piece.xPct * 100}%`, top: `${piece.yPct * 100}%`, width: `${piece.widthPct * 100}%`, height: `${piece.heightPct * 100}%`, zIndex: piece.layer }} />;
}

export default function FigmaSavedOutfits() {
  const wardrobe = useWardrobe();
  const [search, setSearch] = useState("");
  const outfitsQuery = useLiveQuery(async () => {
    try { return { outfits: await wardrobe.outfits(), error: "" }; }
    catch { return { outfits: [], error: "Saved outfits could not be opened in this browser." }; }
  }, [wardrobe]);
  const itemsQuery = useLiveQuery(async () => {
    try { return { items: await wardrobe.items(), error: "" }; }
    catch { return { items: [], error: "Clothing images could not be opened in this browser." }; }
  }, [wardrobe]);
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
  const renderOutfit = (outfit: Outfit) => <Link key={outfit.id} href={`/outfits/${outfit.id}`} aria-label={`Open ${outfit.name}`} className={styles.card}>
    <div className={styles.name}>{outfit.name}</div>
    <div className={styles.preview}>
      <div className={styles.composition}>{outfit.pieces.map((piece) => {
        const item = itemMap.get(piece.clothingId);
        return item ? <PreviewPiece key={piece.instanceId} piece={piece} item={item} /> : null;
      })}</div>
      <span className={styles.openBadge}>Open →</span>
    </div>
  </Link>;

  return <div data-layer="AUTO / Saved Outfits" className={styles.screen}>
    <CollagePageHeader title="Saved Outfits" description="Tap a card to reopen it in Outfit Builder." />

    <label className={styles.search}>
      <span className={styles.searchIcon} aria-hidden="true">⌕</span>
      <input type="search" value={search} maxLength={60} placeholder="Search saved outfits" aria-label="Search saved outfits by name" onChange={(event) => setSearch(event.target.value)} />
    </label>

    <section className={styles.content}>
      <div data-layer="Frame 12" className={styles.grid}>
        <div className={styles.column}>
          <Link href="/outfits/new" aria-label="Add outfit" className={styles.addCard}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 6v16M6 14h16" stroke="#29241F" strokeWidth="2" strokeLinecap="round" /></svg>
          </Link>
          {filteredOutfits.filter((_, index) => index % 2 === 1).map(renderOutfit)}
        </div>
        <div className={styles.column}>
          {filteredOutfits.filter((_, index) => index % 2 === 0).map(renderOutfit)}
        </div>
        {databaseError ? <p className={styles.state}>{databaseError}</p> : null}
        {outfits && outfits.length > 0 && filteredOutfits.length === 0 ? <p className={styles.state}>No outfits match this search.</p> : null}
      </div>
    </section>
    <BottomNavigation active="saved" />
  </div>;
}
