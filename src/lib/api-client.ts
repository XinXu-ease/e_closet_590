export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const isMobileApp = process.env.NEXT_PUBLIC_ECLOSET_TARGET === "mobile";
let mobileAccessToken: string | null = null;

/** Keeps a short-lived access token in memory; the refresh token is never stored here. */
export function setMobileAccessToken(token: string | null) {
  mobileAccessToken = token;
}

/** Resolves a first-party API path for either the website or the iOS bundle. */
export function apiUrl(path: string) {
  if (!path.startsWith("/")) throw new Error("API paths must start with '/'.");
  return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
}

export async function api<T>(path: string, body?: unknown, method = body === undefined ? "GET" : "POST"): Promise<T> {
  const headers = new Headers();
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (isMobileApp && mobileAccessToken) headers.set("Authorization", `Bearer ${mobileAccessToken}`);
  const response = await fetch(apiUrl(path), {
    method, credentials: isMobileApp ? "omit" : "same-origin", cache: "no-store",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const data = await response.json();
  if (!response.ok) throw new ApiError(data.error || "The request could not be completed. Please try again.", response.status);
  return data as T;
}

export async function upload<T>(path: string, form: FormData): Promise<T> {
  const headers = new Headers();
  if (isMobileApp && mobileAccessToken) headers.set("Authorization", `Bearer ${mobileAccessToken}`);
  const response = await fetch(apiUrl(path), { method: "POST", credentials: isMobileApp ? "omit" : "same-origin", cache: "no-store", headers, body: form, signal: AbortSignal.timeout(20_000) });
  const data = await response.json();
  if (!response.ok) throw new ApiError(data.error || "The upload could not be completed. Please try again.", response.status);
  return data as T;
}

/** Fetches an authenticated binary resource (for example a private avatar). */
export async function apiBlob(path: string): Promise<Blob> {
  const headers = new Headers();
  if (isMobileApp && mobileAccessToken) headers.set("Authorization", `Bearer ${mobileAccessToken}`);
  const response = await fetch(apiUrl(path), { credentials: isMobileApp ? "omit" : "same-origin", cache: "no-store", headers, signal: AbortSignal.timeout(20_000) });
  if (!response.ok) {
    let message = "The image could not be loaded.";
    try { message = ((await response.json()) as { error?: string }).error || message; } catch { /* use default */ }
    throw new ApiError(message, response.status);
  }
  return response.blob();
}
