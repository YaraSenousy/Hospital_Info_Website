const { body } = require("express-validator");
const { User } = require("../models/User.model");
const moment = require("moment");

const updateValidationRules = [
  // Validate email
  body("email")
    .optional()
    .trim()
    .normalizeEmail()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email address")
    .custom(async (email, { req }) => {
      const user = await User.findOne({ 
        email,
        _id: { $ne: req.user.userId } // Exclude current user from check
      });
      
      if (user) {
        throw new Error("Email already in use by another account");
      }
    }),

  // Validate password
  body("password")
    .optional()
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),

  // Validate birthdate
  body("birthDate")
    .optional()
    //.isDate().withMessage("Invalid date format (YYYY-MM-DD)")
    .custom((value) => {
      const inputDate = moment(value, "YYYY-MM-DD");
      const today = moment().startOf("day");
      if (inputDate.isAfter(today)) {
        throw new Error("Date of birth must be in the past");
      }
      return true;
    }),

  // Validate phone number
  body("phoneNumber")
    .optional()
    .notEmpty().withMessage("Phone number is required")
    .isMobilePhone("ar-EG").withMessage("Invalid phone number"),

  // Validate gender
  body("gender")
    .optional()
    .notEmpty().withMessage("Gender field is required")
    .isIn(["male", "female"]).withMessage("Gender must be either 'male' or 'female'")
];

module.exports = updateValidationRules;