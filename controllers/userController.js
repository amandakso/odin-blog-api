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
        res.json({
          message: "New user created",
          username: req.body.username,
        });
      });
    });
  },
];

exports.login = async (req, res, next) => {
  //Get user
  passport.authenticate("login", async (err, user) => {
    try {
      if (err || !user) {
        const error = new Error("An error occurred.");

        return next(error);
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { _id: user._id, username: user.username };
        const token = jwt.sign({ user: body }, process.env.jwt_key, {
          expiresIn: "1h",
        });

        return res.json({ token });
      });
    } catch (error) {
      return next(error);
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
