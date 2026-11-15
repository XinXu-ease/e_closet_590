import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import { test } from "node:test";
import Dexie from "dexie";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { activateProfile, EClosetDatabase, localAccount, wardrobeFor } from "../src/lib/db";
import { exportWardrobe, importWardrobe, inspectArchive } from "../src/lib/wardrobe-archive";
import { phoneNumber, profileInput, type Profile } from "../src/lib/profile";
import { localId } from "../src/lib/local-id";

test("LAN browsers without randomUUID can initialize and upgrade without losing data", async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis.crypto, "randomUUID");
  const name = `lan-${crypto.randomUUID()}`;
  const fresh = new EClosetDatabase(`${name}-fresh`);
  const old = new Dexie(name);
  old.version(1).stores({ clothingItems: "&id, name, category, colorTag, createdAt, updatedAt", outfits: "&id, name, createdAt, updatedAt" });
  await old.table("clothingItems").add(item());
  await old.table("outfits").add(outfit());
  old.close();
  const upgraded = new EClosetDatabase(name);
  Object.defineProperty(globalThis.crypto, "randomUUID", { configurable: true, value: undefined });
  try {
    assert.match(localId(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.notEqual(localId(), localId());
    assert.match((await localAccount(fresh)).activeOwner, /^guest:/);
    const account = await localAccount(upgraded);
    const wardrobe = wardrobeFor(account.activeOwner, upgraded);
    assert.deepEqual(await (await wardrobe.item("shirt"))!.originalImage.arrayBuffer(), await png.arrayBuffer());
    assert.equal((await wardrobe.outfit("look"))?.pieces[0].clothingId, "shirt");
    const archive = await inspectArchive(await exportWardrobe(account.activeOwner, upgraded));
    await importWardrobe(account.activeOwner, archive, upgraded);
    assert.equal((await wardrobe.items()).length, 2);
  } finally {
    if (descriptor) Object.defineProperty(globalThis.crypto, "randomUUID", descriptor);
    else Reflect.deleteProperty(globalThis.crypto, "randomUUID");
    await fresh.delete(); await upgraded.delete();
  }
});

const png = new Blob([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9XcAAAAASUVORK5CYII=", "base64")], { type: "image/png" });
const item = (id = "shirt") => ({ id, name: "Blue shirt", category: "Tops" as const, colorTag: "blue" as const, originalImage: png, processedImage: png, createdAt: 1, updatedAt: 2 });
const outfit = (clothingId = "shirt") => ({ id: "look", name: "Sunday", createdAt: 1, updatedAt: 2, pieces: [{ instanceId: "piece", clothingId, xPct: .1, yPct: .2, widthPct: .3, heightPct: .4, layer: 1 }] });
const profile = (id: string): Profile => ({ id, displayName: id, avatarKey: "cat", phone: "+1 ••• 0123", createdAt: "2026-11-11T00:00:00Z" });
async function setup() { const db = new EClosetDatabase(`test-${crypto.randomUUID()}`); const account = await localAccount(db); return { db, account, wardrobe: wardrobeFor(account.activeOwner, db) }; }

test("v1 upgrade preserves photos, IDs and outfit references in a guest partition", async () => {
  const name = `migration-${crypto.randomUUID()}`;
  const old = new Dexie(name);
  old.version(1).stores({ clothingItems: "&id, name, category, colorTag, createdAt, updatedAt", outfits: "&id, name, createdAt, updatedAt" });
  await old.table("clothingItems").add(item()); await old.table("outfits").add(outfit()); old.close();
  const db = new EClosetDatabase(name);
  try {
    const account = await localAccount(db);
    assert.match(account.activeOwner, /^guest:/);
    const wardrobe = wardrobeFor(account.activeOwner, db);
    assert.equal((await wardrobe.item("shirt"))?.ownerId, account.activeOwner);
    assert.deepEqual(await (await wardrobe.item("shirt"))!.originalImage.arrayBuffer(), await png.arrayBuffer());
    assert.equal((await wardrobe.outfit("look"))?.pieces[0].clothingId, "shirt");
  } finally { await db.delete(); }
});

test("guest claiming is explicit; switching accounts rejects reads, overwrites and stale writes", async () => {
  const { db, account, wardrobe } = await setup();
  try {
    await wardrobe.saveItem(item(), true); await wardrobe.saveOutfit(outfit(), true);
    await activateProfile(profile("alice"), db);
    const alice = wardrobeFor("user:alice", db);
    assert.equal((await alice.items()).length, 0);
    await alice.claimGuest();
    assert.equal((await alice.items()).length, 1);
    assert.equal((await wardrobe.items()).length, 0);
    await activateProfile(profile("bob"), db);
    const bob = wardrobeFor("user:bob", db);
    assert.equal(await bob.item("shirt"), undefined);
    assert.equal(await bob.outfit("look"), undefined);
    await assert.rejects(bob.saveItem(item()), /overwritten/);
    await assert.rejects(bob.deleteItem("shirt"), /not in/);
    await assert.rejects(bob.saveOutfit({ ...outfit(), id: "bob-look" }, true), /no longer/);
    await assert.rejects(alice.saveItem(item("stale"), true), /account changed/);
    await activateProfile(null, db);
    assert.equal((await localAccount(db)).activeOwner, account.guestOwner);
    await activateProfile(profile("alice"), db);
    await alice.deleteItem("shirt");
    assert.equal((await alice.outfit("look"))?.pieces.length, 0);
  } finally { await db.delete(); }
});

test("archive round trip preserves images and geometry, remaps IDs and contains no account data", async () => {
  const { db, account, wardrobe } = await setup();
  try {
    await wardrobe.saveItem(item(), true); await wardrobe.saveOutfit(outfit(), true);
    const archive = await exportWardrobe(account.activeOwner, db);
    const files = unzipSync(new Uint8Array(await archive.arrayBuffer()));
    const manifest = strFromU8(files["manifest.json"]);
    assert.equal(manifest.includes("ownerId"), false);
    assert.equal(manifest.includes("phone"), false);
    const imported = await inspectArchive(archive);
    await importWardrobe(account.activeOwner, imported, db);
    const items = await wardrobe.items(); const outfits = await wardrobe.outfits();
    assert.equal(items.length, 2); assert.equal(outfits.length, 2);
    const newItem = items.find((i) => i.id !== "shirt")!;
    const newOutfit = outfits.find((o) => o.id !== "look")!;
    assert.equal(newOutfit.pieces[0].clothingId, newItem.id);
    assert.equal(newOutfit.pieces[0].xPct, .1);
    assert.deepEqual(await newItem.originalImage.arrayBuffer(), await png.arrayBuffer());
  } finally { await db.delete(); }
});

test("invalid archives and cross-account imports do not mutate local data", async () => {
  const { db, account, wardrobe } = await setup();
  try {
    await wardrobe.saveItem(item(), true); await wardrobe.saveOutfit(outfit(), true);
    const exported = await exportWardrobe(account.activeOwner, db);
    const files = unzipSync(new Uint8Array(await exported.arrayBuffer()));
    const manifest = JSON.parse(strFromU8(files["manifest.json"]));
    manifest.outfits[0].pieces[0].clothingId = "not-in-archive";
    files["manifest.json"] = strToU8(JSON.stringify(manifest));
    await assert.rejects(inspectArchive(new Blob([new Uint8Array(zipSync(files))])), /missing clothing reference/);
    await assert.rejects(inspectArchive(new Blob([new Uint8Array(zipSync({ "../image.png": new Uint8Array([1]) }))])), /invalid/);
    await assert.rejects(inspectArchive(new Blob(["not a zip"])), /invalid/);
    const valid = await inspectArchive(exported);
    await activateProfile(profile("bob"), db);
    await assert.rejects(importWardrobe(account.activeOwner, valid, db), /account changed/);
    assert.equal(await db.clothingItems.count(), 1);
  } finally { await db.delete(); }
});

test("phone and profile inputs reject malformed values", () => {
  assert.equal(phoneNumber("+1 (212) 555-0123"), "+12125550123");
  assert.equal(phoneNumber("+86 13800138000"), "+8613800138000");
  assert.throws(() => phoneNumber("2125550123"));
  assert.throws(() => phoneNumber("+00000000"));
  assert.throws(() => profileInput({ displayName: "x".repeat(41), avatarKey: "cat" }));
  assert.throws(() => profileInput({ displayName: "A", avatarKey: "https://example.com/tracker" }));
  assert.deepEqual(profileInput({ displayName: " Alice ", avatarKey: "cat" }), { displayName: "Alice", avatarKey: "cat" });
});
