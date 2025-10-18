import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "app";

describe("🔐 User Authentication & Profile Management API", () => {
  // 🔹 Test user payload
  const payload = {
    name: "Anamul Hassan",
    email: new Date().toISOString().trim() + "test@gmail.com",
    password: "Anamul2025!",
  };

  let accessToken: string;
  let userId: string;

  describe("👤 User Registration & Sign-in", () => {
    // ✅ Test: Register new user
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/v1/users/register")
        .send(payload);

      userId = res?.body?.data?._id;

      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty(
        "message",
        "User was successfully created and is now available."
      );
    });

    // ❌ Test: Duplicate registration
    it("should fail to register an existing user", async () => {
      const res = await request(app)
        .post("/api/v1/users/register")
        .send(payload);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body.message).toContain(
        "User already exists. Please use a different one or log in."
      );
    });

    // ✅ Test: Sign in with correct credentials
    it("should sign in an existing user", async () => {
      const res = await request(app).post("/api/v1/auth/signin").send({
        email: payload.email,
        password: payload.password,
      });

      accessToken = res?.body?.data?.accessToken;

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body).toHaveProperty("success", true);
      expect(accessToken).toBeDefined();
    });
  });

  describe("✏️ User Update API", () => {
    // ✅ Test: Update user profile
    it("should update user information by ID", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/update/${userId}`)
        .set("Authorization", accessToken)
        .send({
          name: "Anamul Hassan Update",
        });

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty(
        "message",
        "User was successfully updated with the latest information."
      );
    });

    // ❌ Test: Should fail without token
    it("should fail to update user if no token provided", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/update/${userId}`)
        .send({ name: "Hacker Update" });

      expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(res.body).toHaveProperty("success", false);
    });
  });
});
