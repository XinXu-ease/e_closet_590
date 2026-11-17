import { authClient, clearSessionCookies, configured, phoneEnabled, currentSession, HttpError, json, readProfile, requestBody, requireRecent, route } from "@/lib/auth/server";
import { profileInput } from "@/lib/profile";

export const GET = route(async () => {
  const support = process.env.SUPPORT_EMAIL ?? "";
  const supportEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(support) ? support : null;
  if (!configured()) return json({ profile: null, configured: false, supportEmail, phoneEnabled: phoneEnabled() });
  try {
    const { user } = await currentSession();
    return json({ profile: await readProfile(user), configured: true, supportEmail, phoneEnabled: phoneEnabled() });
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) return json({ profile: null, configured: true, supportEmail, phoneEnabled: phoneEnabled() });
    throw error;
  }
});

export const PATCH = route(async (request) => {
  const { user } = await currentSession();
  const body = await requestBody(request);
  let input;
  try { input = profileInput(body); } catch (error) { throw new HttpError(400, (error as Error).message); }
  if (!input.displayName) throw new HttpError(400, "Enter your name.");
  const admin = authClient(true);
  let { error } = await admin.from("profiles").upsert({ user_id: user.id, display_name: input.displayName, avatar_key: "cat", setup_complete: true, updated_at: new Date().toISOString() });
  if (error && /setup_complete/.test(error.message)) {
    ({ error } = await admin.from("profiles").upsert({ user_id: user.id, display_name: input.displayName, avatar_key: "cat", updated_at: new Date().toISOString() }));
  }
  if (error) throw new HttpError(503, "Your changes could not be saved. Please try again.");
  return json({ profile: await readProfile(user) });
});

export const DELETE = route(async () => {
  const { user, session } = await currentSession();
  await requireRecent(session);
  const admin = authClient(true);
  const { data: files, error: listError } = await admin.storage.from("profile-avatars").list(user.id);
  if (listError) throw new HttpError(503, "Your avatar could not be removed. Please try again.");
  if (files?.length) {
    const { error: removeError } = await admin.storage.from("profile-avatars").remove(files.map(file => `${user.id}/${file.name}`));
    if (removeError) throw new HttpError(503, "Your avatar could not be removed. Please try again.");
  }
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw new HttpError(503, "Your account could not be deleted. Please try again.");
  await clearSessionCookies();
  return json({ deleted: true });
});
