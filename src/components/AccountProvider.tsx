"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { activateProfile, db, localAccount, wardrobeFor, type LocalAccount } from "@/lib/db";
import { api } from "@/lib/api-client";
import { clearMobileSession, restoreMobileSession, saveMobileSession, type MobileSession } from "@/lib/mobile-session";
import type { AccountResponse, Profile } from "@/lib/profile";

type AccountContextValue = {
  ownerId: string; guestOwner: string; profile: Profile | null;
  configured: boolean; phoneEnabled: boolean; offline: boolean; supportEmail: string | null;
  acceptProfile: (profile: Profile | null, session?: MobileSession) => Promise<void>;
  refresh: () => Promise<void>;
};
const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<LocalAccount>();
  const [phoneEnabled, setPhoneEnabled] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [offline, setOffline] = useState(false);
  const [supportEmail, setSupportEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const channel = useRef<BroadcastChannel | null>(null);
  const sequence = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++sequence.current;
    try {
      const deletedOwner = localStorage.getItem("e-closet-deleted-owner");
      if (deletedOwner) {
        await finishLocalAccountDeletion(deletedOwner);
        localStorage.removeItem("e-closet-deleted-owner");
      }
      const local = await localAccount();
      if (process.env.NEXT_PUBLIC_ECLOSET_TARGET === "mobile") {
        const guest = await activateProfile(null);
        if (request === sequence.current) {
          setAccount(guest);
          setConfigured(false);
          setPhoneEnabled(false);
          setSupportEmail(null);
          setOffline(!navigator.onLine);
          setError("");
        }
        // Guest is visible immediately. The public account capability check and
        // Keychain session recovery happen afterwards and never block launch.
        void (async () => {
          try {
            const status = await api<AccountResponse>("/api/me");
            if (request !== sequence.current) return;
            setConfigured(status.configured);
            setPhoneEnabled(status.phoneEnabled === true);
            setSupportEmail(status.supportEmail);
            setOffline(false);
            const restored = await restoreMobileSession();
            if (!restored || request !== sequence.current) return;
            const next = await activateProfile(restored);
            if (request === sequence.current) setAccount(next);
          } catch (error) {
            const networkFailure = error instanceof TypeError || (error instanceof DOMException && error.name === "AbortError");
            if (request === sequence.current) setOffline(networkFailure);
          }
        })();
        return;
      }
      let response: AccountResponse;
      try { response = await api<AccountResponse>("/api/me"); }
      catch (error) {
        // A valid HTTP response can report an account-side problem (for example,
        // an incomplete deployment migration). Only actual network failures put
        // the interface into offline mode.
        const networkFailure = error instanceof TypeError || (error instanceof DOMException && error.name === "AbortError");
        if (request === sequence.current) { setAccount(local); setOffline(networkFailure); }
        return;
      }
      if (request !== sequence.current) return;
      const next = await activateProfile(response.profile);
      setAccount(next);
      setConfigured(response.configured);
      setPhoneEnabled(response.phoneEnabled === true);
      setSupportEmail(response.supportEmail);
      setOffline(false);
      setError("");
    } catch { setError("Your local storage could not be opened. Allow site storage, then try again. Your data has not been cleared."); }
  }, []);

  const acceptProfile = useCallback(async (profile: Profile | null, session?: MobileSession) => {
    ++sequence.current;
    if (process.env.NEXT_PUBLIC_ECLOSET_TARGET === "mobile") {
      if (session) await saveMobileSession(session);
      else if (!profile) await clearMobileSession();
    }
    const next = await activateProfile(profile);
    setAccount(next);
    setOffline(false);
    if (profile) setConfigured(true);
    channel.current?.postMessage("account-changed");
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    if (typeof BroadcastChannel !== "undefined") {
      channel.current = new BroadcastChannel("e-closet-account");
      channel.current.onmessage = () => { setAccount(undefined); void refresh(); };
    }
    const online = () => { void refresh(); };
    window.addEventListener("online", online);
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 5 * 60_000);
    return () => {
      // Invalidate asynchronous requests from this effect's previous lifetime.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ++sequence.current;
      channel.current?.close(); window.clearTimeout(initial); window.removeEventListener("online", online); window.clearInterval(interval);
    };
  }, [refresh]);

  if (!account) return <main className="account-loading" role="status">{error || "Opening your closet…"}{error ? <button onClick={() => void refresh()}>Try again</button> : null}</main>;
  return <AccountContext.Provider value={{ ownerId: account.activeOwner, guestOwner: account.guestOwner, profile: account.profile, configured, phoneEnabled, offline, supportEmail, acceptProfile, refresh }}>
    <div key={account.activeOwner}>{children}</div>
  </AccountContext.Provider>;
}

export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error("AccountProvider is required.");
  return account;
}

export function useWardrobe() {
  const { ownerId } = useAccount();
  return useMemo(() => wardrobeFor(ownerId), [ownerId]);
}

export async function finishLocalAccountDeletion(ownerId: string) {
  if (!/^user:[a-zA-Z0-9-]+$/.test(ownerId)) throw new Error("Invalid local account deletion marker.");
  await db.transaction("rw", db.settings, db.clothingItems, db.outfits, async () => {
    const account = await db.settings.get("account");
    await db.clothingItems.where("ownerId").equals(ownerId).delete();
    await db.outfits.where("ownerId").equals(ownerId).delete();
    if (account?.activeOwner === ownerId) await db.settings.put({ ...account, activeOwner: account.guestOwner, profile: null });
  });
}
