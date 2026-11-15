export const AVATARS = ["cat", "closet", "pin"] as const;
export type AvatarKey = typeof AVATARS[number];
export type Profile = { id: string; displayName: string; avatarKey: AvatarKey; phone: string; createdAt: string };
export type AccountResponse = { profile: Profile | null; configured: boolean; supportEmail: string | null };

export function phoneNumber(value: unknown): string {
  if (typeof value !== "string") throw new Error("Enter a phone number including its country code.");
  const normalized = value.replace(/[\s()-]/g, "");
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) throw new Error("Enter a valid phone number including its country code, such as +1 or +86.");
  return normalized;
}

export function profileInput(value: Record<string, unknown>) {
  if (typeof value.displayName !== "string" || value.displayName.trim().length > 40) throw new Error("Your name must be 40 characters or fewer.");
  if (!AVATARS.includes(value.avatarKey as AvatarKey)) throw new Error("Choose one of the available avatars.");
  return { displayName: value.displayName.trim(), avatarKey: value.avatarKey as AvatarKey };
}
