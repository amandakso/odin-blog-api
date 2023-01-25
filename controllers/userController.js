const User = require("../models/user");

const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

require("dotenv").config();

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
        return res.json({ error: err });
      }
      let author = req.body.author ? true : false;
      const user = new User({
        username: req.body.username,
        password: hashedPassword,
        author: author,
      }).save((err) => {
        if (err) {
          return res.json({ error: err });
        }
        res.json({
          message: `New user ${req.body.username} created`,
        });
      });
    });
  },
];

exports.login = async (req, res, next) => {
  passport.authenticate("login", async (err, user, message) => {
    console.log(message);
    try {
      if (message) {
        return res.json(message);
      }
      if (err || !user) {
        const error = new Error("An error occurred.");

        return res.json({ error: error.message });
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return res.json({ error: error.message });

        const body = { _id: user._id, username: user.username };
        const token = jwt.sign({ user: body }, process.env.jwt_key, {
          expiresIn: "1h",
        });

        return res.json({ token, username: user.username });
      });
    } catch (error) {
      return res.jsson({ error: error.message });
    }
  })(req, res, next);
};

exports.logout = (req, res) => {
  const authHeader = req.headers["authorization"];
  jwt.sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
    if (logout) {
      res.json({ msg: "You have been logged out" });
    } else {
      res.json({ msg: "Error" });
    }
  });
};
