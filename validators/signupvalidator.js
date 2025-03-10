const { body } = require("express-validator");
const { User } = require("../models/User.model");
const moment = require("moment");

const signupValidationRules = [
  //name
  body("name").notEmpty().withMessage("Name is required"),

  // Validate email
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error("Email already in use");
      }
    }),

  //password
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),

  //birthdate
  body("birthDate")
    .isDate()
    .withMessage("Invalid date format (YYYY-MM-DD)")
    .custom((value) => {
      const inputDate = moment(value, "YYYY-MM-DD");
      const today = moment().startOf("day");
      // Check if the date is in the past
      if (inputDate.isAfter(today)) {
        throw new Error("Date of birth must be in the past");
      }
      return true;
    }),

  //phonenumber
  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("ar-EG")
    .withMessage("Invalid phone number"),

  // gender validation
  body("gender")
    .notEmpty()
    .withMessage("Gender field is required")
    .isIn(["male", "female"])
    .withMessage("Gender must be either 'male' or 'female'")
];

module.exports = signupValidationRules;
