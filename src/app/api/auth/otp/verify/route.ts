import { authClient, currentSession, HttpError, json, markRecent, otp, rateLimit, readProfile, requestBody, route, setSessionCookies } from "@/lib/auth/server";
import { phoneNumber } from "@/lib/profile";

export const POST = route(async (request) => {
  const body = await requestBody(request);
  const current = body.purpose === "reauthenticate" ? await currentSession() : null;
  let phone: string;
  try { phone = phoneNumber(current ? `+${current.user.phone?.replace(/^\+/, "")}` : body.phone); } catch (error) { throw new HttpError(400, (error as Error).message); }
  const token = otp(body.code);
  await rateLimit(request, "verify", phone);
  const { data, error } = await authClient().auth.verifyOtp({ phone, token, type: "sms" });
  if (error || !data.session || !data.user || (current && data.user.id !== current.user.id)) throw new HttpError(400, "That code is invalid or has expired. Please try again.");
  const profile = await readProfile(data.user);
  await setSessionCookies(data.session);
  if (current) await markRecent(data.session);
  return json({ profile });
});
