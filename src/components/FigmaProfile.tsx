"use client";
/* eslint-disable @next/next/no-img-element -- Figma collage assets and local preset avatars use precise image geometry. */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { api } from "@/lib/api-client";
import { AVATARS, type AvatarKey, type Profile } from "@/lib/profile";
import { exportWardrobe, importWardrobe, inspectArchive, type WardrobeImport } from "@/lib/wardrobe-archive";
import { finishLocalAccountDeletion, useAccount, useWardrobe } from "./AccountProvider";
import { BottomNavigation } from "./BottomNavigation";
import { AuthCodeForm } from "./AuthCodeForm";
import { ProfileDialog } from "./ProfileDialog";
import styles from "./FigmaProfile.module.css";

type Panel = "login" | "information" | "personalize" | "settings" | "contact" | "logout" | "clear" | "import" | "claim" | "reauth-delete" | "delete" | "reauth-phone" | "phone";
const AVATAR_IMAGES: Record<AvatarKey, string> = { cat: "/figma/nav-create.png", closet: "/figma/profile-nav-closet.png", pin: "/figma/profile-nav-saved.png" };
const TITLES: Record<Panel, string> = { login: "Welcome back", information: "Information", personalize: "Personalize", settings: "Settings", contact: "Contact & privacy", logout: "Log out", clear: "Clear local closet", import: "Import your closet", claim: "Bring your closet", "reauth-delete": "Confirm your identity", delete: "Delete account", "reauth-phone": "Confirm your identity", phone: "Change phone number" };

export default function FigmaProfile({ initialPanel }: { initialPanel?: "login" }) {
  const account = useAccount();
  const wardrobe = useWardrobe();
  const router = useRouter();
  const { profile, ownerId, guestOwner, offline, configured } = account;
  const [panel, setPanel] = useState<Panel | null>(initialPanel && !profile ? initialPanel : null);
  const [name, setName] = useState(profile?.displayName ?? "");
  const [avatar, setAvatar] = useState<AvatarKey>(profile?.avatarKey ?? "cat");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [archive, setArchive] = useState<WardrobeImport>();
  const [deleted, setDeleted] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const stats = useLiveQuery(async () => {
    try {
      const [items, outfits, guestItems, guestOutfits] = await Promise.all([
        db.clothingItems.where("ownerId").equals(ownerId).count(), db.outfits.where("ownerId").equals(ownerId).count(),
        db.clothingItems.where("ownerId").equals(guestOwner).count(), db.outfits.where("ownerId").equals(guestOwner).count(),
      ]);
      return { items, outfits, guestItems, guestOutfits, error: "" };
    } catch { return { items: 0, outfits: 0, guestItems: 0, guestOutfits: 0, error: "Your local closet could not be read." }; }
  }, [ownerId, guestOwner]);

  const open = (next: Panel) => { setError(""); setMessage(""); setName(profile?.displayName ?? ""); setAvatar(profile?.avatarKey ?? "cat"); setPanel(next); };
  const close = () => { if (!deleted) { setPanel(null); setArchive(undefined); if (initialPanel) router.replace("/profile"); } };
  const run = async (action: () => Promise<void>) => {
    setError(""); setMessage(""); setBusy(true);
    try { await action(); }
    catch (error) { setError(error instanceof Error ? error.message : "This action could not be completed. Please try again."); }
    finally { setBusy(false); }
  };
  const saveProfile = () => run(async () => {
    const result = await api<{ profile: Profile }>("/api/me", { displayName: name, avatarKey: avatar }, "PATCH");
    await account.acceptProfile(result.profile);
    setMessage("Your profile has been saved.");
  });
  const download = () => run(async () => {
    const blob = await exportWardrobe(ownerId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `e-closet-${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.append(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    setMessage("Your export is ready. Keep the ZIP file somewhere safe; it contains your photos.");
  });
  const guestPrompt = <div className={styles.stack}><p>Sign in to save your name and avatar and keep this local closet assigned to your account.</p><button className={styles.primary} onClick={() => open("login")}>Log in / Register</button><p className={styles.note}>Your wardrobe stays on this device.</p></div>;

  return <div data-layer="AUTO / Profile" data-node-id="137:790" className={styles.screen}>
    <img className={styles.background} src="/figma/saved-outfits-page-grid.png" alt="" />
    <img className={styles.vertical} src="/figma/profile-line-vertical.svg" alt="" />
    <img className={styles.horizontal} src="/figma/profile-line-horizontal.svg" alt="" />
    <header className={styles.header}>
      <span className={styles.quote} aria-hidden="true"><img src="/figma/saved-outfits-header.png" alt="" /></span>
      <div className={styles.greeting}><h1 title={profile?.displayName || undefined}>{profile ? profile.displayName || "Your profile" : "Guest"}</h1><p>Welcome!!!</p></div>
    </header>
    <button className={styles.avatar} aria-label="Personalize your avatar" onClick={() => open("personalize")}><img src={AVATAR_IMAGES[profile?.avatarKey ?? "cat"]} alt="Your profile avatar" /></button>
    <div className={styles.statistics} aria-label="Local closet totals">
      <Link href="/closet" className={styles.stat} aria-label={`${stats?.items ?? 0} clothing items`}><span className={styles.number}>{stats ? stats.items : "—"}<span className={styles.slash}><img src="/figma/profile-count-clothing.svg" alt="" /></span></span><strong>Clothing</strong></Link>
      <Link href="/outfits" className={styles.stat} aria-label={`${stats?.outfits ?? 0} saved outfits`}><span className={styles.number}>{stats ? stats.outfits : "—"}<span className={styles.slash}><img src="/figma/profile-count-outfits.svg" alt="" /></span></span><strong>Outfits</strong></Link>
    </div>
    <div className={styles.menus}>
      <section className={styles.group} aria-label="Profile settings">
        <button className={styles.row} onClick={() => open("information")}>Information</button>
        <button className={styles.row} onClick={() => open("personalize")}>Personalize</button>
        <button className={styles.row} onClick={() => open("settings")}>Settings</button>
      </section>
      <section className={styles.group} aria-label="Account and support">
        <button className={styles.row} onClick={() => open(profile ? "logout" : "login")}>{profile ? "Log out" : "Log in / Register"}</button>
        <button className={styles.row} onClick={() => open("contact")}>Contact</button>
      </section>
    </div>
    {offline || stats?.error ? <p className={styles.offline} role="status">{stats?.error || "Account service is offline. Your local closet is still here."}</p> : null}
    <BottomNavigation active="profile" />
    {panel ? <ProfileDialog title={TITLES[panel]} onClose={close} busy={busy || deleted}>
      {panel === "login" ? <AuthCodeForm onComplete={async (p) => { await account.acceptProfile(p); router.replace("/profile"); setPanel(null); }} /> : null}
      {panel === "information" ? profile ? <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void saveProfile(); }}>
        <label className={styles.field}>Name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="nickname" placeholder="Your name" disabled={busy} /></label>
        <dl className={styles.details}>{profile.email ? <><dt>Email address</dt><dd>{profile.email}</dd></> : null}{profile.phone ? <><dt>Phone number</dt><dd>{profile.phone}</dd></> : null}<dt>Member since</dt><dd>{new Date(profile.createdAt).toLocaleDateString()}</dd></dl>
        <button className={styles.primary} disabled={busy || offline}>Save information</button>
        {account.phoneEnabled ? <button type="button" className={styles.secondary} disabled={busy || offline} onClick={() => open("reauth-phone")}>{profile.phone ? "Change phone number" : "Add phone number"}</button> : null}
        <p className={styles.note}>Clothing, outfits, and photos are saved only in this browser. Your account stores your name, avatar choice, and verified sign-in details.</p>
      </form> : guestPrompt : null}
      {panel === "personalize" ? profile ? <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void saveProfile(); }}>
        <p>Choose a little character for your profile.</p><fieldset className={styles.avatarChoices} aria-label="Choose your avatar">{AVATARS.map((key) => <label className={styles.avatarChoice} key={key}><input type="radio" name="avatar" value={key} checked={avatar === key} onChange={() => setAvatar(key)} disabled={busy} /><img src={AVATAR_IMAGES[key]} alt="" /><span>{key === "cat" ? "Cat" : key === "closet" ? "Closet" : "Pin"}</span></label>)}</fieldset>
        <button className={styles.primary} disabled={busy || offline}>Save avatar</button>
      </form> : guestPrompt : null}
      {panel === "settings" ? <div className={styles.stack}>
        <p><strong>Your closet, on this device.</strong><br />{stats?.items ?? 0} clothing items · {stats?.outfits ?? 0} outfits</p>
        <p className={styles.note}>Clearing browser data removes your closet. Signing in on another device will not restore it. Export a ZIP to move or back up your wardrobe yourself.</p>
        <button className={styles.secondary} onClick={() => void download()} disabled={busy}>Export closet</button>
        <button className={styles.secondary} onClick={() => fileInput.current?.click()} disabled={busy}>Import closet</button>
        <input className={styles.hidden} ref={fileInput} type="file" accept=".zip,application/zip" aria-label="Choose closet archive" onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void run(async () => { setArchive(await inspectArchive(file)); setPanel("import"); }); }} />
        {profile && Boolean(stats && (stats.guestItems || stats.guestOutfits)) ? <button className={styles.secondary} onClick={() => open("claim")} disabled={busy}>Bring guest closet into this account</button> : null}
        <button className={styles.danger} onClick={() => open("clear")} disabled={busy || !stats || (!stats.items && !stats.outfits)}>Clear this local closet</button>
        {profile ? <button className={styles.danger} onClick={() => open("reauth-delete")} disabled={busy || offline}>Delete account</button> : null}
      </div> : null}
      {panel === "import" && archive ? <div className={styles.stack}><p>Add {archive.items.length} clothing items and {archive.outfits.length} outfits to {profile ? "your account's" : "your guest"} local closet?</p><p className={styles.note}>Existing items stay unchanged. Importing the same archive again creates additional copies.</p><button className={styles.primary} disabled={busy} onClick={() => void run(async () => { await importWardrobe(ownerId, archive); setArchive(undefined); setPanel("settings"); setMessage("Your closet has been imported."); })}>Import {archive.items.length} items</button></div> : null}
      {panel === "claim" ? <div className={styles.stack}><p>Move {stats?.guestItems ?? 0} guest clothing items and {stats?.guestOutfits ?? 0} outfits into this account on this browser?</p><p className={styles.note}>They will leave the guest closet. Nothing is uploaded.</p><button className={styles.primary} disabled={busy} onClick={() => void run(async () => { await wardrobe.claimGuest(); setPanel("settings"); setMessage("Your guest closet now belongs to this account on this device."); })}>Bring my guest closet</button></div> : null}
      {panel === "clear" ? <div className={styles.stack}><p>Permanently remove {stats?.items ?? 0} clothing items, their photos, and {stats?.outfits ?? 0} outfits from this local closet?</p><p className={styles.note}>Your account and other local closets will stay. Export first if you want to keep a copy.</p><button className={styles.danger} disabled={busy} onClick={() => void run(async () => { await wardrobe.clear(); setPanel("settings"); setMessage("This local closet has been cleared."); })}>Permanently clear this closet</button></div> : null}
      {panel === "logout" ? <div className={styles.stack}><p>Your clothes and photos will stay in this browser, hidden until you sign in to this account again.</p><button className={styles.primary} disabled={busy || offline} onClick={() => void run(async () => { await api("/api/auth/logout", {}); await account.acceptProfile(null); setPanel(null); })}>Log out of this account</button></div> : null}
      {panel === "reauth-delete" || panel === "reauth-phone" ? <AuthCodeForm key={panel} purpose="reauthenticate" onComplete={() => { setError(""); setPanel(panel === "reauth-delete" ? "delete" : "phone"); }} /> : null}
      {panel === "phone" ? <AuthCodeForm purpose="change" onComplete={async (p) => { await account.acceptProfile(p); setPanel("information"); setMessage("Your phone number has been updated."); }} /> : null}
      {panel === "delete" ? <div className={styles.stack}><p>This permanently deletes your account, profile, and this account’s local wardrobe on this browser.</p><p className={styles.note}>Exported ZIP files and copies on other offline devices remain under your control. This cannot be undone.</p><button className={styles.danger} disabled={busy} onClick={() => void run(async () => {
        if (!deleted) { await api("/api/me", {}, "DELETE"); setDeleted(true); localStorage.setItem("e-closet-deleted-owner", ownerId); }
        await finishLocalAccountDeletion(ownerId); localStorage.removeItem("e-closet-deleted-owner"); await account.acceptProfile(null); setDeleted(false); setPanel(null);
      })}>{deleted ? "Retry clearing local data" : "Permanently delete my account"}</button></div> : null}
      {panel === "contact" ? <div className={styles.stack}>
        <p>E-Closet is your personal wardrobe journal.</p>
        {account.supportEmail ? <a className={styles.secondary} href={`mailto:${account.supportEmail}`}>Email support</a> : <p className={styles.note}>A support email has not been published yet.</p>}
        <hr className={styles.divider} /><strong>Your data</strong><p>Clothing, outfits, and photos stay on this device. Account information is stored securely with our account provider.</p><p>Background removal sends a resized copy of your photo to remove.bg. Optional weather uses rounded location coordinates.</p><p>Use Settings to export or clear your local closet, or delete your account. Clearing browser data removes local photos and outfits.</p>
      </div> : null}
      {busy ? <p className={styles.note} role="status">Please wait…</p> : null}
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {message ? <p className={styles.success} role="status">{message}</p> : null}
      {offline && panel !== "login" ? <p className={styles.note}>Account changes require an internet connection.</p> : null}
      {!configured && panel === "information" ? <p className={styles.note}>Account sign-in will be available once the service is connected.</p> : null}
    </ProfileDialog> : null}
  </div>;
}
