import { localId } from "./local-id";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { db, wardrobeFor, type EClosetDatabase } from "./db";
import { CLOTHING_CATEGORIES, TAPE_COLORS, type ClothingItem, type Outfit, type OutfitPiece } from "./types";

const MAX_BYTES = 100 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
type ArchiveItem = Omit<ClothingItem, "ownerId" | "originalImage" | "processedImage"> & { original: string; originalType: string; processed?: string; processedType?: string };
type ArchiveOutfit = Omit<Outfit, "ownerId">;
export type WardrobeImport = { items: Omit<ClothingItem, "ownerId">[]; outfits: ArchiveOutfit[] };

export async function exportWardrobe(ownerId: string, database: EClosetDatabase = db) {
  const wardrobe = wardrobeFor(ownerId, database);
  const snapshot = await database.transaction("r", database.clothingItems, database.outfits, async () => ({ items: await wardrobe.items(), outfits: await wardrobe.outfits() }));
  const files: Record<string, Uint8Array> = {};
  const items: ArchiveItem[] = [];
  let size = 0;
  for (const item of snapshot.items) {
    const original = `images/${item.id}-original`;
    const processed = item.processedImage ? `images/${item.id}-processed` : undefined;
    size += item.originalImage.size + (item.processedImage?.size ?? 0);
    if (size > MAX_BYTES) throw new Error("This closet is larger than the 100 MB export limit.");
    files[original] = new Uint8Array(await item.originalImage.arrayBuffer());
    if (processed && item.processedImage) files[processed] = new Uint8Array(await item.processedImage.arrayBuffer());
    items.push({ id: item.id, name: item.name, category: item.category, colorTag: item.colorTag, createdAt: item.createdAt, updatedAt: item.updatedAt, original, originalType: item.originalImage.type, processed, processedType: item.processedImage?.type });
  }
  const outfits = snapshot.outfits.map(({ id, name, pieces, createdAt, updatedAt }) => ({ id, name, pieces, createdAt, updatedAt }));
  files["manifest.json"] = strToU8(JSON.stringify({ format: "e-closet", version: 1, items, outfits }));
  const bytes = zipSync(files, { level: 0 });
  if (bytes.byteLength > MAX_BYTES) throw new Error("This closet is larger than the 100 MB export limit.");
  return new Blob([new Uint8Array(bytes)], { type: "application/zip" });
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("The archive contains an invalid record.");
  return value as Record<string, unknown>;
}
function text(value: unknown, max = 200): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error("The archive contains invalid text.");
  return value;
}
function number(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new Error("The archive contains an invalid number.");
  return value;
}

export async function inspectArchive(file: Blob): Promise<WardrobeImport> {
  if (file.size > MAX_BYTES) throw new Error("Choose an archive smaller than 100 MB.");
  let files: Record<string, Uint8Array>;
  let expanded = 0;
  let count = 0;
  try {
    files = unzipSync(new Uint8Array(await file.arrayBuffer()), { filter: (entry) => {
      expanded += entry.originalSize;
      if (++count > 4001 || !Number.isFinite(expanded) || expanded > MAX_BYTES || entry.name.includes("..") || entry.name.includes("\\") || entry.name.startsWith("/")) throw new Error();
      if (entry.name !== "manifest.json" && !/^images\/[a-zA-Z0-9_-]+$/.test(entry.name)) throw new Error();
      return true;
    } });
  } catch { throw new Error("This archive is invalid or exceeds the size limit."); }
  const manifest = files["manifest.json"];
  if (!manifest || manifest.length > 2 * 1024 * 1024) throw new Error("The archive has no valid manifest.");
  let root: Record<string, unknown>;
  try { root = object(JSON.parse(strFromU8(manifest))); } catch { throw new Error("The archive manifest could not be read."); }
  if (root.format !== "e-closet" || root.version !== 1 || !Array.isArray(root.items) || !Array.isArray(root.outfits) || root.items.length > 2000 || root.outfits.length > 2000) throw new Error("This archive version is not supported.");
  const ids = new Set<string>();
  function image(path: unknown, type: unknown) {
    const name = text(path);
    const mime = text(type);
    const bytes = files[name];
    if (!name.startsWith("images/") || !bytes?.length || bytes.length > 10 * 1024 * 1024 || !IMAGE_TYPES.includes(mime)) throw new Error("An image is missing, too large, or unsupported.");
    const png = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp = strFromU8(bytes.subarray(0, 4)) === "RIFF" && strFromU8(bytes.subarray(8, 12)) === "WEBP";
    if (!(mime === "image/png" && png || mime === "image/jpeg" && jpeg || mime === "image/webp" && webp)) throw new Error("An image does not match its declared format.");
    return new Blob([new Uint8Array(bytes)], { type: mime });
  }
  const items = root.items.map((value) => {
    const i = object(value);
    const id = text(i.id);
    if (ids.has(id)) throw new Error("The archive contains duplicate clothing IDs.");
    ids.add(id);
    if (!CLOTHING_CATEGORIES.includes(i.category as ClothingItem["category"]) || !TAPE_COLORS.includes(i.colorTag as ClothingItem["colorTag"])) throw new Error("An item has an invalid category or color.");
    return { id, name: text(i.name, 60), category: i.category as ClothingItem["category"], colorTag: i.colorTag as ClothingItem["colorTag"], originalImage: image(i.original, i.originalType), processedImage: i.processed ? image(i.processed, i.processedType) : undefined, createdAt: number(i.createdAt), updatedAt: number(i.updatedAt) };
  });
  const outfitIds = new Set<string>();
  const outfits = root.outfits.map((value) => {
    const o = object(value);
    const id = text(o.id);
    if (outfitIds.has(id)) throw new Error("The archive contains duplicate outfit IDs.");
    outfitIds.add(id);
    if (!Array.isArray(o.pieces) || o.pieces.length > 500) throw new Error("An outfit contains too many pieces.");
    const instanceIds = new Set<string>();
    const pieces: OutfitPiece[] = o.pieces.map((value) => {
      const p = object(value);
      const clothingId = text(p.clothingId);
      const instanceId = text(p.instanceId);
      if (!ids.has(clothingId) || instanceIds.has(instanceId)) throw new Error("An outfit has a missing clothing reference or duplicate piece.");
      instanceIds.add(instanceId);
      return { instanceId, clothingId, xPct: number(p.xPct, -2, 2), yPct: number(p.yPct, -2, 2), widthPct: number(p.widthPct, 0.00001, 2), heightPct: number(p.heightPct, 0.00001, 2), layer: number(p.layer, -10000, 10000) };
    });
    return { id, name: text(o.name, 200), pieces, createdAt: number(o.createdAt), updatedAt: number(o.updatedAt) };
  });
  return { items, outfits };
}

export async function importWardrobe(ownerId: string, archive: WardrobeImport, database: EClosetDatabase = db) {
  const remap = new Map(archive.items.map((item) => [item.id, localId()]));
  await database.transaction("rw", database.settings, database.clothingItems, database.outfits, async () => {
    if ((await database.settings.get("account"))?.activeOwner !== ownerId) throw new Error("Your account changed. Choose the archive again.");
    await database.clothingItems.bulkAdd(archive.items.map((item) => ({ ...item, id: remap.get(item.id)!, ownerId })));
    await database.outfits.bulkAdd(archive.outfits.map((outfit) => ({ ...outfit, id: localId(), ownerId, pieces: outfit.pieces.map((piece) => ({ ...piece, instanceId: localId(), clothingId: remap.get(piece.clothingId)! })) })));
  });
}
