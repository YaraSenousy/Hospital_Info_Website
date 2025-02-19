// auth.test.js - Signup, Login & Token Authentication Tests
const request = require("supertest");
const { faker } = require("@faker-js/faker");
const app = require("../index"); // Ensure correct path to your Express app

describe("Authentication Tests", () => {
  let token = "";
  let userId = "";

  const generateRandomUser = (role = "patient") => ({
    name: faker.person.fullName(),
    email: "validpatient@gmail.com",
    password: "validpassword",
    birthDate: faker.date.past(30, new Date(2000, 0, 1)).toISOString().split("T")[0],
    phoneNumber: faker.phone.number("+1##########"),
    role,
    gender: faker.helpers.arrayElement(["M", "F"]),
    expertiseLevel: role === "doctor" ? [faker.lorem.word(), faker.lorem.word()] : undefined,
  });

  describe.each([
    generateRandomUser(),
    { ...generateRandomUser(), email: "invalid-email" }, // Invalid email
    { ...generateRandomUser(), password: "short" }, // Weak password
    { ...generateRandomUser(), birthDate: "3000-01-01" }, // Future birth date
    { ...generateRandomUser(), phoneNumber: "invalid" }, // Invalid phone
  ])("Patient Signup Scenarios", (randomUser) => {
    it(`should attempt to sign up user: ${randomUser.email}`, async () => {
      const res = await request(app).post("/hospital/patient/signup").send(randomUser);
      if (randomUser.email.includes("@") && randomUser.password.length >= 8 && /[A-Z]/.test(randomUser.password) && /[0-9]/.test(randomUser.password)) {
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("userId");
        userId = res.body.userId;
      } else {
        expect(res.statusCode).toBe(400);
      }
    });
  });

  describe("Doctor Signup Scenarios", () => {
    const adminToken = "valid_admin_token"; // Assume admin login has been handled
    
    it("should allow an admin to add a doctor", async () => {
      const doctor = { ...generateRandomUser("doctor"), email: "validdoctor@gmail.com", password:"validpassword" };
      const res = await request(app)
        .post("/hospital/doctor/addDoctor")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(doctor);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("userId");
    });

    it("should reject doctor signup without expertiseLevel", async () => {
      const doctor = { ...generateRandomUser("doctor"), expertiseLevel: undefined };
      const res = await request(app)
        .post("/hospital/doctor/addDoctor")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(doctor);
      expect(res.statusCode).toBe(400);
    });
  });

  describe("Login Scenarios", () => {
    const validUser = generateRandomUser();
    beforeAll(async () => {
      await request(app).post("/hospital/patient/signup").send(validUser);
    });

    it("should log in a user with correct credentials", async () => {
      const res = await request(app).post("/hospital/user/login").send({
        email: validUser.email,
        password: validUser.password,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      token = res.body.token;
    });

    it("should reject login with incorrect password", async () => {
      const res = await request(app).post("/hospital/user/login").send({
        email: validUser.email,
        password: "wrongpassword123",
      });
      expect(res.statusCode).toBe(401);
    });

    it("should reject login with non-existent email", async () => {
      const res = await request(app).post("/hospital/user/login").send({
        email: "doesnotexist@example.com",
        password: validUser.password,
      });
      expect(res.statusCode).toBe(401);
    });

    it("should reject login with empty fields", async () => {
      const res = await request(app).post("/hospital/user/login").send({});
      expect(res.statusCode).toBe(400);
    });
  });

  //describe("Token Authentication", () => {
    //it("should allow access to a protected route with a valid token", async () => {
     // const res = await request(app)
       // .get("/hospital/user/profile")
        //.set("Authorization", `Bearer ${token}`);
      //expect(res.statusCode).toBe(200);
    //});

    //it("should reject access to a protected route without a token", async () => {
     // const res = await request(app).get("/hospital/user/profile");
      //expect(res.statusCode).toBe(401); // Unauthorized
    //});

    //it("should reject access to a protected route with an invalid token", async () => {
      //const res = await request(app)
        //.get("/hospital/user/profile")
        //.set("Authorization", "Bearer invalid.token.here");
      //expect(res.statusCode).toBe(400); // Forbidden
    //});
  //});
});
