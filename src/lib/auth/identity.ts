import { emailAddress, phoneNumber } from "../profile";

/** Reauthentication always targets the server-verified account, never client input. */
export function otpIdentity(body: Record<string, unknown>, user: { email?: string; phone?: string } | null, phoneEnabled: boolean) {
  const channel = user ? (user.email ? "email" : "phone") : (body.channel ?? "email");
  if (channel !== "email" && channel !== "phone") throw new Error("Choose a supported sign-in method.");
  if (channel === "phone" && !phoneEnabled) throw new Error("Phone sign-in is not enabled yet. Use email to sign in.");
  const address = channel === "email" ? emailAddress(user ? user.email : body.email) : phoneNumber(user ? `+${user.phone?.replace(/^\+/, "")}` : body.phone);
  return { channel, address };
}
