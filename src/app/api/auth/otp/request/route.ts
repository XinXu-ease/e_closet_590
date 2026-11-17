import { authClient, currentSession, HttpError, json, phoneEnabled, rateLimit, requestBody, route } from "@/lib/auth/server";
import { otpIdentity } from "@/lib/auth/identity";
import { sendCodeError } from "@/lib/auth/send-error";

export const POST = route(async (request) => {
  const body = await requestBody(request);
  const current = body.purpose === "reauthenticate" ? await currentSession() : null;
  let identity;
  try { identity = otpIdentity(body, current?.user ?? null, phoneEnabled()); }
  catch (error) { throw new HttpError(400, (error as Error).message); }
  const { channel, address } = identity;

  await rateLimit(request, "send", `${channel}:${address}`);
  const options = { shouldCreateUser: !current };
  const { error } = await authClient().auth.signInWithOtp(channel === "email" ? { email: address, options } : { phone: address, options });
  if (error) {
    // Log only structured diagnostics, never provider messages, addresses or tokens.
    const code = /^[a-z_]{1,80}$/.test(error.code ?? "") ? error.code : "unknown";
    console.error("[auth.otp.send]", { channel, code, status: error.status });
    const failure = sendCodeError(error);
    throw new HttpError(failure.status, failure.message);
  }
  return json({ sent: true, retryAfter: 60 });
});
