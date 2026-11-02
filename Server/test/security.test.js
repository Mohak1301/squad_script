import test from "node:test";
import assert from "node:assert/strict";
import JWT from "jsonwebtoken";

process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-tests";
process.env.NODE_ENV = "test";
const { requireSignIn } = await import("../middleware/authmiddleware.js");
const { rejectUnsafeInput, requireDatabaseConnection } = await import("../middleware/security.js");

const response = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

const accessToken = JWT.sign({ _id: "user-1", scope: "access" }, process.env.JWT_SECRET, { algorithm: "HS256" });

test("authentication accepts legacy raw tokens", async () => {
  const req = { headers: { authorization: accessToken } };
  const res = response();
  let called = false;
  await requireSignIn(req, res, () => { called = true; });
  assert.equal(called, true);
  assert.equal(req.user._id, "user-1");
});

test("authentication accepts Bearer and secure cookie sessions", async () => {
  for (const headers of [{ authorization: `Bearer ${accessToken}` }, { cookie: `ss_session=${accessToken}` }]) {
    const req = { headers };
    const res = response();
    let called = false;
    await requireSignIn(req, res, () => { called = true; });
    assert.equal(called, true);
  }
});

test("authentication rejects missing and wrong-scope tokens", async () => {
  const resetToken = JWT.sign({ _id: "user-1", scope: "password-reset" }, process.env.JWT_SECRET);
  for (const headers of [{}, { authorization: resetToken }]) {
    const res = response();
    await requireSignIn({ headers }, res, () => assert.fail("next must not run"));
    assert.equal(res.statusCode, 401);
  }
});

test("unsafe Mongo-style input is rejected without blocking normal input", () => {
  const unsafeRes = response();
  rejectUnsafeInput({ body: { email: { $ne: null } }, query: {}, params: {} }, unsafeRes, () => assert.fail("next must not run"));
  assert.equal(unsafeRes.statusCode, 400);

  let called = false;
  rejectUnsafeInput({ body: { email: "user@example.com" }, query: {}, params: {} }, response(), () => { called = true; });
  assert.equal(called, true);
});

test("database guard returns a clear 503 when Mongo is unavailable", () => {
  const originalMongoUrl = process.env.MONGOURL;
  delete process.env.MONGOURL;

  const res = response();
  requireDatabaseConnection({}, res, () => assert.fail("next must not run"));
  assert.equal(res.statusCode, 503);
  assert.match(res.body.message, /Database is not configured/i);

  if (originalMongoUrl) process.env.MONGOURL = originalMongoUrl;
});

test("CORS accepts loopback development origins but rejects unrelated sites", async () => {
  const { corsOptions } = await import("../server.js");
  await new Promise((resolve, reject) => corsOptions.origin("http://127.0.0.1:5173", (error, allowed) => error ? reject(error) : allowed ? resolve() : reject(new Error("Origin was not allowed"))));
  await new Promise((resolve, reject) => corsOptions.origin("http://localhost:3001/", (error, allowed) => error ? reject(error) : allowed ? resolve() : reject(new Error("Origin was not allowed"))));
  await new Promise((resolve, reject) => corsOptions.origin("https://evil.example", (error) => error ? resolve() : reject(new Error("Unrelated origin was allowed"))));
});
