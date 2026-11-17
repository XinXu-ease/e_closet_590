import { test, expect, type Page } from "@playwright/test";

const profile = { id: "11111111-1111-4111-8111-111111111111", displayName: "Name", avatarKey: "cat", email: "n***@example.com", phone: "+1 ••• 0123", createdAt: "2026-11-11T00:00:00Z" };

async function seedLocalCloset(page: Page, count = 2, outfits = 1) {
  await page.evaluate(async ({ count, outfits }) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open("e-closet"); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const account = await new Promise<{ activeOwner: string }>((resolve) => { const request = database.transaction("settings").objectStore("settings").get("account"); request.onsuccess = () => resolve(request.result); });
    const bytes = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9XcAAAAASUVORK5CYII="), c => c.charCodeAt(0));
    const image = new Blob([bytes], { type: "image/png" });
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction(["clothingItems", "outfits"], "readwrite");
      for (let i = 0; i < count; i++) tx.objectStore("clothingItems").put({ id: `item-${i}`, ownerId: account.activeOwner, name: `Item ${i}`, category: "Tops", colorTag: "blue", originalImage: image, processedImage: image, createdAt: 1, updatedAt: 2 });
      for (let i = 0; i < outfits; i++) tx.objectStore("outfits").put({ id: `outfit-${i}`, ownerId: account.activeOwner, name: `Outfit ${i}`, createdAt: 1, updatedAt: 2, pieces: [{ instanceId: `piece-${i}`, clothingId: "item-0", xPct: .1, yPct: .2, widthPct: .3, heightPct: .4, layer: 1 }] });
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
    database.close();
  }, { count, outfits });
  await page.reload();
  await expect(page.getByRole("link", { name: `${count} clothing items` })).toBeVisible();
}

test("guest Profile has usable menus and clearly reports unconfigured sign-in", async ({ page }) => {
  await page.route("**/api/me", route => route.fulfill({ json: { profile: null, configured: false, supportEmail: null } }));
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Guest", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "0 clothing items" })).toBeVisible();
  await page.getByRole("button", { name: "Information", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Sign in to save your name");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Log in / Register", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Sign in to save your name and avatar");
  await page.getByRole("dialog").getByRole("button", { name: "Log in / Register", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Account sign-in is not available yet");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.screenshot({ path: ".artifacts/profile-guest.png", fullPage: true });
});

test("Figma Profile uses live totals, local assets and working information/avatar forms", async ({ page }) => {
  let current = { ...profile };
  await page.route("**/api/me", async route => {
    if (route.request().method() === "PATCH") {
      const input = route.request().postDataJSON(); current = { ...current, ...input };
      await route.fulfill({ json: { profile: current } });
    } else await route.fulfill({ json: { profile: current, configured: true, supportEmail: "support@example.com" } });
  });
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Name", exact: true })).toBeVisible();
  await seedLocalCloset(page, 24, 3);
  await page.evaluate(() => document.fonts.ready);
  const images = await page.locator('[data-layer="AUTO / Profile"] img').evaluateAll((nodes) => nodes.map(node => {
    const image = node as HTMLImageElement; const rect = image.getBoundingClientRect();
    return { src: image.getAttribute("src"), loaded: image.complete && image.naturalWidth > 0, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }));
  expect(images.every(image => image.loaded && image.width > 0 && image.height > 0)).toBe(true);
  expect(images.every(image => image.src?.startsWith("/figma/"))).toBe(true);
  await page.screenshot({ path: ".artifacts/profile-design.png", fullPage: true });
  await page.getByRole("button", { name: "Information", exact: true }).click();
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Alex");
  await page.getByRole("button", { name: "Save information" }).click();
  await expect(page.getByRole("status")).toContainText("Your profile has been saved");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.getByRole("heading", { name: "Alex", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Personalize", exact: true })).toHaveCount(0);
});

test("guest settings remains usable and reserves import/export for signed-in accounts", async ({ page }) => {
  await page.route("**/api/me", route => route.fulfill({ json: { profile: null, configured: false, supportEmail: null } }));
  await page.goto("/profile"); await expect(page.getByRole("heading", { name: "Guest", exact: true })).toBeVisible();
  await seedLocalCloset(page);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Sign in to save your name and avatar");
  await expect(page.getByRole("dialog")).not.toContainText("Your closet, on this device");
});

test("email OTP form handles errors, resend cooldown and successful login without moving guest data", async ({ page }) => {
  let signedIn = false;
  await page.route("**/api/me", route => route.fulfill({ json: { profile: signedIn ? profile : null, configured: true, supportEmail: null } }));
  await page.route("**/api/auth/otp/request", route => route.fulfill({ json: { sent: true, retryAfter: 60 } }));
  await page.route("**/api/auth/otp/verify", route => {
    if (route.request().postDataJSON().code !== "123456") return route.fulfill({ status: 400, json: { error: "That code is invalid or has expired." } });
    signedIn = true; return route.fulfill({ json: { profile: { ...profile, setupComplete: false } } });
  });
  await page.goto("/profile"); await expect(page.getByRole("heading", { name: "Guest", exact: true })).toBeVisible();
  await seedLocalCloset(page);
  await page.getByRole("button", { name: "Log in / Register", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Log in / Register", exact: true }).click();
  await page.getByLabel("Email address", { exact: true }).fill("name@example.com");
  await expect(page.getByLabel("Phone number", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await expect(page.getByRole("button", { name: /Resend in/ })).toBeDisabled();
  await page.getByLabel("Verification code").fill("000000");
  await page.getByRole("button", { name: "Verify & continue" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("invalid or has expired");
  await page.getByLabel("Verification code").fill("123456");
  await page.getByRole("button", { name: "Verify & continue" }).click();
  await expect(page.getByRole("heading", { name: "Name", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "0 clothing items" })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("created before signing in");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("link", { name: "2 clothing items" })).toBeVisible();
});

test("item deletion uses the in-app confirmation frame", async ({ page }) => {
  await page.route("**/api/me", route => route.fulfill({ json: { profile: null, configured: false, supportEmail: null } }));
  await page.goto("/profile");
  await seedLocalCloset(page, 1, 0);
  await page.goto("/items/item-0");
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Delete item" })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Delete “Item 0” from your closet?");
  await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("email account reauthenticates before showing deletion confirmation", async ({ page }) => {
  await page.route("**/api/me", route => route.fulfill({ json: { profile: { ...profile, phone: "" }, configured: true, phoneEnabled: false, supportEmail: null } }));
  await page.route("**/api/auth/otp/request", route => {
    expect(route.request().postDataJSON()).toMatchObject({ channel: "email", purpose: "reauthenticate" });
    return route.fulfill({ json: { sent: true, retryAfter: 60 } });
  });
  await page.route("**/api/auth/otp/verify", route => {
    expect(route.request().postDataJSON()).toMatchObject({ channel: "email", purpose: "reauthenticate", code: "123456" });
    return route.fulfill({ json: { profile } });
  });
  await page.goto("/profile");
  await page.getByRole("button", { name: "Information", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("n***@example.com");
  await expect(page.getByRole("button", { name: "Change phone number", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Delete account", exact: true }).click();
  await expect(page.getByRole("button", { name: "Permanently delete my account" })).toHaveCount(0);
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await page.getByLabel("Verification code").fill("123456");
  await page.getByRole("button", { name: "Verify code", exact: true }).click();
  await expect(page.getByRole("button", { name: "Permanently delete my account" })).toBeVisible();
});

test("account API rejects cross-origin changes and unauthenticated profile writes", async ({ request }) => {
  const rejected = await request.patch("/api/me", { headers: { Origin: "https://untrusted.example" }, data: { displayName: "X", avatarKey: "cat" } });
  expect(rejected.status()).toBe(403);
  const unauthenticated = await request.patch("/api/me", { headers: { Origin: "http://127.0.0.1:3100" }, data: { displayName: "X", avatarKey: "cat" } });
  expect(unauthenticated.status()).toBe(401);
  const invalidPhone = await request.post("/api/auth/otp/request", { headers: { Origin: "http://127.0.0.1:3100" }, data: { email: "bad" } });
  expect(invalidPhone.status()).toBe(400);
  const me = await request.get("/api/me"); expect(me.status()).toBe(200);
  expect((await me.json()).profile).toBeNull();
  expect(me.headers()["cache-control"]).toBe("no-store");
});
