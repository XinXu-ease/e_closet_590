"use client";
/* eslint-disable @next/next/no-img-element -- IndexedDB Blob URLs are local and cannot use the Next image optimizer. */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Rnd } from "react-rnd";
import { BottomNavigation } from "./BottomNavigation";
import { ClothingCard } from "./ClothingCard";
import { useElementSize } from "@/hooks/useElementSize";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { db } from "@/lib/db";
import { CLOTHING_CATEGORIES, getDisplayImage, type ClothingCategory, type ClothingItem, type OutfitPiece } from "@/lib/types";
import styles from "./FigmaOutfitDetail.module.css";

type FigmaOutfitDetailProps = { mode: "create" | "edit"; outfitId?: string };

const TRAYS: { label: string; category: ClothingCategory; glyph: string; color: string }[] = [
  { label: "Tops", category: "Tops", glyph: "▥", color: "#E8CFA8" },
  { label: "Bottoms", category: "Bottoms", glyph: "▤", color: "#C7D9EB" },
  { label: "Shoes", category: "Shoes", glyph: "⌁", color: "#EDC2B8" },
  { label: "More", category: "Accessories", glyph: "＋", color: "#C7D6C2" },
];

function localDateName() {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date());
}

async function imageAspectRatio(blob: Blob) {
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Image could not be read"));
      image.src = url;
    });
    return image.naturalWidth / image.naturalHeight || 1;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function CanvasImage({ item }: { item: ClothingItem }) {
  const url = useObjectUrl(getDisplayImage(item));
  return url ? <img className={styles.piece} src={url} alt={item.name} draggable={false} /> : null;
}

export default function FigmaOutfitDetail({ mode, outfitId }: FigmaOutfitDetailProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasSize = useElementSize(canvasRef);
  const chipDrag = useHorizontalDragScroll<HTMLDivElement>();
  const [pieces, setPieces] = useState<OutfitPiece[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [name, setName] = useState("");
  const [datePlaceholder, setDatePlaceholder] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [category, setCategory] = useState<ClothingCategory>("Tops");
  const [initializedId, setInitializedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const itemsQuery = useLiveQuery(async () => {
    try {
      return { items: await db.clothingItems.orderBy("createdAt").reverse().toArray(), error: "" };
    } catch {
      return { items: [], error: "Your local closet could not be opened in this browser." };
    }
  }, []);
  const outfitQuery = useLiveQuery(async () => {
    try {
      return { outfit: outfitId ? (await db.outfits.get(outfitId)) ?? null : null, error: "" };
    } catch {
      return { outfit: null, error: "The saved outfit database could not be opened." };
    }
  }, [outfitId]);
  const items = itemsQuery?.items;
  const outfit = outfitQuery?.outfit;

  useEffect(() => {
    const timer = window.setTimeout(() => setDatePlaceholder(localDateName()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (mode === "edit" && outfit && initializedId !== outfit.id) {
      // A live database record initializes this local, editable draft once.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(outfit.name);
      setPieces(outfit.pieces);
      setInitializedId(outfit.id);
    }
  }, [initializedId, mode, outfit]);

  const itemMap = useMemo(() => new Map((items ?? []).map((item) => [item.id, item])), [items]);
  const filteredItems = (items ?? []).filter((item) => item.category === category);
  const selected = pieces.find((piece) => piece.instanceId === selectedId);
  const missingOutfit = mode === "edit" && outfitQuery !== undefined && !outfitQuery.error && outfit === null;
  const databaseError = itemsQuery?.error || outfitQuery?.error || "";

  const updatePiece = (instanceId: string, patch: Partial<OutfitPiece>) => {
    setPieces((current) => current.map((piece) => piece.instanceId === instanceId ? { ...piece, ...patch } : piece));
  };

  const addItem = async (item: ClothingItem) => {
    setError("");
    try {
      const aspect = await imageAspectRatio(getDisplayImage(item));
      const widthPct = .34;
      const heightPct = canvasSize.height > 0 ? Math.min(.8, (canvasSize.width * widthPct / aspect) / canvasSize.height) : .34;
      const offsetX = canvasSize.width ? ((pieces.length * 12) % 60) / canvasSize.width : 0;
      const offsetY = canvasSize.height ? ((pieces.length * 12) % 60) / canvasSize.height : 0;
      const instanceId = crypto.randomUUID();
      const layer = pieces.length ? Math.max(...pieces.map((piece) => piece.layer)) + 1 : 0;
      setPieces((current) => [...current, {
        instanceId,
        clothingId: item.id,
        xPct: Math.min(.98 - widthPct, Math.max(0, (1 - widthPct) / 2 + offsetX)),
        yPct: Math.min(.98 - heightPct, Math.max(0, (1 - heightPct) / 2 + offsetY)),
        widthPct,
        heightPct,
        layer,
      }]);
      setSelectedId(instanceId);
    } catch {
      setError("That image could not be added to the canvas.");
    }
  };

  const moveLayer = (direction: "front" | "back") => {
    if (!selected) return;
    const layers = pieces.map((piece) => piece.layer);
    const moved = pieces.map((piece) => piece.instanceId === selected.instanceId ? { ...piece, layer: direction === "front" ? Math.max(...layers) + 1 : Math.min(...layers) - 1 } : piece);
    const normalized = [...moved].sort((a, b) => a.layer - b.layer).map((piece, layer) => ({ ...piece, layer }));
    setPieces(normalized);
  };

  const duplicate = () => {
    if (!selected) return;
    const instanceId = crypto.randomUUID();
    const dx = canvasSize.width ? 12 / canvasSize.width : .03;
    const dy = canvasSize.height ? 12 / canvasSize.height : .03;
    const copy = { ...selected, instanceId, xPct: Math.min(1 - selected.widthPct, selected.xPct + dx), yPct: Math.min(1 - selected.heightPct, selected.yPct + dy), layer: Math.max(...pieces.map((piece) => piece.layer)) + 1 };
    setPieces((current) => [...current, copy]);
    setSelectedId(instanceId);
  };

  const removeSelected = () => {
    if (!selectedId) return;
    setPieces((current) => current.filter((piece) => piece.instanceId !== selectedId));
    setSelectedId(undefined);
  };

  const save = async () => {
    if (!pieces.length) {
      setError("Add at least one clothing item before saving.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const now = Date.now();
      const savedName = name.trim() || datePlaceholder || localDateName();
      if (mode === "edit" && outfit) {
        await db.outfits.put({ ...outfit, name: savedName, pieces, updatedAt: now });
      } else {
        await db.outfits.add({ id: crypto.randomUUID(), name: savedName, pieces, createdAt: now, updatedAt: now });
      }
      router.push("/outfits");
    } catch {
      setError("The outfit could not be saved to local browser storage.");
      setSaving(false);
    }
  };

  const removeOutfit = async () => {
    if (!outfit || !window.confirm(`Delete “${outfit.name}”?`)) return;
    setSaving(true);
    try {
      await db.outfits.delete(outfit.id);
      router.push("/outfits");
    } catch {
      setError("The outfit could not be deleted.");
      setSaving(false);
    }
  };

  return <div data-layer="AUTO / Outfit Detail" className={styles.screen}>
    <header className={styles.header}><div className={styles.brand}>E-CLOSET</div><div className={styles.title}>Outfit Detail</div><div className={styles.subtitle}>Drag, layer, and resize your pieces.</div></header>

    <div ref={canvasRef} data-layer="Outfit canvas" className={styles.canvas} onPointerDown={(event) => { if (event.target === event.currentTarget) setSelectedId(undefined); }}>
      {!pieces.length ? <div className={styles.canvasEmpty}>Choose a category below and add pieces from your closet.</div> : null}
      {pieces.map((piece) => {
        const item = itemMap.get(piece.clothingId);
        if (!item || !canvasSize.width || !canvasSize.height) return null;
        const isSelected = selectedId === piece.instanceId;
        return <Rnd key={piece.instanceId} bounds="parent" lockAspectRatio size={{ width: piece.widthPct * canvasSize.width, height: piece.heightPct * canvasSize.height }} position={{ x: piece.xPct * canvasSize.width, y: piece.yPct * canvasSize.height }} minWidth={44} minHeight={44} style={{ zIndex: piece.layer }} className={isSelected ? styles.selected : ""} enableResizing={isSelected ? { topLeft: true, topRight: true, bottomLeft: true, bottomRight: true, top: false, right: false, bottom: false, left: false } : false} onMouseDown={() => setSelectedId(piece.instanceId)} onTouchStart={() => setSelectedId(piece.instanceId)} onDragStart={() => setSelectedId(piece.instanceId)} onDragStop={(_, data) => updatePiece(piece.instanceId, { xPct: data.x / canvasSize.width, yPct: data.y / canvasSize.height })} onResizeStart={() => setSelectedId(piece.instanceId)} onResizeStop={(_, __, ref, ___, position) => updatePiece(piece.instanceId, { xPct: position.x / canvasSize.width, yPct: position.y / canvasSize.height, widthPct: ref.offsetWidth / canvasSize.width, heightPct: ref.offsetHeight / canvasSize.height })}>
          <CanvasImage item={item} />
        </Rnd>;
      })}
    </div>

    <label className={styles.nameField}>OUTFIT NAME<input className={styles.nameInput} value={name} maxLength={60} placeholder={datePlaceholder || "Date"} onChange={(event) => setName(event.target.value)} /></label>

    <div data-layer="Layer controls" className={styles.controls}>
      <button className={styles.control} type="button" disabled={!selected} onClick={() => moveLayer("front")}>↥ Front</button>
      <button className={styles.control} type="button" disabled={!selected} onClick={() => moveLayer("back")}>↧ Back</button>
      <button className={styles.control} type="button" disabled={!selected} onClick={duplicate}>⧉ Duplicate</button>
      <button className={styles.control} type="button" disabled={!selected} onClick={removeSelected}>× Remove</button>
    </div>

    <section className={`${styles.closetPanel} ${drawerOpen ? styles.closetPanelOpen : ""}`}>
      <div className={styles.panelHeader}><span>ADD FROM CLOSET</span>{drawerOpen ? <button type="button" className={styles.collapse} aria-label="Collapse closet" onClick={() => setDrawerOpen(false)}>⌄</button> : null}</div>
      {!drawerOpen ? <div data-layer="Item tray" className={styles.trays}>{TRAYS.map((tray) => <button key={tray.label} type="button" className={styles.tray} style={{ backgroundColor: tray.color }} onClick={() => { setCategory(tray.category); setDrawerOpen(true); }}><span className={styles.trayGlyph}>{tray.glyph}</span><span className={styles.trayLabel}>{tray.label}</span></button>)}</div> : <>
        <div className={styles.chips} {...chipDrag}>{CLOTHING_CATEGORIES.map((chip) => <button key={chip} type="button" className={`${styles.chip} ${category === chip ? styles.chipActive : ""}`} onClick={() => setCategory(chip)}>{chip}</button>)}</div>
        <div className={styles.drawerGrid}>
          {items === undefined ? <p className={styles.drawerState}>Loading your closet…</p> : null}
          {items?.length === 0 ? <p className={styles.drawerState}>Your closet is empty. <Link href="/items/new">Add an item in Closet.</Link></p> : null}
          {items && items.length > 0 && filteredItems.length === 0 ? <p className={styles.drawerState}>No {category.toLowerCase()} in your closet yet.</p> : null}
          {filteredItems.map((item) => <ClothingCard key={item.id} item={item} onClick={() => void addItem(item)} />)}
        </div>
      </>}
    </section>

    <div className={styles.actions}>
      {mode === "edit" ? <button type="button" className={`${styles.action} ${styles.danger}`} disabled={saving || !outfit} onClick={() => void removeOutfit()}>Delete</button> : <button type="button" className={`${styles.action} ${styles.secondary}`} disabled={saving} onClick={() => router.push("/outfits")}>Cancel</button>}
      <button type="button" className={`${styles.action} ${styles.primary}`} disabled={saving || pieces.length === 0 || missingOutfit || Boolean(databaseError)} onClick={() => void save()}>{saving ? "Saving…" : "Save"}</button>
    </div>
    {databaseError ? <p className={styles.error}>{databaseError}</p> : missingOutfit ? <p className={styles.error}>This outfit no longer exists.</p> : error ? <p className={styles.error} role="status">{error}</p> : null}
    <BottomNavigation active="create" />
  </div>;
}
