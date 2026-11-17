import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createClient, type Session, type User } from "@supabase/supabase-js";
import type { Profile } from "../profile";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
const ACCESS = "ec-access";
const REFRESH = "ec-refresh";
const RECENT = "ec-recent";
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

export function phoneEnabled() { return process.env.AUTH_PHONE_ENABLED === "true"; }
export function configured() {
  return Boolean(process.env.AUTH_PROVIDER_URL && process.env.AUTH_PROVIDER_PUBLISHABLE_KEY && process.env.AUTH_PROVIDER_SECRET_KEY);
}
export function authClient(admin = false) {
  if (!configured()) throw new HttpError(503, "Account sign-in is not available yet. You can still use your local closet.");
  return createClient(process.env.AUTH_PROVIDER_URL!, admin ? process.env.AUTH_PROVIDER_SECRET_KEY! : process.env.AUTH_PROVIDER_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(12_000), cache: "no-store" }) },
  });
}
export async function setSessionCookies(session: Session) {
  const jar = await cookies();
  jar.set(ACCESS, session.access_token, { ...cookieOptions, maxAge: Math.max(0, (session.expires_at ?? 0) - Math.floor(Date.now() / 1000)) });
  jar.set(REFRESH, session.refresh_token, { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
}
export async function clearSessionCookies() {
  const jar = await cookies();
  for (const key of [ACCESS, REFRESH, RECENT]) jar.set(key, "", { ...cookieOptions, maxAge: 0 });
}
export async function currentSession() {
  const jar = await cookies();
  const access = jar.get(ACCESS)?.value;
  const refresh = jar.get(REFRESH)?.value;
  if (!refresh) throw new HttpError(401, "Sign in to continue.");
  const client = authClient();
  const result = access
    ? await client.auth.setSession({ access_token: access, refresh_token: refresh })
    : await client.auth.refreshSession({ refresh_token: refresh });
  if (result.error || !result.data.session) {
    if (result.error && (!result.error.status || result.error.status >= 500)) throw new HttpError(503, "Account service is temporarily unavailable.");
    await clearSessionCookies();
    throw new HttpError(401, "Your session expired. Please sign in again.");
  }
  // Auth validates the current user, including deleted accounts, on every request.
  const verified = await client.auth.getUser();
  if (verified.error || !verified.data.user) {
    if (verified.error && (!verified.error.status || verified.error.status >= 500)) throw new HttpError(503, "Account service is temporarily unavailable.");
    await clearSessionCookies();
    throw new HttpError(401, "Your session is no longer available. Please sign in again.");
  }
  if (result.data.session.access_token !== access || result.data.session.refresh_token !== refresh) await setSessionCookies(result.data.session);
  return { client, user: verified.data.user, session: result.data.session };
}
export async function readProfile(user: User): Promise<Profile> {
  const admin = authClient(true);
  const created = await admin.from("profiles").upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });
  if (created.error) throw new HttpError(503, "Your profile could not be opened. Please try again later.");
  const extended = await admin.from("profiles").select("display_name,avatar_key,created_at,avatar_path,setup_complete,updated_at").eq("user_id", user.id).single();
  let data = extended.data;
  if (extended.error && /avatar_path|setup_complete/.test(extended.error.message)) {
    const legacy = await admin.from("profiles").select("display_name,avatar_key,created_at,updated_at").eq("user_id", user.id).single();
    if (legacy.error) throw new HttpError(503, "Your profile could not be opened. Please try again later.");
    data = { ...legacy.data, avatar_path: null, setup_complete: true };
  } else if (extended.error) throw new HttpError(503, "Your profile could not be opened. Please try again later.");
  if (!data) throw new HttpError(503, "Your profile could not be opened. Please try again later.");
  const phone = user.phone ? `+${user.phone.replace(/^\+/, "")}` : "";
  return { id: user.id, displayName: data.display_name, avatarKey: "cat", avatarUrl: data.avatar_path ? `/api/me/avatar?v=${encodeURIComponent(data.updated_at)}` : undefined, setupComplete: data.setup_complete, email: user.email ?? "", phone: phone ? `${phone.slice(0, 3)} ••• ${phone.slice(-4)}` : "", createdAt: data.created_at };
}
function sessionId(session: Session) {
  return String(JSON.parse(Buffer.from(session.access_token.split(".")[1], "base64url").toString()).session_id);
}
function sign(value: string) { return createHmac("sha256", process.env.AUTH_PROVIDER_SECRET_KEY!).update(value).digest("base64url"); }
export async function markRecent(session: Session) {
  const value = `${session.user.id}:${sessionId(session)}:${Date.now() + 5 * 60_000}`;
  (await cookies()).set(RECENT, `${value}.${sign(value)}`, { ...cookieOptions, maxAge: 300 });
}
export async function requireRecent(session: Session) {
  const [value, signature] = ((await cookies()).get(RECENT)?.value ?? "").split(".");
  const expected = value ? sign(value) : "";
  const [userId, sid, expiry] = (value ?? "").split(":");
  if (!signature || !/^[A-Za-z0-9_-]{43}$/.test(signature) || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) || userId !== session.user.id || sid !== sessionId(session) || !Number.isFinite(Number(expiry)) || Number(expiry) < Date.now()) {
    throw new HttpError(403, "Verify your identity again before this account change.");
  }
}
export async function rateLimit(request: Request, action: string, phone = "") {
  const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const scopes: [string, number, number][] = [
    [`${action}:ip:${ip}`, 60, action === "verify" ? 12 : 5],
    [`${action}:global`, 3600, action === "verify" ? 2000 : 500],
  ];
  if (phone) scopes.push([`${action}:phone:${phone}`, action === "verify" ? 600 : 60, action === "verify" ? 10 : 1]);
  for (const [scope, windowSeconds, maxRequests] of scopes) {
    const { data, error } = await authClient(true).rpc("consume_auth_limit", { bucket_key: sign(scope), window_seconds: windowSeconds, max_requests: maxRequests });
    if (error) throw new HttpError(503, "Account service is temporarily unavailable.");
    if (!data) throw new HttpError(429, "Too many attempts. Please wait before trying again.");
  }
}
export async function requestBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new HttpError(415, "Send a JSON request.");
  const text = await request.text();
  if (text.length > 4096) throw new HttpError(413, "The request is too large.");
  try {
    const body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch { throw new HttpError(400, "The request could not be read."); }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
export function route(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    try {
      if (request.method !== "GET" && request.method !== "HEAD") {
        // Next may reconstruct request.url using its internal listening hostname.
        // Compare the browser Origin against the actual incoming Host instead.
        let origin: URL | undefined;
        try { origin = new URL(request.headers.get("origin") ?? ""); } catch { /* rejected below */ }
        if (!origin || !["http:", "https:"].includes(origin.protocol) || origin.host !== request.headers.get("host") || request.headers.get("sec-fetch-site") === "cross-site") throw new HttpError(403, "This request must come from this app.");
      }
      return await handler(request);
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      return json({ error: "The account service could not complete this request. Please try again." }, 503);
    }
  };
}
export function otp(value: unknown) {
  if (typeof value !== "string" || !/^\d{6,8}$/.test(value)) throw new HttpError(400, "Enter the verification code you received.");
  return value;
}
