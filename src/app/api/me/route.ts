import { authClient, clearSessionCookies, configured, currentSession, HttpError, json, readProfile, requestBody, requireRecent, route } from "@/lib/auth/server";
import { profileInput } from "@/lib/profile";

export const GET = route(async () => {
  const support = process.env.SUPPORT_EMAIL ?? "";
  const supportEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(support) ? support : null;
  if (!configured()) return json({ profile: null, configured: false, supportEmail });
  try {
    const { user } = await currentSession();
    return json({ profile: await readProfile(user), configured: true, supportEmail });
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) return json({ profile: null, configured: true, supportEmail });
    throw error;
  }
});

export const PATCH = route(async (request) => {
  const { user } = await currentSession();
  const body = await requestBody(request);
  let input;
  try { input = profileInput(body); } catch (error) { throw new HttpError(400, (error as Error).message); }
  const { error } = await authClient(true).from("profiles").upsert({ user_id: user.id, display_name: input.displayName, avatar_key: input.avatarKey, updated_at: new Date().toISOString() });
  if (error) throw new HttpError(503, "Your changes could not be saved. Please try again.");
  return json({ profile: await readProfile(user) });
});

export const DELETE = route(async () => {
  const { user, session } = await currentSession();
  await requireRecent(session);
  const { error } = await authClient(true).auth.admin.deleteUser(user.id);
  if (error) throw new HttpError(503, "Your account could not be deleted. Please try again.");
  await clearSessionCookies();
  return json({ deleted: true });
});
