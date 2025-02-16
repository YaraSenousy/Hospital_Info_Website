const { User, Doctor } = require("../models/User.model");

const doctorController = {
  removeDoctor: async (req, res) => {
    try {
      const doctor = await Doctor.findByIdAndDelete(req.user._id);
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
        "PhoneNumber",
        "expertiseLevel",
        "birthDate",
        "email",
      ]; // List of allowed query parameters
      const filter = {};

      for (const key of allowedFilters) {
        if (req.query[key]) {
          filter[key] = req.query[key];
        }
      }

      //the fields to return
      const fieldsToReturn = "name PhoneNumber";

      //if it admin return the image
      if (req.user.role == "admin") {
        fieldsToReturn += " image email";
      }

      // Pagination
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);
      let doctorsQuery = Doctor.find(filter).select(fieldsToReturn);

      if (page && limit) {
        doctorsQuery = doctorsQuery.skip((page - 1) * limit).limit(limit);
      }

      const doctors = await doctorsQuery;

      res.json(doctors);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = doctorController;
