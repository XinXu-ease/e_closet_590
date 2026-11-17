import assert from "node:assert/strict";
import { test } from "node:test";
import { emailAddress } from "../src/lib/profile";
import { otpIdentity } from "../src/lib/auth/identity";

test("email login normalizes addresses and rejects malformed inputs", () => {
  assert.equal(emailAddress(" Alice+closet@Example.com "), "alice+closet@example.com");
  for (const value of [null, "", "user", "a@@b.com", "a b@example.com", `${"a".repeat(250)}@b.com`]) assert.throws(() => emailAddress(value));
  assert.deepEqual(otpIdentity({ email: "Alice@example.com" }, null, false), { channel: "email", address: "alice@example.com" });
});
test("phone sign-in is gated while email stays available", () => {
  assert.throws(() => otpIdentity({ channel: "phone", phone: "+12125550123" }, null, false), /not enabled/);
  assert.deepEqual(otpIdentity({ channel: "phone", phone: "+12125550123" }, null, true), { channel: "phone", address: "+12125550123" });
  assert.throws(() => otpIdentity({ channel: "other" }, null, true), /supported/);
});
test("reauthentication ignores attacker-supplied address and channel", () => {
  assert.deepEqual(otpIdentity({ email: "attacker@example.com", channel: "phone" }, { email: "owner@example.com", phone: "12125550123" }, false), { channel: "email", address: "owner@example.com" });
  assert.deepEqual(otpIdentity({ phone: "+12125550000" }, { phone: "12125550123" }, true), { channel: "phone", address: "+12125550123" });
  assert.throws(() => otpIdentity({}, {}, true));
});
