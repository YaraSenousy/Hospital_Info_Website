const { User } = require("../models/User.model");
const bcrypt = require("bcryptjs");

const doctorController = {
  removeDoctor: async (req, res) => {
    try {
      const doctor = await User.findByIdAndDelete(req.body.id);
      doctor
        ? res.json(doctor)
        : res.status(404).json({ error: "Couldn't find the doctor" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getDoctors: async (req, res) => {
    try {
      const allowedFilters = [
        "name",
        "phoneNumber",
        "expertiseLevel",
        "birthDate",
        "email",
        "image"
      ]; // List of allowed query parameters
      let filter = {role: "doctor"};

      for (const key of allowedFilters) {
        if (req.query[key]) {
          filter[key] = req.query[key];
        }
      }

      //the fields to return - include email and image for all users
      let fieldsToReturn = "name phoneNumber expertiseLevel email image";

      // Pagination
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);
      let doctorsQuery = User.find(filter).select(fieldsToReturn);

      if (page && limit) {
        doctorsQuery = doctorsQuery.skip((page - 1) * limit).limit(limit);
      }

      const doctors = await doctorsQuery;

      res.json(doctors);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  addDoctor: async (req, res) => {

     // Hash the password
     const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const doctor = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      birthDate: req.body.birthDate,
      phoneNumber: req.body.phoneNumber,
      gender: req.body.gender,
      role: "doctor",
    });

    if (req.body.expertiseLevel) {
      doctor.expertiseLevel = req.body.expertiseLevel;
    } else {
      return res.status(400).json({
        success: false,
        message: "you need to enter the expertise Level",
      });
    }

    try {
      await doctor.save();
      res.status(201).json(doctor);
    } catch (err) {
      if (err.name === "ValidationError") {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  },
};

module.exports = doctorController;
