import Dexie, { type EntityTable } from "dexie";
import type { ClothingItem, Outfit } from "./types";

class EClosetDatabase extends Dexie {
  clothingItems!: EntityTable<ClothingItem, "id">;
  outfits!: EntityTable<Outfit, "id">;

  constructor() {
    super("e-closet");
    this.version(1).stores({
      clothingItems: "&id, name, category, colorTag, createdAt, updatedAt",
      outfits: "&id, name, createdAt, updatedAt",
    });
  }
}

export const db = new EClosetDatabase();

export async function deleteClothingItemCascade(itemId: string) {
  await db.transaction("rw", db.clothingItems, db.outfits, async () => {
    await db.clothingItems.delete(itemId);
    const outfits = await db.outfits.toArray();

    await Promise.all(
      outfits.map(async (outfit) => {
        const pieces = outfit.pieces.filter(
          (piece) => piece.clothingId !== itemId,
        );
        if (pieces.length !== outfit.pieces.length) {
          await db.outfits.put({
            ...outfit,
            pieces,
            updatedAt: Date.now(),
          });
        }
      }),
    );
  });
}

