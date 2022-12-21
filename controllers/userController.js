const User = require("../models/user");

const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

exports.signup = [
  // validate and sanitize fields
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Username required")
    .isAlphanumeric()
    .escape()
    .withMessage("Only letters and numbers allowed")
    .custom(async (username) => {
      try {
        const takenUsername = await User.findOne({ username: username });
        if (takenUsername) {
          throw new Error("username is already taken");
        }
      } catch (err) {
        throw new Error(err);
      }
    }),
  body("password", "Password must be at least 8 characters long")
    .trim()
    .isLength({ min: 8 })
    .escape(),
  body("password_confirmation", "Must confirm password")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password.");
    }
    return true;
  }),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from request
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Errors exist. send json with error messages
      res.json({
        username: req.body.username,
        errors: errors.array(),
      });
      return;
    }

    // Create a new user
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) {
        return next(err);
      }
      let author = req.body.author ? true : false;
      const user = new User({
        username: req.body.username,
        password: hashedPassword,
        author: author,
      }).save((err) => {
        if (err) {
          return next(err);
        }
      });
    });
  },
];

exports.login = (req, res) => {
  return res.send("TBD login user");
};

exports.logout = (req, res) => {
  return res.send("TBD logout user");
};
