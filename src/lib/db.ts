import { localId } from "./local-id";
import Dexie, { type EntityTable } from "dexie";
import type { ClothingItem, ColorTagId, Outfit } from "./types";
import type { Profile } from "./profile";

export type LocalAccount = {
  key: "account";
  guestOwner: string;
  activeOwner: string;
  profile: Profile | null;
};

const LEGACY_TAPE_COLORS: Record<string, ColorTagId> = {
  red: "red",
  rose: "red",
  sand: "orange",
  lime: "yellow",
  green: "green",
  blue: "blue",
  purple: "purple",
};

export class EClosetDatabase extends Dexie {
  clothingItems!: EntityTable<ClothingItem, "id">;
  outfits!: EntityTable<Outfit, "id">;
  settings!: EntityTable<LocalAccount, "key">;

  constructor(name = "e-closet") {
    super(name);
    this.version(1).stores({
      clothingItems: "&id, name, category, colorTag, createdAt, updatedAt",
      outfits: "&id, name, createdAt, updatedAt",
    });
    this.version(2).stores({
      clothingItems: "&id, ownerId, [ownerId+createdAt], [ownerId+updatedAt], name, category, colorTag, createdAt, updatedAt",
      outfits: "&id, ownerId, [ownerId+updatedAt], name, createdAt, updatedAt",
      settings: "&key",
    }).upgrade(async (tx) => {
      const guestOwner = `guest:${localId()}`;
      await tx.table("settings").put({ key: "account", guestOwner, activeOwner: guestOwner, profile: null });
      await tx.table("clothingItems").toCollection().modify({ ownerId: guestOwner });
      await tx.table("outfits").toCollection().modify({ ownerId: guestOwner });
    });
    this.version(3).stores({
      clothingItems: "&id, ownerId, [ownerId+createdAt], [ownerId+updatedAt], name, category, colorTag, createdAt, updatedAt",
      outfits: "&id, ownerId, [ownerId+updatedAt], name, createdAt, updatedAt",
      settings: "&key",
    }).upgrade(async (tx) => {
      await tx.table("clothingItems").toCollection().modify((item: ClothingItem) => {
        item.colorTag = LEGACY_TAPE_COLORS[item.colorTag] ?? "red";
      });
    });
  }
}

export const db = new EClosetDatabase();

export async function localAccount(database = db): Promise<LocalAccount> {
  return database.transaction("rw", database.settings, async () => {
    const existing = await database.settings.get("account");
    if (existing) return existing;
    const guestOwner = `guest:${localId()}`;
    const account: LocalAccount = { key: "account", guestOwner, activeOwner: guestOwner, profile: null };
    await database.settings.add(account);
    return account;
  });
}

export async function activateProfile(profile: Profile | null, database = db) {
  await localAccount(database);
  return database.transaction("rw", database.settings, async () => {
    const account = (await database.settings.get("account"))!;
    const next = { ...account, activeOwner: profile ? `user:${profile.id}` : account.guestOwner, profile };
    await database.settings.put(next);
    return next;
  });
}

export function wardrobeFor(ownerId: string, database = db) {
  async function assertActive() {
    const state = await database.settings.get("account");
    if (!ownerId || state?.activeOwner !== ownerId) throw new Error("Your account changed. Reopen this screen before saving.");
  }
  async function ownItem(id: string) {
    const item = await database.clothingItems.get(id);
    return item?.ownerId === ownerId ? item : undefined;
  }
  async function ownOutfit(id: string) {
    const outfit = await database.outfits.get(id);
    return outfit?.ownerId === ownerId ? outfit : undefined;
  }
  return {
    items: async () => (await database.clothingItems.where("ownerId").equals(ownerId).toArray()).sort((a, b) => b.createdAt - a.createdAt),
    outfits: async () => (await database.outfits.where("ownerId").equals(ownerId).toArray()).sort((a, b) => b.updatedAt - a.updatedAt),
    item: ownItem,
    outfit: ownOutfit,
    saveItem: (item: Omit<ClothingItem, "ownerId">, create = false) => database.transaction("rw", database.settings, database.clothingItems, async () => {
      await assertActive();
      const existing = await database.clothingItems.get(item.id);
      if (existing && (create || existing.ownerId !== ownerId)) throw new Error("This item cannot be overwritten.");
      if (!create && !existing) throw new Error("This item no longer exists.");
      await database.clothingItems.put({ ...item, ownerId });
    }),
    saveOutfit: (outfit: Omit<Outfit, "ownerId">, create = false) => database.transaction("rw", database.settings, database.clothingItems, database.outfits, async () => {
      await assertActive();
      const existing = await database.outfits.get(outfit.id);
      if (existing && (create || existing.ownerId !== ownerId)) throw new Error("This outfit cannot be overwritten.");
      if (!create && !existing) throw new Error("This outfit no longer exists.");
      for (const piece of outfit.pieces) if (!await ownItem(piece.clothingId)) throw new Error("An item in this outfit is no longer in your closet.");
      await database.outfits.put({ ...outfit, ownerId });
    }),
    deleteItem: (id: string) => database.transaction("rw", database.settings, database.clothingItems, database.outfits, async () => {
      await assertActive();
      if (!await ownItem(id)) throw new Error("This item is not in your closet.");
      await database.clothingItems.delete(id);
      await database.outfits.where("ownerId").equals(ownerId).modify((outfit) => {
        if (outfit.pieces.some((p) => p.clothingId === id)) {
          outfit.pieces = outfit.pieces.filter((p) => p.clothingId !== id);
          outfit.updatedAt = Date.now();
        }
      });
    }),
    deleteOutfit: (id: string) => database.transaction("rw", database.settings, database.outfits, async () => {
      await assertActive();
      if (!await ownOutfit(id)) throw new Error("This outfit is not in your closet.");
      await database.outfits.delete(id);
    }),
    clear: () => database.transaction("rw", database.settings, database.clothingItems, database.outfits, async () => {
      await assertActive();
      await database.clothingItems.where("ownerId").equals(ownerId).delete();
      await database.outfits.where("ownerId").equals(ownerId).delete();
    }),
    claimGuest: () => database.transaction("rw", database.settings, database.clothingItems, database.outfits, async () => {
      await assertActive();
      if (!ownerId.startsWith("user:")) throw new Error("Sign in before importing your guest closet.");
      const state = (await database.settings.get("account"))!;
      await database.clothingItems.where("ownerId").equals(state.guestOwner).modify({ ownerId });
      await database.outfits.where("ownerId").equals(state.guestOwner).modify({ ownerId });
    }),
    clearGuest: () => database.transaction("rw", database.settings, database.clothingItems, database.outfits, async () => {
      await assertActive();
      const state = (await database.settings.get("account"))!;
      await database.clothingItems.where("ownerId").equals(state.guestOwner).delete();
      await database.outfits.where("ownerId").equals(state.guestOwner).delete();
    }),
  };
}

