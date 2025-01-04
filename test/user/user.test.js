const { expect, request } = require("../setup");
const User = require("../../models/userModel");

describe("User and Profile Endpoints", () => {
  let adminToken, teacherToken, studentToken, userId;

  beforeEach(async () => {
    await User.deleteMany({});

    const adminRes = await request.post("/api/auth/register").send({
      name: "Admin Test",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });
    adminToken = adminRes.body.token;

    const teacherRes = await request.post("/api/auth/register").send({
      name: "Teacher Test",
      email: "teacher@test.com",
      password: "password123",
      role: "teacher",
      phone: "1234567890",
      address: "Test Address",
      teacher_data: {
        instruments: ["Piano"],
      },
    });
    teacherToken = teacherRes.body.token;

    const studentRes = await request.post("/api/auth/register").send({
      name: "Student Test",
      email: "student@test.com",
      password: "password123",
      role: "student",
      phone: "1234567890",
      address: "Test Address",
    });
    studentToken = studentRes.body.token;
    userId = studentRes.body._id;
  });

  describe("GET /api/users/profile", () => {
    it("should return 200 if profile fetch successful", async () => {
      const res = await request
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${studentToken}`);
      expect(res.status).to.equal(200);
    });

    it("should return 401 if no token provided", async () => {
      const res = await request.get("/api/users/profile");
      expect(res.status).to.equal(401);
    });
  });

  describe("PUT /api/users/profile", () => {
    it("should return 200 if profile update successful", async () => {
      const res = await request
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          name: "Updated Name",
          phone: "9876543210",
        });
      expect(res.status).to.equal(200);
    });

    it("should return 401 if user not found", async () => {
      await User.findByIdAndDelete(userId);
      const res = await request
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          name: "Updated Name",
        });
      expect(res.status).to.equal(401);
    });

    it("should return 200 if teacher updates instruments", async () => {
      const res = await request
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          teacher_data: {
            instruments: ["Piano", "Gitar"],
          },
        });
      expect(res.status).to.equal(200);
    });
  });

  describe("GET /api/users", () => {
    it("should return 200 if admin fetches all users", async () => {
      const res = await request
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
    });

    it("should return 403 if non-admin tries to fetch users", async () => {
      const res = await request
        .get("/api/users")
        .set("Authorization", `Bearer ${studentToken}`);
      expect(res.status).to.equal(403);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should return 200 if admin deletes user", async () => {
      const res = await request
        .delete(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
    });

    it("should return 404 if user not found", async () => {
      const res = await request
        .delete("/api/users/123456789012345678901234")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).to.equal(404);
    });

    it("should return 403 if non-admin tries to delete", async () => {
      const res = await request
        .delete(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${studentToken}`);
      expect(res.status).to.equal(403);
    });
  });

  describe("PUT /api/users/profile/:id", () => {
    it("should return 200 if admin updates user", async () => {
      const res = await request
        .put(`/api/users/profile/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Admin Updated",
          phone: "9876543210",
        });
      expect(res.status).to.equal(200);
    });

    it("should return 404 if user not found", async () => {
      const res = await request
        .put("/api/users/profile/123456789012345678901234")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Invalid Update",
        });
      expect(res.status).to.equal(404);
    });

    it("should return 403 if non-admin tries to update", async () => {
      const res = await request
        .put(`/api/users/profile/${userId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          name: "Unauthorized Update",
        });
      expect(res.status).to.equal(403);
    });
  });
});
