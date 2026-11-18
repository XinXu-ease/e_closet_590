import { authClient, currentSession, HttpError, isMobileRequest, json, markRecent, mobileOptions, otp, readProfile, setSessionCookies, phoneEnabled, rateLimit, requestBody, route } from "@/lib/auth/server";
import { otpIdentity } from "@/lib/auth/identity";

export const POST = route(async (request) => {
  const body = await requestBody(request);
  const current = body.purpose === "reauthenticate" ? await currentSession(request) : null;
  let identity;
  try { identity = otpIdentity(body, current?.user ?? null, phoneEnabled()); }
  catch (error) { throw new HttpError(400, (error as Error).message); }
  const { channel, address } = identity;
  const token = otp(body.code);
  await rateLimit(request, "verify", `${channel}:${address}`);
  const { data, error } = await authClient().auth.verifyOtp(channel === "email" ? { email: address, token, type: "email" } : { phone: address, token, type: "sms" });
  if (error || !data.session || !data.user || (current && data.user.id !== current.user.id)) throw new HttpError(400, "That code is invalid or has expired. Please try again.");
  const profile = await readProfile(data.user);
  if (isMobileRequest(request)) {
    return json({ profile, session: { accessToken: data.session.access_token, refreshToken: data.session.refresh_token } });
  }
  await setSessionCookies(data.session);
  if (current) await markRecent(data.session);
  return json({ profile });
});

export const OPTIONS = mobileOptions;
