import { phoneEnabled, currentSession, HttpError, json, rateLimit, requestBody, requireRecent, route } from "@/lib/auth/server";
import { phoneNumber } from "@/lib/profile";

export const POST = route(async (request) => {
  if (!phoneEnabled()) throw new HttpError(403, "Phone sign-in is not enabled yet.");
  const { client, session } = await currentSession();
  await requireRecent(session);
  const body = await requestBody(request);
  let phone;
  try { phone = phoneNumber(body.phone); } catch (error) { throw new HttpError(400, (error as Error).message); }
  await rateLimit(request, "send", phone);
  const { error } = await client.auth.updateUser({ phone });
  if (error) throw new HttpError(400, "This phone number could not be used. Check the number or try again later.");
  return json({ sent: true, retryAfter: 60 });
});
