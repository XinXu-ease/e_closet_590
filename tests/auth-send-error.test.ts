import assert from "node:assert/strict";
import { test } from "node:test";
import { sendCodeError } from "../src/lib/auth/send-error";

test("OTP delivery errors distinguish limits and configuration without leaking provider details", () => {
  assert.equal(sendCodeError({ code: "over_email_send_rate_limit", status: 429 }).status, 429);
  assert.match(sendCodeError({ code: "email_address_not_authorized" }).message, /test recipients/);
  assert.equal(sendCodeError({ code: "email_address_invalid" }).status, 400);
  assert.match(sendCodeError({ code: "signup_disabled" }).message, /unavailable/);
  const provider = { code: "unexpected_failure", status: 500, message: "SMTP secret recipient@example.com" };
  assert.doesNotMatch(sendCodeError(provider).message, /secret|recipient@example/);
});
