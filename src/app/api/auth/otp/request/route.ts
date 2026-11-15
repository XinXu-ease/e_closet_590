import { authClient, currentSession, HttpError, json, rateLimit, requestBody, route } from "@/lib/auth/server";
import { phoneNumber } from "@/lib/profile";

export const POST = route(async (request) => {
  const body = await requestBody(request);
  let phone: string;
  if (body.purpose === "reauthenticate") {
    const { user } = await currentSession();
    if (!user.phone) throw new HttpError(400, "This account has no verified phone number.");
    phone = `+${user.phone.replace(/^\+/, "")}`;
  } else {
    try { phone = phoneNumber(body.phone); } catch (error) { throw new HttpError(400, (error as Error).message); }
  }
  await rateLimit(request, "send", phone);
  const { error } = await authClient().auth.signInWithOtp({ phone, options: { shouldCreateUser: body.purpose !== "reauthenticate" } });
  if (error) throw new HttpError(error.status === 429 ? 429 : 503, "A code could not be sent. Please wait and try again.");
  return json({ sent: true, retryAfter: 60 });
});
