"use client";

import { Capacitor } from "@capacitor/core";
import { SecureStorage } from "@capnative/capacitor-secure-storage";
import { apiUrl, setMobileAccessToken } from "./api-client";
import type { Profile } from "./profile";

const REFRESH_TOKEN_KEY = "ecloset.mobile.refresh-token.v1";

export type MobileSession = { accessToken: string; refreshToken: string };
type SessionResponse = { profile: Profile; session: MobileSession };

function isNativeMobileApp() {
  return process.env.NEXT_PUBLIC_ECLOSET_TARGET === "mobile" && Capacitor.isNativePlatform();
}

export async function saveMobileSession(session: MobileSession) {
  if (!isNativeMobileApp()) return;
  // Only the rotating refresh token persists, in iOS Keychain. Access tokens
  // remain in memory and disappear when the app process is closed.
  await SecureStorage.set({ key: REFRESH_TOKEN_KEY, value: session.refreshToken });
  setMobileAccessToken(session.accessToken);
}

export async function clearMobileSession() {
  setMobileAccessToken(null);
  if (isNativeMobileApp()) await SecureStorage.remove({ key: REFRESH_TOKEN_KEY });
}

export async function restoreMobileSession(): Promise<Profile | null> {
  if (!isNativeMobileApp() || !navigator.onLine) return null;
  const { value: refreshToken } = await SecureStorage.get({ key: REFRESH_TOKEN_KEY });
  if (!refreshToken) return null;
  const response = await fetch(apiUrl("/api/auth/session/refresh"), {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status === 401) {
    await clearMobileSession();
    return null;
  }
  if (!response.ok) throw new Error("Account session could not be restored.");
  const result = await response.json() as SessionResponse;
  await saveMobileSession(result.session);
  return result.profile;
}
