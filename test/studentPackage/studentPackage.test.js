const { expect, request } = require("../setup");
const StudentPackage = require("../../models/studentPackageModel");
const User = require("../../models/userModel");
const Package = require("../../models/packageModel");
const path = require("path");

describe("Student Package Controller", () => {
  let adminToken, teacherToken, studentToken;
  let studentId, teacherId, packageId, studentPackageId;

  beforeEach(async () => {
    await StudentPackage.deleteMany({});
    await User.deleteMany({});
    await Package.deleteMany({});

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

    const package = await Package.create({
      name: "Test Package",
      description: "Test Description",
      duration: 30,
      price: 100000,
      sessionCount: 4,
      instrument: "Piano",
    });
    packageId = package._id;

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

  describe("POST /api/student-packages", () => {
    it("should return 201 if admin creates valid student package", async () => {
      const newPackageData = {
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
          },
        ],
      };

      const res = await request
        .post("/api/student-packages")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newPackageData);

      expect(res.status).to.equal(201);
      expect(res.body.success).to.equal(true);
      expect(res.body.data).to.have.property("student_id");
    });

    it("should return 403 if non-admin tries to create package", async () => {
      const res = await request
        .post("/api/student-packages")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({});

      expect(res.status).to.equal(403);
    });
  });

  describe("GET /api/student-packages", () => {
    it("should return 200 if admin fetches all packages", async () => {
      const res = await request
        .get("/api/student-packages")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an("array");
    });

    it("should return 403 if non-admin tries to fetch all packages", async () => {
      const res = await request
        .get("/api/student-packages")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(res.status).to.equal(403);
    });
  });

  describe("GET /api/student-packages/schedules/teacher", () => {
    it("should return 200 if teacher fetches their schedules", async () => {
      const res = await request
        .get("/api/student-packages/schedules/teacher")
        .set("Authorization", `Bearer ${teacherToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an("array");
    });

    it("should return 403 if non-teacher tries to fetch teacher schedules", async () => {
      const res = await request
        .get("/api/student-packages/schedules/teacher")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).to.equal(403);
    });
  });

  describe("GET /api/student-packages/schedules/student", () => {
    it("should return 200 if student fetches their schedules", async () => {
      const res = await request
        .get("/api/student-packages/schedules/student")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an("array");
    });

    it("should return the correct student's schedules", async () => {
      const res = await request
        .get("/api/student-packages/schedules/student")
        .set("Authorization", `Bearer ${studentToken}`);

      const studentPackage = await StudentPackage.findById(
        res.body.data[0]._id
      );
      expect(studentPackage.student_id.toString()).to.equal(
        studentId.toString()
      );
    });
  });

  describe("PUT /api/student-packages/:id/schedules/:scheduleId/attendance", () => {
    let scheduleId;

    beforeEach(async () => {
      const studentPackage = await StudentPackage.findById(studentPackageId);
      scheduleId = studentPackage.schedules[0]._id;
    });

    it("should return 200 if teacher updates attendance", async () => {
      const res = await request
        .put(
          `/api/student-packages/${studentPackageId}/schedules/${scheduleId}/attendance`
        )
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          attendance_status: "Success",
          note: "Great class!",
        });

      expect(res.status).to.equal(200);
      expect(res.body.data.attendance_status).to.equal("Success");
    });

    it("should return 200 if admin updates attendance", async () => {
      const res = await request
        .put(
          `/api/student-packages/${studentPackageId}/schedules/${scheduleId}/attendance`
        )
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          attendance_status: "Murid Izin",
          note: "Student was sick",
        });

      expect(res.status).to.equal(200);
      expect(res.body.data.attendance_status).to.equal("Murid Izin");
    });

    it("should return 400 if attendance status is invalid", async () => {
      const res = await request
        .put(
          `/api/student-packages/${studentPackageId}/schedules/${scheduleId}/attendance`
        )
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          attendance_status: "Invalid Status",
          note: "Test note",
        });

      expect(res.status).to.equal(400);
    });

    it("should return 403 if student tries to update attendance", async () => {
      const res = await request
        .put(
          `/api/student-packages/${studentPackageId}/schedules/${scheduleId}/attendance`
        )
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          attendance_status: "Success",
          note: "Test note",
        });

      expect(res.status).to.equal(403);
    });
  });

  describe("PUT /api/student-packages/:id/schedules/:scheduleId", () => {
    it("should return 200 if admin updates schedule", async () => {
      const scheduleId = (await StudentPackage.findById(studentPackageId))
        .schedules[0]._id;

      const res = await request
        .put(
          `/api/student-packages/${studentPackageId}/schedules/${scheduleId}`
        )
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          time: "11:00",
          room: "Ruang 2",
          teacher_fee: 60000,
        });

      expect(res.status).to.equal(200);
      expect(res.body.data.time).to.equal("11:00");
      expect(res.body.data.room).to.equal("Ruang 2");
    });
  });

  describe("POST /api/student-packages/:id/schedules", () => {
    it("should return 200 if admin adds new schedule", async () => {
      const newSchedule = {
        teacher_id: teacherId,
        date: new Date(),
        time: "14:00",
        teacher_fee: 50000,
        room: "Ruang 2",
      };

      const res = await request
        .post(`/api/student-packages/${studentPackageId}/schedules`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newSchedule);

      expect(res.status).to.equal(200);
      expect(res.body.data.schedules).to.have.lengthOf(2);
    });
  });

  describe("DELETE endpoints", () => {
    it("should return 200 if admin deletes student package", async () => {
      const res = await request
        .delete(`/api/student-packages/${studentPackageId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      const deletedPackage = await StudentPackage.findById(studentPackageId);
      expect(deletedPackage).to.be.null;
    });

    it("should return 200 if admin deletes schedule", async () => {
      const scheduleId = (await StudentPackage.findById(studentPackageId))
        .schedules[0]._id;

      const res = await request
        .delete(
          `/api/student-packages/${studentPackageId}/schedules/${scheduleId}`
        )
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      const updatedPackage = await StudentPackage.findById(studentPackageId);
      expect(updatedPackage.schedules).to.have.lengthOf(0);
    });
  });
});
