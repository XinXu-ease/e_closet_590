import { currentSession, json, readProfile, route } from "@/lib/auth/server";
export const POST = route(async () => {
  const { user } = await currentSession();
  return json({ profile: await readProfile(user) });
});
