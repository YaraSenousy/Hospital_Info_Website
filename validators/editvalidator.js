const { body } = require("express-validator");
const User = require("../models/User.model");

const editValidationRules = (role) => {
  const rules = [
    //email
    body("email").isEmail().withMessage("Invalid email"),
    body("birthDate")
      .isDate()
      .withMessage("Invalid date format (YYYY-MM-DD)")
      .custom((value) => {
        const inputDate = moment(value, "YYYY-MM-DD");
        const today = moment().startOf("day");
        if (inputDate.isAfter(today)) {
          throw new Error("Date of birth must be in the past");
        }
        return true;
      }),
    body("phoneNumber").isMobilePhone().withMessage("Invalid phone number"),

    //gender
    body("gender").custom(() => {
      throw new Error("Gender cannot be changed");
    }),

    //role
    body("role").custom(() => {
      throw new Error("Role cannot be changed");
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
      .withMessage("Password must contain at least one number")
  ];

  //doctor specific rules
  if (role === "doctor") {
    rules.push(
      body("name").custom(() => {
        throw new Error("Doctors cannot change their name");
      }),
      body("image").custom(() => {
        throw new Error("Doctors cannot change their profile picture");
      })
    );
  }

  //patient specific rules
  if (role === "patient") {
    rules.push(
      body("name").optional().notEmpty().withMessage("Name cannot be empty"),
      body("image")
        .optional()
        .isString()
        .withMessage("Invalid profile picture URL")
    );
  }

  return rules;
};

module.exports = editValidationRules;
