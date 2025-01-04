const { expect, request } = require("../setup");
const User = require("../../models/userModel");
const Package = require("../../models/packageModel");
const StudentPackage = require("../../models/studentPackageModel");

describe("Statistic Endpoints", () => {
  let adminToken, studentToken, teacherToken;
  let studentId, teacherId, packageId, studentPackageId;

  beforeEach(async () => {
    await User.deleteMany({});
    await Package.deleteMany({});
    await StudentPackage.deleteMany({});

    const adminRes = await request.post("/api/auth/register").send({
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

    const studentRes = await request.post("/api/auth/register").send({
      name: "Student Test",
      email: "student@test.com",
      password: "password123",
      role: "student",
      phone: "1234567890",
      address: "Test Address",
    });
    studentToken = studentRes.body.token;
    studentId = studentRes.body._id;

    const packageRes = await Package.create({
      name: "Test Package",
      description: "Test Description",
      duration: 30,
      price: 100000,
      sessionCount: 4,
      instrument: "Piano",
      isActive: true,
    });
    packageId = packageRes._id;

    const studentPackage = await StudentPackage.create({
      student_id: studentId,
      package_id: packageId,
      payment_status: "Lunas",
      payment_total: 100000,
      payment_date: new Date(),
      date_periode: [
        {
          start: new Date(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      ],
      schedules: [
        {
          teacher_id: teacherId,
          date: new Date(),
          time: "10:00",
          teacher_fee: 50000,
          room: "Ruang 1",
          attendance_status: "Belum Berlangsung",
        },
      ],
    });
    studentPackageId = studentPackage._id;
  });

  describe("GET /api/statistics", () => {
    it("should return 200 if admin fetches statistics", async () => {
      const res = await request
        .get("/api/statistics")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("totalUsers");
      expect(res.body).to.have.property("usersByRole");
      expect(res.body).to.have.property("latestUsers");
      expect(res.body).to.have.property("totalActivePackages");
      expect(res.body).to.have.property("activePackages");
      expect(res.body).to.have.property("totalRevenue");
      expect(res.body).to.have.property("latestPayments");
      expect(res.body).to.have.property("paymentStatusCount");
      expect(res.body).to.have.property("scheduleStatusCount");
    });

    it("should return 403 if non-admin tries to fetch statistics", async () => {
      const res = await request
        .get("/api/statistics")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(res.status).to.equal(403);
    });

    it("should return 403 if non-admin tries to fetch statistics", async () => {
      const res = await request
        .get("/api/statistics")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).to.equal(403);
    });
  });
});
