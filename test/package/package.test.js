const { expect, request } = require("../setup");
const Package = require("../../models/packageModel");

describe("Package Endpoints", () => {
  let adminToken, packageId;

  beforeEach(async () => {
    await Package.deleteMany({});

    const adminRes = await request.post("/api/auth/register").send({
      name: "Admin Test",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });

    const loginRes = await request.post("/api/auth/login").send({
      email: "admin@test.com",
      password: "password123",
    });
    adminToken = loginRes.body.token;

    const package = await Package.create({
      name: "Test Package",
      description: "Test Description",
      duration: 30,
      price: 100000,
      sessionCount: 4,
      instrument: "Piano",
      isActive: true,
    });
    packageId = package._id;
  });

  describe("GET /api/packages", () => {
    it("should return 200 and only active packages", async () => {
      const res = await request.get("/api/packages");
      expect(res.status).to.equal(200);
    });
  });

  describe("POST /api/packages", () => {
    it("should return 201 if package creation successful", async () => {
      const res = await request
        .post("/api/packages")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "New Package",
          description: "New Description",
          duration: 45,
          price: 150000,
          sessionCount: 8,
          instrument: "Gitar",
        });
      expect(res.status).to.equal(201);
    });

    it("should return 400 if duration invalid", async () => {
      const res = await request
        .post("/api/packages")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Invalid Package",
          description: "Invalid Description",
          duration: 20,
          price: 150000,
          sessionCount: 8,
          instrument: "Gitar",
        });
      expect(res.status).to.equal(400);
    });

    it("should return 400 if instrument invalid", async () => {
      const res = await request
        .post("/api/packages")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Invalid Package",
          description: "Invalid Description",
          duration: 30,
          price: 150000,
          sessionCount: 8,
          instrument: "Invalid",
        });
      expect(res.status).to.equal(400);
    });
  });

  describe("PUT /api/packages/:id", () => {
    it("should return 200 if update successful", async () => {
      const res = await request
        .put(`/api/packages/${packageId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Package",
        });
      expect(res.status).to.equal(200);
    });

    it("should return 404 if package not found", async () => {
      const res = await request
        .put("/api/packages/123456789012345678901234")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Package",
        });
      expect(res.status).to.equal(404);
    });

    it("should return 403 if non-admin tries to update", async () => {
      const userRes = await request.post("/api/auth/register").send({
        name: "Regular User",
        email: "user@test.com",
        password: "password123",
        role: "student",
        phone: "1234567890",
        address: "Test Address",
      });

      const res = await request
        .put(`/api/packages/${packageId}`)
        .set("Authorization", `Bearer ${userRes.body.token}`)
        .send({
          name: "Updated Package",
        });
      expect(res.status).to.equal(403);
    });
  });

  describe("DELETE /api/packages/:id", () => {
    it("should return 200 and set isActive to false", async () => {
      const res = await request
        .delete(`/api/packages/${packageId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);

      const deletedPackage = await Package.findById(packageId);
      expect(deletedPackage.isActive).to.equal(false);
    });

    it("should return 404 if package not found", async () => {
      const res = await request
        .delete("/api/packages/123456789012345678901234")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).to.equal(404);
    });

    it("should return 403 if non-admin tries to delete", async () => {
      const userRes = await request.post("/api/auth/register").send({
        name: "Regular User",
        email: "user2@test.com",
        password: "password123",
        role: "student",
        phone: "1234567890",
        address: "Test Address",
      });

      const res = await request
        .delete(`/api/packages/${packageId}`)
        .set("Authorization", `Bearer ${userRes.body.token}`);
      expect(res.status).to.equal(403);
    });
  });
});
