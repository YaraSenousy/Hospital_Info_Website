const request = require("supertest");
const { faker } = require("@faker-js/faker");
const app = require("../index1");
const bcrypt = require("bcryptjs");
const { User } = require("../models/User.model");
const mongoose = require("mongoose");

describe("Doctor & Patient API Tests", () => {
  let adminAuthCookie;
  let testDoctors = [], testPatients = [];

  beforeAll(async () => {
    await User.deleteMany({});

    const adminUser = {
      name: "Admin User",
      email: "admin@example.com",
      password: await bcrypt.hash("adminpassword123", 10),
      birthDate: "1990-01-01",
      phoneNumber: "+1234567890",
      gender: "female",
      role: "admin",
    };
    await User.create(adminUser);

    const loginRes = await request(app).post("/hospital/user/login").send({
      email: "admin@example.com",
      password: "adminpassword123",
    });

    adminAuthCookie = loginRes.headers["set-cookie"];

    for (let i = 0; i < 10; i++) {
      testDoctors.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "ValidPassword1",
        birthDate: faker.date.past({ years: 40 }).toISOString().split("T")[0],
        phoneNumber: "+201158820884",
        role: "doctor",
        gender: faker.helpers.arrayElement(["male", "female"]),
        expertiseLevel: [faker.lorem.word(), faker.lorem.word()],
      });

      testPatients.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "ValidPassword1",
        birthDate: faker.date.past({ years: 30 }).toISOString().split("T")[0],
        phoneNumber: "+201158820884",
        role: "patient",
        gender: faker.helpers.arrayElement(["male", "female"]),
      });
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  const logErrorResponse = (res) => {
    if (res.statusCode !== 200 && res.statusCode !== 201) {
      console.error("Error Response:", res.body);
    }
  };

  it("should add doctors", async () => {
    for (const doctor of testDoctors) {
      const res = await request(app)
        .post("/hospital/doctor/addDoctor")
        .set("Cookie", adminAuthCookie)
        .send(doctor);
      logErrorResponse(res);
      expect(res.statusCode).toBe(201);
      doctor._id = res.body._id;
      doctor.userId = res.body._id; // Store both IDs
    }
  });

  it("should add patients", async () => {
    for (const patient of testPatients) {
      const res = await request(app).post("/hospital/patient/signup").send(patient);
      logErrorResponse(res);
      expect(res.statusCode).toBe(201);
      patient._id = res.body._id;
    }
  });

  it("should get doctors with different pagination limits", async () => {
    for (let limit = 1; limit <= 5; limit++) {
      const res = await request(app)
        .get(`/hospital/doctor/getDoctors?page=1&limit=${limit}`)
        .set("Cookie", adminAuthCookie);
      logErrorResponse(res);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(limit);
    }
  });

  it("should get patients with different pagination limits", async () => {
    for (let limit = 1; limit <= 5; limit++) {
      const res = await request(app)
        .get(`/hospital/patient/getPatients?page=1&limit=${limit}`)
        .set("Cookie", adminAuthCookie);
      logErrorResponse(res);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(limit);
    }
  });

  it("should get doctors using different filters", async () => {
    const doctor = testDoctors[0];
    const res = await request(app)
      .get(`/hospital/doctor/getDoctors?email=${encodeURIComponent(doctor.email)}`)
      .set("Cookie", adminAuthCookie);
    logErrorResponse(res);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].email).toBe(doctor.email);
  });

  it("should get patients using different filters", async () => {
    const patient = testPatients[0];
    const res = await request(app)
      .get(`/hospital/patient/getPatients?name=${encodeURIComponent(patient.name)}`)
      .set("Cookie", adminAuthCookie);
    logErrorResponse(res);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe(patient.name);
  });

  it("should remove doctors", async () => {
    for (const doctor of testDoctors) {
      const res = await request(app)
        .delete("/hospital/doctor/")
        .set("Cookie", adminAuthCookie)
        .send({ id: doctor._id });
      logErrorResponse(res);
      expect(res.statusCode).toBe(200);
    }
  });

  it("should remove patients", async () => {
    for (const patient of testPatients) {
      const res = await request(app)
        .delete("/hospital/patient/")
        .set("Cookie", adminAuthCookie)
        .send({ id: patient._id });
      logErrorResponse(res);
      expect(res.statusCode).toBe(200);
    }
  });
});
