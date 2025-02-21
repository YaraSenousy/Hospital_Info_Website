const { User, Doctor } = require("../models/User.model");
const bcrypt = require("bcryptjs");

const patientController = {
  removePatient: async (req, res) => {
    try {
      const patient = await User.findByIdAndDelete(req.user._id);
      patient
        ? res.json(patient)
        : res.status(404).json({ error: "Couldn't find the doctor" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getPatients: async (req, res) => {
    try {
      const allowedFilters = ["name", "PhoneNumber", "birthDate", "email"]; // List of allowed query parameters
      const filter = { role: "patient" };

      for (const key of allowedFilters) {
        if (req.query[key]) {
          filter[key] = req.query[key];
        }
      }

      //the fields to return
      const fieldsToReturn = "name birthDate PhoneNumber";

      //if it admin return the image

      if (req.user.role == "admin") {
        fieldsToReturn += " image email";
      }

      // Pagination
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);
      let patientsQuery = await User.find(filter).select(fieldsToReturn).lean();

      if (page && limit) {
        patientsQuery = patientsQuery.skip((page - 1) * limit).limit(limit);
      }

      let patients = await patientsQuery;

      // Compute age from birthDate
      patients = patients.map((patient) => {
        if (patient.birthDate) {
          const birthDate = new Date(patient.birthDate);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          return { ...patient, age };
        }
        return patient;
      });
      res.json(patients);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  signup: async (req, res) => {

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const patient = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      birthDate: req.body.birthDate,
      phoneNumber: req.body.phoneNumber,
      gender: req.body.gender,
      role: 'patient'
    });
    try {
      await patient.save();
      res.status(201).json(patient);
    } catch (err) {
      if (err.name === "ValidationError") {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  },
};

module.exports = patientController;
