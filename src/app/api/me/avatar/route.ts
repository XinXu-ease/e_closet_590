import { authClient, currentSession, HttpError, json, mobileOptions, readProfile, route } from "@/lib/auth/server";

const MAX_AVATAR_BYTES = 512 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const GET = route(async (request) => {
  const { user } = await currentSession(request);
  const storage = authClient(true).storage.from("profile-avatars");
  const { data, error } = await storage.download(`${user.id}/avatar.jpg`);
  if (error || !data) throw new HttpError(404, "Your avatar is not available.");
  return new Response(data, { headers: { "Content-Type": data.type || "image/jpeg", "Cache-Control": "private, max-age=300" } });
});

export const POST = route(async (request) => {
  const { user } = await currentSession(request);
  const length = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(length) || length > MAX_AVATAR_BYTES + 2048) throw new HttpError(413, "Choose a smaller avatar image.");
  let form: FormData;
  try { form = await request.formData(); } catch { throw new HttpError(400, "The avatar image could not be read."); }
  const image = form.get("avatar");
  if (!(image instanceof File) || !ALLOWED_TYPES.has(image.type) || !image.size || image.size > MAX_AVATAR_BYTES) throw new HttpError(400, "Choose a JPG, PNG, or WebP avatar smaller than 512 KB.");
  const admin = authClient(true);
  const { error: uploadError } = await admin.storage.from("profile-avatars").upload(`${user.id}/avatar.jpg`, image, { upsert: true, contentType: image.type, cacheControl: "300" });
  if (uploadError) throw new HttpError(503, "Your avatar could not be uploaded. Please try again.");
  const { error: profileError } = await admin.from("profiles").upsert({ user_id: user.id, avatar_path: `${user.id}/avatar.jpg`, updated_at: new Date().toISOString() });
  if (profileError) throw new HttpError(503, "Your avatar could not be saved. Please try again.");
  return json({ profile: await readProfile(user) });
});

export const OPTIONS = mobileOptions;
