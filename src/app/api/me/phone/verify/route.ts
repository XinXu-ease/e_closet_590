import { currentSession, HttpError, json, otp, rateLimit, readProfile, requestBody, requireRecent, route, setSessionCookies } from "@/lib/auth/server";
import { phoneNumber } from "@/lib/profile";

export const POST = route(async (request) => {
  const { client, session, user } = await currentSession();
  await requireRecent(session);
  const body = await requestBody(request);
  let phone;
  try { phone = phoneNumber(body.phone); } catch (error) { throw new HttpError(400, (error as Error).message); }
  await rateLimit(request, "verify", phone);
  const { data, error } = await client.auth.verifyOtp({ phone, token: otp(body.code), type: "phone_change" });
  if (error || !data.user || data.user.id !== user.id) throw new HttpError(400, "That code is invalid or expired. Please try again.");
  if (data.session) await setSessionCookies(data.session);
  if (data.user.phone?.replace(/^\+/, "") !== phone.replace(/^\+/, "")) throw new HttpError(400, "Your phone change is still pending. Complete the verification required by your account provider before continuing.");
  return json({ profile: await readProfile(data.user) });
});
