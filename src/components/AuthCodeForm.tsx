"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { emailAddress, phoneNumber, type Profile } from "@/lib/profile";
import { useAccount } from "./AccountProvider";
import styles from "./FigmaProfile.module.css";

export function AuthCodeForm({ purpose = "login", onComplete }: { purpose?: "login" | "reauthenticate" | "change"; onComplete: (profile: Profile) => Promise<void> | void }) {
  const { configured, offline, profile, phoneEnabled } = useAccount();
  const [selectedChannel, setSelectedChannel] = useState<"email" | "phone">("email");
  const channel = purpose === "change" ? "phone" : purpose === "reauthenticate" ? (profile?.email ? "email" : "phone") : selectedChannel;
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState<string>();
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!remaining) return;
    const timer = window.setTimeout(() => setRemaining((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);

  const send = async () => {
    setError(""); setBusy(true);
    try {
      const normalized = purpose === "reauthenticate" ? "" : (channel === "email" ? emailAddress(address) : phoneNumber(address));
      const path = purpose === "change" ? "/api/me/phone/request" : "/api/auth/otp/request";
      await api(path, { [channel]: normalized, channel, purpose });
      setSentTo(normalized || (channel === "email" ? profile?.email : profile?.phone) || "your account"); setCode(""); setRemaining(60);
    } catch (error) { setError(error instanceof Error ? error.message : "The code could not be sent."); }
    finally { setBusy(false); }
  };
  const verify = async () => {
    setError(""); setBusy(true);
    try {
      const path = purpose === "change" ? "/api/me/phone/verify" : "/api/auth/otp/verify";
      const result = await api<{ profile: Profile }>(path, { [channel]: sentTo, channel, code, purpose });
      await onComplete(result.profile);
    } catch (error) { setError(error instanceof Error ? error.message : "The code could not be verified."); }
    finally { setBusy(false); }
  };
  if (!configured || offline) return <p className={styles.note} role="status">{offline ? "Connect to the internet to manage your account. Your local closet is still available." : "Account sign-in is not available yet. You can still use your local closet."}</p>;
  return <form className={styles.form} onSubmit={(event) => { event.preventDefault(); void (sentTo === undefined ? send() : verify()); }}>
    {purpose === "login" && phoneEnabled && sentTo === undefined ? <label className={styles.field}>Sign-in method<select value={selectedChannel} disabled={busy} onChange={(e) => { setSelectedChannel(e.target.value as "email" | "phone"); setAddress(""); setError(""); }}><option value="email">Email</option><option value="phone">Phone</option></select></label> : null}
    <p>{purpose === "login" ? `Sign in or create an account with your ${channel === "email" ? "email address" : "phone number"}.` : purpose === "change" ? "Verify your new phone number. Your local closet stays with this account." : `We'll send a code to ${channel === "email" ? profile?.email : profile?.phone} to confirm this change.`}</p>
    {purpose !== "reauthenticate" ? <label className={styles.field}>{channel === "email" ? "Email address" : "Phone number"}<input type={channel === "email" ? "email" : "tel"} autoComplete={channel === "email" ? "email" : "tel"} placeholder={channel === "email" ? "you@example.com" : "+1 212 555 0123"} value={address} onChange={(e) => setAddress(e.target.value)} maxLength={channel === "email" ? 254 : 24} required disabled={busy || sentTo !== undefined} /></label> : null}
    {sentTo !== undefined ? <>
      <p className={styles.note}>Code sent to {sentTo}.</p>
      <label className={styles.field}>Verification code<input autoFocus type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} maxLength={8} required disabled={busy} /></label>
    </> : null}
    {error ? <p className={styles.error} role="alert">{error}</p> : null}
    <button className={styles.primary} disabled={busy}>{busy ? "Please wait…" : sentTo === undefined ? "Send code" : purpose === "login" ? "Verify & continue" : "Verify code"}</button>
    {sentTo !== undefined ? <div className={styles.inlineActions}><button type="button" onClick={() => void send()} disabled={busy || remaining > 0}>{remaining > 0 ? `Resend in ${remaining}s` : "Resend code"}</button>{purpose !== "reauthenticate" ? <button type="button" disabled={busy} onClick={() => { setSentTo(undefined); setError(""); }}>{channel === "email" ? "Change email" : "Change number"}</button> : null}</div> : null}
    {purpose === "login" ? <p className={styles.note}>Your clothes and photos stay in this browser. Signing in does not back up or restore your closet.</p> : null}
  </form>;
}
