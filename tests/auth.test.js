// auth.test.js - Signup, Login & Token Authentication Tests
const request = require("supertest");
const { faker } = require("@faker-js/faker");
const app = require("../index"); // Ensure correct path to your Express app
const { User, Doctor } = require("../models/User.model"); // Add this import
const mongoose = require("mongoose"); // Add this import

describe("Authentication Tests", () => {
  beforeAll(async () => {
    await User.deleteMany({});
    await Doctor.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await mongoose.connection.close();
  });

  const generateRandomUser = (role = "patient") => ({
    name: faker.person.fullName(),
    email: faker.internet.email(), // Don't hardcode email
    password: "ValidPassword1", // Make sure password meets requirements
    birthDate: faker.date.past({ years: 30 }).toISOString().split("T")[0],
    phoneNumber: "+1" + faker.string.numeric(10), // Format phone number correctly
    role,
    gender: faker.helpers.arrayElement(["M", "F"]), // Match schema enum values
    expertiseLevel: role === "doctor" ? [faker.lorem.word(), faker.lorem.word()] : undefined,
  });

  describe("Patient Signup Scenarios", () => {
    const testCases = [
      {
        description: "valid user",
        data: generateRandomUser(),
        expectedStatus: 201
      },
      {
        description: "invalid email",
        data: { ...generateRandomUser(), email: "invalid-email" },
        expectedStatus: 400
      },
      {
        description: "weak password",
        data: { ...generateRandomUser(), password: "short" },
        expectedStatus: 400
      },
      {
        description: "future birth date",
        data: { ...generateRandomUser(), birthDate: "3000-01-01" },
        expectedStatus: 400
      },
      {
        description: "invalid phone",
        data: { ...generateRandomUser(), phoneNumber: "invalid" },
        expectedStatus: 400
      }
    ];

    test.each(testCases)("$description", async ({ description, data, expectedStatus }) => {
      const res = await request(app)
        .post("/hospital/patient/signup")
        .send(data);
      
      if (res.statusCode !== expectedStatus) {
        console.log(`\nTest failed for: ${description}`);
        console.log('Request data:', data);
        console.log('Expected status:', expectedStatus);
        console.log('Received status:', res.statusCode);
        console.log('Error message:', res.body.error || res.body.message || 'No error message provided');
        console.log('Full response:', res.body);
      }
      
      expect(res.statusCode).toBe(expectedStatus);
      if (expectedStatus === 201) {
        expect(res.body).toHaveProperty("_id");
        expect(res.body.role).toBe("patient");
      }
    });
  });

  describe("Doctor Signup Scenarios", () => {
    it("should allow an admin to add a doctor", async () => {
      const doctor = generateRandomUser("doctor");
      const res = await request(app)
        .post("/hospital/doctor/addDoctor")
        .send(doctor);
      
      if (res.statusCode !== 201) {
        console.log('\nDoctor signup test failed:');
        console.log('Request data:', doctor);
        console.log('Error message:', res.body.error || res.body.message || 'No error message provided');
        console.log('Full response:', res.body);
      }
      
      expect(res.statusCode).toBe(201);
    });

    it("should reject doctor signup without expertiseLevel", async () => {
      const doctor = { ...generateRandomUser("doctor"), expertiseLevel: undefined };
      const res = await request(app)
        .post("/hospital/doctor/addDoctor")
        .send(doctor);
      
      if (res.statusCode !== 400) {
        console.log('\nDoctor signup validation test failed:');
        console.log('Request data:', doctor);
        console.log('Error message:', res.body.error || res.body.message || 'No error message provided');
        console.log('Full response:', res.body);
      }
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe("Login Scenarios", () => {
    let validUser;

    beforeAll(async () => {
      validUser = generateRandomUser();
      const signupRes = await request(app)
        .post("/hospital/patient/signup")
        .send(validUser);
      
      if (signupRes.statusCode !== 201) {
        console.log('Failed to create test user:');
        console.log('Status:', signupRes.statusCode);
        console.log('Error message:', signupRes.body.error || signupRes.body.message || 'No error message provided');
        console.log('Full response:', signupRes.body);
      }
    });

    it("should log in a user with correct credentials", async () => {
      const res = await request(app)
        .post("/hospital/user/login")
        .send({
          email: validUser.email,
          password: validUser.password,
        });
      
      if (res.statusCode !== 200) {
        console.log('\nLogin test failed:');
        console.log('Credentials:', { email: validUser.email, password: validUser.password });
        console.log('Error message:', res.body.error || res.body.message || 'No error message provided');
        console.log('Full response:', res.body);
      }
      
      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.body.message).toBe("Login successful");
    });

    it("should reject login with incorrect password", async () => {
      const res = await request(app)
        .post("/hospital/user/login")
        .send({
          email: validUser.email,
          password: "wrongpassword123",
        });
      
      if (res.statusCode !== 401) {
        console.log('\nIncorrect password test failed:');
        console.log('Error message:', res.body.error || res.body.message || 'No error message provided');
        console.log('Full response:', res.body);
      }
      
      expect(res.statusCode).toBe(401);
    });

    it("should reject login with non-existent email", async () => {
      const res = await request(app)
        .post("/hospital/user/login")
        .send({
          email: "nonexistent@example.com",
          password: validUser.password,
        });
      
      if (res.statusCode !== 401) {
        console.log('\nNon-existent email test failed:');
        console.log('Error message:', res.body.error || res.body.message || 'No error message provided');
        console.log('Full response:', res.body);
      }
      
      expect(res.statusCode).toBe(401);
    });

    it("should reject login with empty fields", async () => {
      const res = await request(app)
        .post("/hospital/user/login")
        .send({});
      
      if (res.statusCode !== 401) {
        console.log('\nEmpty fields test failed:');
        console.log('Error message:', res.body.error || res.body.message || 'No error message provided');
        console.log('Full response:', res.body);
      }
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe("Protected Routes", () => {
    let authCookie;

    beforeAll(async () => {
      const user = generateRandomUser();
      const signupRes = await request(app)
        .post("/hospital/patient/signup")
        .send(user);
      
      if (signupRes.statusCode !== 201) {
        console.log('\nFailed to create test user for protected routes:');
        console.log('Error message:', signupRes.body.error || signupRes.body.message || 'No error message provided');
        console.log('Full response:', signupRes.body);
      }
      
      const loginRes = await request(app)
        .post("/hospital/user/login")
        .send({
          email: user.email,
          password: user.password,
        });
      
      if (!loginRes.headers['set-cookie']) {
        console.log('\nFailed to get auth cookie:');
        console.log('Error message:', loginRes.body.error || loginRes.body.message || 'No error message provided');
        console.log('Full response:', loginRes.body);
      }
      
      authCookie = loginRes.headers['set-cookie'];
    });

    it("should allow access to profile with valid token", async () => {
      const res = await request(app)
        .get("/hospital/user/profile")
        .set("Cookie", authCookie);
      
      if (res.statusCode !== 200) {
        console.log('\nProfile access test failed:');
        console.log('Error message:', res.body.error || res.body.message || 'No error message provided');
        console.log('Full response:', res.body);
      }
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("name");
    });

    it("should reject access without token", async () => {
      const res = await request(app)
        .get("/hospital/user/profile");
      
      if (res.statusCode !== 401) {
        console.log('\nUnauthorized access test failed:');
        console.log('Error message:', res.body.error || res.body.message || 'No error message provided');
        console.log('Full response:', res.body);
      }
      
      expect(res.statusCode).toBe(401);
    });
  });
});
