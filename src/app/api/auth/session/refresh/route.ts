import { authClient, currentSession, HttpError, isMobileRequest, json, mobileOptions, readProfile, requestBody, route } from "@/lib/auth/server";

export const POST = route(async (request) => {
  if (!isMobileRequest(request)) {
    const { user } = await currentSession();
    return json({ profile: await readProfile(user) });
  }
  const body = await requestBody(request);
  if (typeof body.refreshToken !== "string" || body.refreshToken.length < 20 || body.refreshToken.length > 4096) {
    throw new HttpError(401, "Your session expired. Please sign in again.");
  }
  const { data, error } = await authClient().auth.refreshSession({ refresh_token: body.refreshToken });
  if (error || !data.session || !data.user) throw new HttpError(401, "Your session expired. Please sign in again.");
  return json({ profile: await readProfile(data.user), session: { accessToken: data.session.access_token, refreshToken: data.session.refresh_token } });
});

export const OPTIONS = mobileOptions;
