import { clearSessionCookies, currentSession, HttpError, isMobileRequest, json, mobileOptions, route } from "@/lib/auth/server";

export const POST = route(async (request) => {
  try {
    const { client } = await currentSession(request);
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error && error.status !== 401 && error.status !== 403 && error.status !== 404) throw new HttpError(503, "Could not sign out. Please try again when you are online.");
  } catch (error) { if (!(error instanceof HttpError && error.status === 401)) throw error; }
  if (!isMobileRequest(request)) await clearSessionCookies();
  return json({ signedOut: true });
});

export const OPTIONS = mobileOptions;
