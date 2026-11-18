"use client";
/* eslint-disable @next/next/no-img-element -- Figma collage assets and local preset avatars use precise image geometry. */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { api, apiBlob, upload } from "@/lib/api-client";
import { type Profile } from "@/lib/profile";
import { exportWardrobe, importWardrobe, inspectArchive, type WardrobeImport } from "@/lib/wardrobe-archive";
import { finishLocalAccountDeletion, useAccount, useWardrobe } from "./AccountProvider";
import { BottomNavigation } from "./BottomNavigation";
import { AuthCodeForm } from "./AuthCodeForm";
import { ProfileDialog } from "./ProfileDialog";
import { SignInPrompt } from "./SignInPrompt";
import { CollageGuideLines } from "./CollageGuideLines";
import styles from "./FigmaProfile.module.css";

type Panel = "account" | "login" | "information" | "settings" | "contact" | "logout" | "clear" | "import" | "guest-clothes" | "discard-guest" | "reauth-delete" | "delete" | "reauth-phone" | "phone";
const DEFAULT_AVATAR = "/figma/nav-create.png";
const TITLES: Record<Panel, string> = { account: "Sign in", login: "Sign in", information: "Information", settings: "Settings", contact: "Contact & Privacy", logout: "Log out", clear: "Clear local closet", import: "Import your closet", "guest-clothes": "Your clothes", "discard-guest": "Remove guest clothes", "reauth-delete": "Confirm your identity", delete: "Delete account", "reauth-phone": "Confirm your identity", phone: "Change phone number" };

export default function FigmaProfile({ initialPanel }: { initialPanel?: "login" }) {
  const account = useAccount();
  const wardrobe = useWardrobe();
  const router = useRouter();
  const { profile, ownerId, guestOwner, offline } = account;
  const [panel, setPanel] = useState<Panel | null>(initialPanel && !profile ? "account" : null);
  const [name, setName] = useState(profile?.displayName ?? "");
  const [avatarFile, setAvatarFile] = useState<File>();
  const [avatarPreview, setAvatarPreview] = useState<string>();
  const [remoteAvatar, setRemoteAvatar] = useState<{ path: string; url: string }>();
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

  const open = (next: Panel) => { setError(""); setMessage(""); setName(profile?.displayName ?? ""); setAvatarFile(undefined); setAvatarPreview(undefined); setPanel(next); };
  useEffect(() => {
    if (!profile || panel || sessionStorage.getItem(`e-closet-login-prompt:${profile.id}`)) return;
    let cancelled = false;
    void Promise.all([db.clothingItems.where("ownerId").equals(guestOwner).count(), db.outfits.where("ownerId").equals(guestOwner).count()]).then(([items, outfits]) => {
      if (cancelled) return;
      sessionStorage.setItem(`e-closet-login-prompt:${profile.id}`, "shown");
      setPanel(items || outfits ? "guest-clothes" : profile.setupComplete === false ? "information" : null);
    });
    return () => { cancelled = true; };
  }, [guestOwner, panel, profile]);
  useEffect(() => {
    if (!profile?.avatarUrl) return;
    const path = profile.avatarUrl;
    let disposed = false;
    let objectUrl: string | undefined;
    void apiBlob(path).then((blob) => {
      if (disposed) return;
      objectUrl = URL.createObjectURL(blob);
      setRemoteAvatar({ path, url: objectUrl });
    }).catch(() => { /* Leave the preset avatar in place on an image error. */ });
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [profile?.avatarUrl]);
  const close = () => { if (!deleted) { setPanel(null); setArchive(undefined); if (initialPanel) router.replace("/profile"); } };
  const run = async (action: () => Promise<void>) => {
    setError(""); setMessage(""); setBusy(true);
    try { await action(); }
    catch (error) { setError(error instanceof Error ? error.message : "This action could not be completed. Please try again."); }
    finally { setBusy(false); }
  };
  const renderAvatar = async (file: File) => {
    const source = await createImageBitmap(file);
    try {
      const size = 256; const scale = Math.max(size / source.width, size / source.height);
      const width = source.width * scale; const height = source.height * scale;
      const canvas = document.createElement("canvas"); canvas.width = size; canvas.height = size;
      const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable");
      context.drawImage(source, (size - width) / 2, (size - height) / 2, width, height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", .84));
      if (!blob || blob.size > 512 * 1024) throw new Error("Choose a simpler or smaller photo for this avatar.");
      return new File([blob], "avatar.jpg", { type: "image/jpeg" });
    } finally { source.close(); }
  };
  const chooseAvatar = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Choose an image file."); return; }
    setError(""); setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file));
  };
  const saveProfile = () => run(async () => {
    const result = await api<{ profile: Profile }>("/api/me", { displayName: name, avatarKey: "cat" }, "PATCH");
    let saved = result;
    if (avatarFile) {
      const form = new FormData();
      form.append("avatar", await renderAvatar(avatarFile));
      saved = await upload<{ profile: Profile }>("/api/me/avatar", form);
    }
    await account.acceptProfile(saved.profile);
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
  const guestPrompt = <SignInPrompt onLogin={() => open("login")} />;

  return <div data-layer="AUTO / Profile" data-node-id="137:790" className={styles.screen}>
    <img className={styles.background} src="/figma/saved-outfits-page-grid.png" alt="" />
    <CollageGuideLines />
    <header className={styles.header}>
      <span className={styles.quote} aria-hidden="true"><img src="/figma/saved-outfits-header.png" alt="" /></span>
      <div className={styles.greeting}><h1 title={profile?.displayName || undefined}>{profile ? profile.displayName || "Your profile" : "Guest"}</h1></div>
    </header>
    <button className={styles.avatar} aria-label={profile ? "Edit your avatar" : "Log in to edit your avatar"} onClick={() => open("information")}><img src={profile?.avatarUrl && remoteAvatar?.path === profile.avatarUrl ? remoteAvatar.url : DEFAULT_AVATAR} alt="Your profile avatar" /></button>
    <div className={styles.statistics} aria-label="Local closet totals">
      <Link href="/closet" className={styles.stat} aria-label={`${stats?.items ?? 0} clothing items`}><span className={styles.number}>{stats ? stats.items : "—"}<span className={styles.slash}><img src="/figma/profile-count-clothing.svg" alt="" /></span></span><strong>Clothing</strong></Link>
      <Link href="/outfits" className={styles.stat} aria-label={`${stats?.outfits ?? 0} saved outfits`}><span className={styles.number}>{stats ? stats.outfits : "—"}<span className={styles.slash}><img src="/figma/profile-count-outfits.svg" alt="" /></span></span><strong>Outfits</strong></Link>
    </div>
    <div className={styles.menus}>
      <section className={styles.group} aria-label="Profile settings">
        <button className={styles.row} onClick={() => open("information")}>Information</button>
        <button className={styles.row} onClick={() => open("settings")}>Settings</button>
      </section>
      <section className={styles.group} aria-label="Account and support">
        <button className={styles.row} onClick={() => open(profile ? "logout" : "account")}>{profile ? "Log out" : "Log in / Register"}</button>
        <button className={styles.row} onClick={() => open("contact")}>Contact</button>
      </section>
    </div>
    {offline || stats?.error ? <p className={styles.offline} role="status">{stats?.error || "Account service is offline. Your local closet is still here."}</p> : null}
    <BottomNavigation active="profile" />
    {panel ? <ProfileDialog title={TITLES[panel]} onClose={close} busy={busy || deleted}>
      {panel === "account" ? guestPrompt : null}
      {panel === "login" ? <AuthCodeForm onComplete={async (p) => { sessionStorage.removeItem(`e-closet-login-prompt:${p.id}`); await account.acceptProfile(p); router.replace("/profile"); }} /> : null}
      {panel === "information" ? profile ? <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void saveProfile(); }}>
        <label className={styles.field}>Name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="nickname" placeholder="Your name" disabled={busy} /></label>
        <dl className={styles.details}>{profile.email ? <><dt>Email address</dt><dd>{profile.email}</dd></> : null}</dl>
        <label className={styles.avatarEditor} aria-label="Change your avatar"><input className={styles.hidden} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseAvatar(event.target.files?.[0])} disabled={busy} />{avatarPreview ? <span className={styles.avatarPreview}><img src={avatarPreview} alt="New avatar preview" /></span> : null}<span className={`${styles.secondary} ${styles.textAction}`}>Change your avatar</span></label>
        <button className={styles.primary} disabled={busy || offline}>Save</button>
        {account.phoneEnabled ? <button type="button" className={styles.secondary} disabled={busy || offline} onClick={() => open("reauth-phone")}>{profile.phone ? "Change phone number" : "Add phone number"}</button> : null}
      </form> : guestPrompt : null}
      {panel === "settings" ? profile ? <div className={styles.stack}>
        <div className={styles.transferActions}>
          <button className={`${styles.secondary} ${styles.transferAction}`} onClick={() => void download()} disabled={busy}>Export closet</button>
          <button className={`${styles.secondary} ${styles.transferAction}`} onClick={() => fileInput.current?.click()} disabled={busy}>Import closet</button>
        </div>
        <input className={styles.hidden} ref={fileInput} type="file" accept=".zip,application/zip" aria-label="Choose closet archive" onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void run(async () => { setArchive(await inspectArchive(file)); setPanel("import"); }); }} />
        <button className={styles.danger} onClick={() => open("clear")} disabled={busy || !stats || (!stats.items && !stats.outfits)}>Clear this local closet</button>
        {profile ? <button className={styles.danger} onClick={() => open("reauth-delete")} disabled={busy || offline}>Delete account</button> : null}
      </div> : guestPrompt : null}
      {panel === "import" && archive && profile ? <div className={styles.stack}><p>Add {archive.items.length} clothing items and {archive.outfits.length} outfits to your local closet?</p><p className={styles.note}>Existing items stay unchanged. Importing the same archive again creates additional copies.</p><button className={styles.primary} disabled={busy} onClick={() => void run(async () => { await importWardrobe(ownerId, archive); setArchive(undefined); setPanel("settings"); setMessage("Your closet has been imported."); })}>Import {archive.items.length} items</button></div> : null}
      {panel === "guest-clothes" ? <div className={styles.stack}><p>Add {stats?.guestItems ?? 0} clothes and {stats?.guestOutfits ?? 0} outfits you created before signing in to this account?</p><button className={styles.primary} disabled={busy} onClick={() => void run(async () => { await wardrobe.claimGuest(); setPanel(profile?.setupComplete === false ? "information" : null); })}>Add</button><button className={styles.secondary} disabled={busy} onClick={() => open("discard-guest")}>Skip</button></div> : null}
      {panel === "discard-guest" ? <div className={styles.stack}><p>Remove the clothes and outfits you created before signing in? This cannot be undone.</p><button className={styles.danger} disabled={busy} onClick={() => void run(async () => { await wardrobe.clearGuest(); setPanel(profile?.setupComplete === false ? "information" : null); })}>Remove guest clothes</button><button className={styles.secondary} disabled={busy} onClick={() => open("guest-clothes")}>Go back</button></div> : null}
      {panel === "clear" ? <div className={styles.stack}><p>Permanently remove {stats?.items ?? 0} clothing items, their photos, and {stats?.outfits ?? 0} outfits from this local closet?</p><button className={styles.danger} disabled={busy} onClick={() => void run(async () => { await wardrobe.clear(); setPanel("settings"); setMessage("This local closet has been cleared."); })}>Permanently clear this closet</button></div> : null}
      {panel === "logout" ? <div className={styles.stack}><p>Your clothes and photos stay on this device. Sign in to this account again to see them. Delete the app will remove all the information.</p><button className={styles.primary} disabled={busy || offline} onClick={() => void run(async () => { await api("/api/auth/logout", {}); await account.acceptProfile(null); setPanel(null); })}>Log out of this account</button></div> : null}
      {panel === "reauth-delete" || panel === "reauth-phone" ? <AuthCodeForm key={panel} purpose="reauthenticate" onComplete={() => { setError(""); setPanel(panel === "reauth-delete" ? "delete" : "phone"); }} /> : null}
      {panel === "phone" ? <AuthCodeForm purpose="change" onComplete={async (p) => { await account.acceptProfile(p); setPanel("information"); setMessage("Your phone number has been updated."); }} /> : null}
      {panel === "delete" ? <div className={styles.stack}><p>This permanently deletes your account, profile, and this account’s local wardrobe on this browser.</p><p className={styles.note}>Exported ZIP files and copies on other offline devices remain under your control. This cannot be undone.</p><button className={styles.danger} disabled={busy} onClick={() => void run(async () => {
        if (!deleted) { await api("/api/me", {}, "DELETE"); setDeleted(true); localStorage.setItem("e-closet-deleted-owner", ownerId); }
        await finishLocalAccountDeletion(ownerId); localStorage.removeItem("e-closet-deleted-owner"); await account.acceptProfile(null); setDeleted(false); setPanel(null);
      })}>{deleted ? "Retry clearing local data" : "Permanently delete my account"}</button></div> : null}
      {panel === "contact" ? <div className={styles.stack}>
        <p>E-Closet is your personal wardrobe journal.</p>
        <a className={styles.textAction} href={`mailto:${account.supportEmail ?? "x9916643@gmail.com"}`}>{account.supportEmail ?? "x9916643@gmail.com"}</a>
        <hr className={styles.divider} /><strong>Your data</strong><p>Clothing, outfits, and photos stay on this device. Account information is stored securely with our account provider.</p><p>Background removal sends a resized copy of your photo to remove.bg. Optional weather uses rounded location coordinates.</p><p>Use Settings to export or clear your local closet, or delete your account. Clearing browser data removes local photos and outfits.</p>
      </div> : null}
      {busy ? <p className={styles.note} role="status">Please wait…</p> : null}
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {message ? <p className={styles.success} role="status">{message}</p> : null}
    </ProfileDialog> : null}
  </div>;
}
