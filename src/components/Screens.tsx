"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, PointerEvent as ReactPointerEvent, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronRight,
  ImagePlus,
  Layers3,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { categories, clothes, outfits } from "@/data/demo";

function PageHeader({ title, backHref, action }: { title: string; backHref?: string; action?: React.ReactNode }) {
  return (
    <header className="page-header">
      <div className="header-side">
        {backHref ? <Link className="icon-button" href={backHref} aria-label="Back"><ArrowLeft size={20} /></Link> : <span className="eyebrow">E—WARDROBE</span>}
      </div>
      <h1>{title}</h1>
      <div className="header-side right">{action}</div>
    </header>
  );
}

function ClothingVisual({ glyph, tone, large = false }: { glyph: string; tone: string; large?: boolean }) {
  return <div className={`clothing-visual ${tone} ${large ? "large" : ""}`}><span>{glyph}</span></div>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={19} /></button></div>
        {children}
      </section>
    </div>
  );
}

export function ClosetScreen() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All Items");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => clothes.filter((item) =>
    (category === "All Items" || item.category === category) && item.name.toLowerCase().includes(query.toLowerCase())
  ), [category, query]);

  return (
    <>
      <PageHeader title="Closet" action={<Link className="round-add" href="/items/new" aria-label="Add new item"><Plus size={21} /></Link>} />
      <section className="intro-row"><div><p className="kicker">MY DIGITAL WARDROBE</p><h2>{clothes.length} pieces, ready to play.</h2></div><span className="scribble">↝</span></section>
      <label className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search / Filter" /><SlidersHorizontal size={17} /></label>
      <div className="chip-scroll" aria-label="Categories">
        {categories.map((item) => <button onClick={() => setCategory(item)} className={item === category ? "chip selected" : "chip"} key={item}>{item}</button>)}
      </div>
      <div className="section-heading"><h2>{category}</h2><span>{filtered.length}</span></div>
      {filtered.length ? (
        <div className="item-grid">
          {filtered.map((item) => (
            <Link className="item-card" href={`/items/${item.id}`} key={item.id}>
              <ClothingVisual glyph={item.glyph} tone={item.tone} />
              <strong>{item.name}</strong><span>{item.category}</span>
            </Link>
          ))}
        </div>
      ) : <div className="empty-state"><Search size={28} /><h3>No matching items</h3><p>Try another category or search.</p></div>}
    </>
  );
}

export function AddItemScreen() {
  const router = useRouter();
  const [preview, setPreview] = useState<string>();
  const [processing, setProcessing] = useState(false);
  const [clipped, setClipped] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Tops");

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setClipped(false);
  }

  function removeBackground() {
    setProcessing(true);
    window.setTimeout(() => { setProcessing(false); setClipped(true); }, 900);
  }

  return (
    <>
      <PageHeader title="Add New Item" backHref="/closet" />
      <div className="step-line"><span className="done">1</span><i /><span className={preview ? "done" : ""}>2</span><i /><span className={clipped ? "done" : ""}>3</span></div>
      <p className="step-caption">Upload · Remove background · Details</p>
      <section className={clipped ? "upload-panel clipped" : "upload-panel"}>
        {preview ? <img src={preview} alt="Selected clothing preview" /> : <><ImagePlus size={34} /><h2>Upload clothing photo</h2><p>Use a clean, contrasting background for the best cutout.</p></>}
        <label className="button secondary"><Upload size={17} />{preview ? "Choose another" : "Choose from Photos"}<input type="file" accept="image/*" onChange={handleUpload} hidden /></label>
      </section>
      {preview && (
        <button className="button full" onClick={removeBackground} disabled={processing}>
          <Sparkles size={17} />{processing ? "Removing background…" : clipped ? "Background removed" : "Remove background"}
        </button>
      )}
      <div className="form-stack">
        <label><span>Item name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Black linen shirt" /></label>
        <label><span>Category</span><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <div className="sticky-actions"><button className="button ghost" onClick={() => router.push("/closet")}>Cancel</button><button className="button" disabled={!preview || !clipped || !name.trim()} onClick={() => router.push("/closet")}><Check size={17} />Save Item</button></div>
    </>
  );
}

export function ItemDetailScreen() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const item = clothes[0];
  return (
    <>
      <PageHeader title="Item Detail" backHref="/closet" action={<button className="icon-button" onClick={() => setEditing(true)}><MoreHorizontal size={20} /></button>} />
      <section className="detail-hero"><span className="tape tape-a" /><span className="tape tape-b" /><ClothingVisual glyph={item.glyph} tone={item.tone} large /><span className="hand-note">favorite basic ↗</span></section>
      <section className="detail-copy"><p className="kicker">{item.category}</p><h2>{item.name}</h2><p>Added today · Sticker-like cutout</p></section>
      <div className="detail-actions"><Link className="button full" href="/create"><Layers3 size={17} />Add to Outfit</Link><button className="button secondary full" onClick={() => setEditing(true)}>Edit Item</button><button className="text-danger" onClick={() => setDeleting(true)}><Trash2 size={16} />Delete Item</button></div>
      {editing && <Modal title="Edit Item" onClose={() => setEditing(false)}><div className="form-stack"><label><span>Item name</span><input defaultValue={item.name} /></label><label><span>Category</span><select defaultValue={item.category}>{categories.slice(1).map((c) => <option key={c}>{c}</option>)}</select></label></div><button className="button full" onClick={() => setEditing(false)}>Save changes</button></Modal>}
      {deleting && <Modal title="Delete this item?" onClose={() => setDeleting(false)}><p className="modal-copy">This item will be removed from your Closet.</p><div className="modal-actions"><button className="button ghost" onClick={() => setDeleting(false)}>Keep item</button><button className="button danger" onClick={() => router.push("/closet")}>Delete</button></div></Modal>}
    </>
  );
}

type CanvasPiece = { id: string; glyph: string; tone: string; x: number; y: number; layer: number; scale: number };

export function CreateOutfitScreen() {
  const router = useRouter();
  const boardRef = useRef<HTMLDivElement>(null);
  const nextPieceId = useRef(0);
  const [pieces, setPieces] = useState<CanvasPiece[]>([]);
  const [selected, setSelected] = useState<string>();
  const [saving, setSaving] = useState(false);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);

  function addPiece(item: (typeof clothes)[number]) {
    nextPieceId.current += 1;
    const id = `${item.id}-${nextPieceId.current}`;
    setPieces((current) => [...current, { id, glyph: item.glyph, tone: item.tone, x: 120, y: 115, layer: current.length, scale: 1 }]);
    setSelected(id);
  }

  function pointerDown(event: ReactPointerEvent, piece: CanvasPiece) {
    const rect = event.currentTarget.getBoundingClientRect();
    dragRef.current = { id: piece.id, dx: event.clientX - rect.left, dy: event.clientY - rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(piece.id);
  }

  function pointerMove(event: ReactPointerEvent) {
    if (!dragRef.current || !boardRef.current) return;
    const board = boardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(board.width - 82, event.clientX - board.left - dragRef.current.dx));
    const y = Math.max(0, Math.min(board.height - 82, event.clientY - board.top - dragRef.current.dy));
    setPieces((current) => current.map((p) => p.id === dragRef.current?.id ? { ...p, x, y } : p));
  }

  function updateSelected(update: (piece: CanvasPiece) => CanvasPiece) {
    setPieces((current) => current.map((piece) => piece.id === selected ? update(piece) : piece));
  }

  return (
    <>
      <PageHeader title="Create Outfit" action={<button className="icon-button" onClick={() => setPieces([])}><RotateCcw size={19} /></button>} />
      <div className="canvas-toolbar"><span>MATCHING CANVAS</span><span>{pieces.length} items</span></div>
      <div className="outfit-board" ref={boardRef} onPointerMove={pointerMove} onPointerUp={() => { dragRef.current = null; }}>
        <span className="board-grid" />
        {!pieces.length && <div className="board-empty"><Plus size={27} /><h3>Build today’s look</h3><p>Tap an item below, then drag it around.</p></div>}
        {pieces.map((piece) => <button key={piece.id} onPointerDown={(e) => pointerDown(e, piece)} className={`canvas-piece ${piece.tone} ${selected === piece.id ? "selected" : ""}`} style={{ left: piece.x, top: piece.y, zIndex: piece.layer, transform: `scale(${piece.scale})` }}>{piece.glyph}</button>)}
      </div>
      <div className="layer-controls">
        <button disabled={!selected} onClick={() => updateSelected((p) => ({ ...p, layer: p.layer + 1 }))}><ArrowUp size={16} />Forward</button>
        <button disabled={!selected} onClick={() => updateSelected((p) => ({ ...p, scale: Math.min(1.5, p.scale + .1) }))}>＋ Size</button>
        <button disabled={!selected} onClick={() => setPieces((current) => current.filter((p) => p.id !== selected))}><Trash2 size={16} />Remove</button>
      </div>
      <div className="tray-heading"><div><p className="kicker">CATEGORY / ITEM TRAY</p><h2>Add a piece</h2></div><span>Swipe →</span></div>
      <div className="item-tray">{clothes.map((item) => <button key={item.id} onClick={() => addPiece(item)}><ClothingVisual glyph={item.glyph} tone={item.tone} /><span>{item.category}</span></button>)}</div>
      <button className="button full save-outfit" disabled={!pieces.length} onClick={() => setSaving(true)}>Save Outfit</button>
      {saving && <Modal title="Save Outfit" onClose={() => setSaving(false)}><div className="form-stack"><label><span>Outfit name</span><input autoFocus placeholder="e.g. Monday layers" /></label></div><button className="button full" onClick={() => router.push("/outfits/slow-sunday")}><Check size={17} />Save Outfit</button></Modal>}
    </>
  );
}

function OutfitPreview({ pieces, large = false }: { pieces: string[]; large?: boolean }) {
  return <div className={large ? "outfit-preview large" : "outfit-preview"}>{pieces.map((piece, index) => <span style={{ transform: `rotate(${index * 7 - 7}deg)`, zIndex: index }} key={`${piece}-${index}`}>{piece}</span>)}</div>;
}

export function SavedOutfitsScreen() {
  return (
    <>
      <PageHeader title="Saved Outfits" action={<Link className="round-add" href="/create"><Plus size={21} /></Link>} />
      <section className="intro-row"><div><p className="kicker">YOUR OUTFIT JOURNAL</p><h2>Looks worth repeating.</h2></div><span className="scribble">✦</span></section>
      <div className="outfit-grid">{outfits.map((outfit) => <Link className="outfit-card" href={`/outfits/${outfit.id}`} key={outfit.id}><OutfitPreview pieces={outfit.pieces} /><strong>{outfit.name}</strong><span>{outfit.note}</span></Link>)}</div>
      <Link className="dashed-card" href="/create"><Plus size={22} /><span>Create Outfit</span></Link>
    </>
  );
}

export function OutfitDetailScreen() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const outfit = outfits[0];
  return (
    <>
      <PageHeader title="Outfit Detail" backHref="/outfits" />
      <OutfitPreview pieces={outfit.pieces} large />
      <section className="detail-copy centered"><p className="kicker">SAVED TODAY</p><h2>{outfit.name}</h2><p>A relaxed combination for an unhurried day.</p></section>
      <div className="piece-list">{[clothes[0], clothes[1], clothes[2]].map((item) => <div key={item.id}><ClothingVisual glyph={item.glyph} tone={item.tone} /><span><strong>{item.name}</strong><small>{item.category}</small></span><ChevronRight size={18} /></div>)}</div>
      <div className="detail-actions"><Link className="button full" href="/create">Edit Outfit</Link><Link className="button secondary full" href="/create">Reopen in Matching Canvas</Link><button className="text-danger" onClick={() => setDeleting(true)}><Trash2 size={16} />Delete Outfit</button></div>
      {deleting && <Modal title="Delete this outfit?" onClose={() => setDeleting(false)}><p className="modal-copy">The saved outfit will be removed from your gallery.</p><div className="modal-actions"><button className="button ghost" onClick={() => setDeleting(false)}>Keep outfit</button><button className="button danger" onClick={() => router.push("/outfits")}>Delete</button></div></Modal>}
    </>
  );
}

export function SettingsScreen() {
  const [theme, setTheme] = useState("System");
  const [confirm, setConfirm] = useState(true);
  const [clearModal, setClearModal] = useState(false);
  return (
    <>
      <PageHeader title="Me / Settings" />
      <section className="profile-card"><div className="profile-mark">E</div><div><p className="kicker">LOCAL WARDROBE</p><h2>Your private style space</h2><p>Stored on this device.</p></div></section>
      <div className="settings-group"><p className="kicker">PREFERENCES</p><label className="setting-row"><span><strong>Theme</strong><small>Light, dark, or system</small></span><select value={theme} onChange={(e) => setTheme(e.target.value)}><option>System</option><option>Light</option><option>Dark</option></select></label><label className="setting-row"><span><strong>Confirm before deleting</strong><small>Items and saved outfits</small></span><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} /></label></div>
      <div className="settings-group"><p className="kicker">LOCAL DATA</p><div className="storage-card"><div><span>Storage used</span><strong>18.4 MB</strong></div><div className="storage-bar"><i /></div><small>Photos and outfits are stored in this browser.</small></div><button className="setting-link">Export local data<ChevronRight size={18} /></button><button className="setting-link">Import local data<ChevronRight size={18} /></button><button className="setting-link danger-text" onClick={() => setClearModal(true)}>Clear all local data<Trash2 size={17} /></button></div>
      <p className="version-note">E-Wardrobe · Low-fidelity prototype · v0.1</p>
      {clearModal && <Modal title="Clear all local data?" onClose={() => setClearModal(false)}><p className="modal-copy">Clothes and saved outfits will be removed from this device. This cannot be undone.</p><div className="modal-actions"><button className="button ghost" onClick={() => setClearModal(false)}>Cancel</button><button className="button danger" onClick={() => setClearModal(false)}>Clear data</button></div></Modal>}
    </>
  );
}
