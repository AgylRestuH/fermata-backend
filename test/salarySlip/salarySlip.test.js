const { expect, request } = require("../setup");
const SalarySlip = require("../../models/salarySlipModel");
const User = require("../../models/userModel");

describe("Salary Slip Endpoints", () => {
  let adminToken, teacherToken, teacherId, salarySlipId;

  beforeEach(async () => {
    await SalarySlip.deleteMany({});
    await User.deleteMany({});

    await request.post("/api/auth/register").send({
      name: "Admin Test",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });
    const adminLogin = await request.post("/api/auth/login").send({
      email: "admin@test.com",
      password: "password123",
    });
    adminToken = adminLogin.body.token;

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
    teacherId = teacherRes.body._id;

    const salarySlip = await SalarySlip.create({
      teacher_id: teacherId,
      month: 6,
      year: 2024,
      total_salary: 5050000,
      details: [
        {
          student_name: "John Doe",
          instrument: "Piano",
          date: new Date(),
          room: "Room A",
          attendance_status: "Success",
          fee_class: 50000,
          fee_transport: 10000,
          total_fee: 60000,
        },
      ],
    });
    salarySlipId = salarySlip._id;
  });

  describe("GET /api/salary-slips", () => {
    it("should return 200 and list all salary slips for admin", async () => {
      const res = await request
        .get("/api/salary-slips")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an("array");
      expect(res.body.data.length).to.be.greaterThan(0);
    });

    it("should return 403 for non-admin users", async () => {
      const res = await request
        .get("/api/salary-slips")
        .set("Authorization", `Bearer ${teacherToken}`);
      expect(res.status).to.equal(403);
    });
  });

  describe("GET /api/salary-slips/:teacherId/:month/:year", () => {
    it("should return 200 and salary slip details for a valid request", async () => {
      const res = await request
        .get(`/api/salary-slips/${teacherId}/6/2024`)
        .set("Authorization", `Bearer ${teacherToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.teacher_id._id.toString()).to.equal(teacherId);
      expect(res.body.data.month).to.equal(6);
      expect(res.body.data.year).to.equal(2024);
    });

    it("should return 404 if salary slip does not exist", async () => {
      const res = await request
        .get(`/api/salary-slips/${teacherId}/7/2024`)
        .set("Authorization", `Bearer ${teacherToken}`);
      expect(res.status).to.equal(404);
    });
  });

  describe("GET /api/salary-slips/download/:teacherId/:month/:year", () => {
    it("should return 200 and download the salary slip as PDF", async () => {
      const res = await request
        .get(`/api/salary-slips/download/${teacherId}/6/2024`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.header["content-type"]).to.equal("application/pdf");
    });

    it("should return 404 if salary slip does not exist", async () => {
      const res = await request
        .get(`/api/salary-slips/download/${teacherId}/7/2024`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).to.equal(404);
    });
  });
});
