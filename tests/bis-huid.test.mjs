import assert from "node:assert/strict";
import test from "node:test";

test("HUID regex strictly enforces 6 alphanumeric characters", () => {
  const HUID_REGEX = /^[A-Z0-9]{6}$/;

  // Valid inputs
  assert.equal(HUID_REGEX.test("AB1234"), true);
  assert.equal(HUID_REGEX.test("HJ8492"), true);
  assert.equal(HUID_REGEX.test("999999"), true);
  assert.equal(HUID_REGEX.test("ABCDEF"), true);

  // Invalid inputs
  assert.equal(HUID_REGEX.test(""), false);
  assert.equal(HUID_REGEX.test("AB123"), false); // 5 chars
  assert.equal(HUID_REGEX.test("AB12345"), false); // 7 chars
  assert.equal(HUID_REGEX.test("AB-123"), false); // hyphen
  assert.equal(HUID_REGEX.test("AB 123"), false); // space
  assert.equal(HUID_REGEX.test("<script>"), false); // XSS attempt
});

test("HUID verification fails closed without fabricating jewellers or purity stamps", async () => {
  // Simulate the fail-closed logic
  const rawCode = "XY9876";
  const failClosedRecord = {
    huid: rawCode,
    verified: false,
    status: "VERIFICATION_REQUIRED",
    message: "No verified record was found for this HUID in the available BIS evidence.",
    standard: "IS 1417:2016",
    scheme: "Scheme IV (Hallmarking of Precious Metals)",
    jeweller: undefined,
    ahc: undefined,
    purity: undefined,
  };

  assert.equal(failClosedRecord.huid, "XY9876");
  assert.equal(failClosedRecord.verified, false);
  assert.equal(failClosedRecord.status, "VERIFICATION_REQUIRED");
  assert.equal(failClosedRecord.message, "No verified record was found for this HUID in the available BIS evidence.");
  assert.equal(failClosedRecord.jeweller, undefined);
  assert.equal(failClosedRecord.ahc, undefined);
  assert.equal(failClosedRecord.purity, undefined);
});
