const request = require("supertest");
const app = require("../server");
const pool = require("../src/db");

async function registerAndGetOTP(emailPrefix = "test") {
  const email = `${emailPrefix}_${Date.now()}@allForOne.com`;
  const logSpy = jest.spyOn(console, "log");

  await request(app)
    .post("/api/auth/register")
    .send({ name: "Test User", email, password: "123456" });

  const otpLog = logSpy.mock.calls.find((call) =>
    call[0].includes(`OTP for ${email}`),
  );
  const otp = otpLog[0].split(": ")[1];

  logSpy.mockRestore();
  return { email, otp };
}

describe("Auth - Register", () => {
  test("should register a new user successfully", async () => {
    const email = `test_${Date.now()}@allForOne.com`;
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Jest Test User", email, password: "123456" });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(email);
    expect(res.body.data.is_verified).toBe(false);
  });

  test("should reject registration with missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Incomplete User" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should reject registration with non-company email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Wrong Domain User",
      email: "test@gmail.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should reject duplicate email registration", async () => {
    const email = `dup_${Date.now()}@allForOne.com`;
    await request(app)
      .post("/api/auth/register")
      .send({ name: "First User", email, password: "123456" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Second User", email, password: "123456" });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe("Auth - Verify OTP", () => {
  test("should verify a user with correct OTP", async () => {
    const { email, otp } = await registerAndGetOTP("verify");

    const res = await request(app)
      .post("/api/auth/verify-otp")
      .send({ email, otp });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("should reject verification with wrong OTP", async () => {
    const { email } = await registerAndGetOTP("wrongotp");

    const res = await request(app)
      .post("/api/auth/verify-otp")
      .send({ email, otp: "000000" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should reject verification for non-existent user", async () => {
    const res = await request(app)
      .post("/api/auth/verify-otp")
      .send({ email: "nouser@allForOne.com", otp: "123456" });

    expect(res.statusCode).toBe(404);
  });
});

describe("Auth - Resend OTP", () => {
  test("should resend a new OTP successfully", async () => {
    const { email } = await registerAndGetOTP("resend");

    const res = await request(app).post("/api/auth/resend-otp").send({ email });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("should reject resend for already verified user", async () => {
    const { email, otp } = await registerAndGetOTP("resendverified");
    await request(app).post("/api/auth/verify-otp").send({ email, otp });

    const res = await request(app).post("/api/auth/resend-otp").send({ email });

    expect(res.statusCode).toBe(400);
  });
});

describe("Auth - Login", () => {
  test("should login successfully with correct credentials", async () => {
    const { email, otp } = await registerAndGetOTP("login");
    await request(app).post("/api/auth/verify-otp").send({ email, otp });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  test("should reject login with wrong password", async () => {
    const { email, otp } = await registerAndGetOTP("wrongpass");
    await request(app).post("/api/auth/verify-otp").send({ email, otp });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
  });

  test("should reject login for unverified user", async () => {
    const { email } = await registerAndGetOTP("unverified");

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "123456" });

    expect(res.statusCode).toBe(403);
  });
});

describe("Auth - Protected Route (/me)", () => {
  test("should access /me with a valid token", async () => {
    const { email, otp } = await registerAndGetOTP("me");
    await request(app).post("/api/auth/verify-otp").send({ email, otp });
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "123456" });
    const token = loginRes.body.accessToken;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(email);
  });

  test("should reject /me without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });
});

describe("Auth - Forgot & Reset Password", () => {
  test("should reset password and allow login with new password", async () => {
    const { email, otp } = await registerAndGetOTP("reset");
    await request(app).post("/api/auth/verify-otp").send({ email, otp });

    const logSpy = jest.spyOn(console, "log");
    await request(app).post("/api/auth/forgot-password").send({ email });
    const resetLog = logSpy.mock.calls.find((call) =>
      call[0].includes(`Password reset code for ${email}`),
    );
    const resetCode = resetLog[0].split(": ")[1];
    logSpy.mockRestore();

    const resetRes = await request(app)
      .post("/api/auth/reset-password")
      .send({ email, resetCode, newPassword: "newpass789" });
    expect(resetRes.statusCode).toBe(200);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "newpass789" });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty("accessToken");
  });

  test("should reject reset with wrong code", async () => {
    const { email, otp } = await registerAndGetOTP("wrongreset");
    await request(app).post("/api/auth/verify-otp").send({ email, otp });
    await request(app).post("/api/auth/forgot-password").send({ email });

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ email, resetCode: "000000", newPassword: "newpass789" });

    expect(res.statusCode).toBe(400);
  });
});

afterAll(async () => {
  await pool.end();
});
