const { expect, request } = require("../setup");
const User = require("../../models/userModel");

describe("Auth Endpoints", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should return 201 if admin registration is successful", async () => {
      const res = await request.post("/api/auth/register").send({
        name: "Admin Test",
        email: "admin@test.com",
        password: "password123",
        role: "admin",
      });
      expect(res.status).to.equal(201);
    });

    it("should return 201 if teacher registration is successful", async () => {
      const res = await request.post("/api/auth/register").send({
        name: "Teacher Test",
        email: "teacher@test.com",
        password: "password123",
        role: "teacher",
        phone: "1234567890",
        address: "Test Address",
        teacher_data: {
          instruments: ["Piano", "Vokal", "Drum", "Gitar", "Biola", "Bass"],
        },
      });
      expect(res.status).to.equal(201);
    });

    it("should return 400 if teacher registers with invalid instrument", async () => {
      const res = await request.post("/api/auth/register").send({
        name: "Invalid Teacher",
        email: "invalid@test.com",
        password: "password123",
        role: "teacher",
        phone: "1234567890",
        address: "Test Address",
        teacher_data: {
          instruments: ["InvalidInstrument"],
        },
      });
      expect(res.status).to.equal(400);
    });

    it("should return 201 if student registration is successful", async () => {
      const res = await request.post("/api/auth/register").send({
        name: "Student Test",
        email: "student@test.com",
        password: "password123",
        role: "student",
        phone: "1234567890",
        address: "Student Address",
      });
      expect(res.status).to.equal(201);
    });

    it("should return 400 if registering with invalid role", async () => {
      const res = await request.post("/api/auth/register").send({
        name: "Invalid Role",
        email: "invalid@test.com",
        password: "password123",
        role: "invalid_role",
      });
      expect(res.status).to.equal(400);
    });

    it("should return 400 if email is missing", async () => {
      const res = await request.post("/api/auth/register").send({
        name: "Missing Email",
        password: "password123",
        role: "student",
        phone: "1234567890",
        address: "Test Address",
      });
      expect(res.status).to.equal(400);
    });

    it("should return 400 if student registers without phone", async () => {
      const res = await request.post("/api/auth/register").send({
        name: "Student No Phone",
        email: "student@test.com",
        password: "password123",
        role: "student",
        address: "Test Address",
      });
      expect(res.status).to.equal(400);
    });

    it("should return 400 if student registers without address", async () => {
      const res = await request.post("/api/auth/register").send({
        name: "Student No Address",
        email: "student@test.com",
        password: "password123",
        role: "student",
        phone: "1234567890",
      });
      expect(res.status).to.equal(400);
    });

    it("should return 400 if email already exists", async () => {
      await request.post("/api/auth/register").send({
        name: "First User",
        email: "duplicate@test.com",
        password: "password123",
        role: "admin",
      });

      const res = await request.post("/api/auth/register").send({
        name: "Second User",
        email: "duplicate@test.com",
        password: "password123",
        role: "admin",
      });
      expect(res.status).to.equal(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request.post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "admin",
      });
    });

    it("should return 200 if login credentials are correct", async () => {
      const res = await request.post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });
      expect(res.status).to.equal(200);
    });

    it("should return 400 if password is incorrect", async () => {
      const res = await request.post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });
      expect(res.status).to.equal(400);
    });

    it("should return 400 if email does not exist", async () => {
      const res = await request.post("/api/auth/login").send({
        email: "nonexistent@test.com",
        password: "password123",
      });
      expect(res.status).to.equal(400);
    });
  });

  describe("POST /api/auth/logout", () => {
    let authToken;

    beforeEach(async () => {
      const registerRes = await request.post("/api/auth/register").send({
        name: "Logout Test",
        email: "logout@test.com",
        password: "password123",
        role: "admin",
      });
      authToken = registerRes.body.token;
    });

    it("should return 200 if logout is successful", async () => {
      const res = await request
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).to.equal(200);
    });

    it("should return 401 if no token provided", async () => {
      const res = await request.post("/api/auth/logout");
      expect(res.status).to.equal(401);
    });

    it("should return 401 if token is invalid", async () => {
      const res = await request
        .post("/api/auth/logout")
        .set("Authorization", "Bearer invalidtoken");
      expect(res.status).to.equal(401);
    });
  });
});
