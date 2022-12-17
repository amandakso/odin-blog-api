const User = require("../models/user");

const { body, validationResult } = require("express-validator");

exports.signup = [
  // validate and sanitize fields
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Username required")
    .isAlphanumeric()
    .escape()
    .withMessage("Only letters and numbers allowed"),
  body("email")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Email required")
    .isEmail()
    .escape()
    .withMessage("Invalid email address"),
  body("password", "Password must be at least 8 characters long")
    .trim()
    .isLength({ min: 8 })
    .escape(),
  body("password_confirmation", "Must confirm password")
    .trim()
    .isLength({ min: 1 })
    .escape()
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password.");
    }
    return true;
  }),

  // Process request after validation and sanitization
];

exports.login = (req, res) => {
  return res.send("TBD login user");
};

exports.logout = (req, res) => {
  return res.send("TBD logout user");
};
