/** Never expose provider messages: they may contain recipient or SMTP details. */
export function sendCodeError(error: { code?: string; status?: number }) {
  const code = error.code ?? "";
  if (error.status === 429 || code.startsWith("over_")) return { status: 429, message: "Too many code requests. Please wait before trying again." };
  if (code === "email_address_invalid") return { status: 400, message: "This email address cannot receive a code. Check the address and try again." };
  if (code === "email_address_not_authorized") return { status: 503, message: "Email delivery is restricted to test recipients. Please contact support." };
  if (["email_provider_disabled", "phone_provider_disabled", "signup_disabled", "otp_disabled"].includes(code)) return { status: 503, message: "This sign-in method is currently unavailable. Please contact support." };
  return { status: 503, message: "The email or SMS service could not send your code. Please try again later." };
}
