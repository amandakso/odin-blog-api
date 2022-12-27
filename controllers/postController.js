const Post = require("../models/post");

const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

require("dotenv").config();

exports.get_posts = (req, res) => {
  return res.send("TBD get all posts");
};
exports.get_a_post = (req, res) => {
  return res.send("TBD get one post");
};
exports.create_post = [
  // Validate and sanitize fields
  body("title", "Title exceeds character limit.")
    .trim()
    .isLength({ max: 500 })
    .escape(),
  body("content", "Blog post exceeds character limit.")
    .trim()
    .isLength({ max: 5000 })
    .escape(),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Errors exist. send json with error messages
      res.json({
        title: req.body.title,
        content: req.body.content,
        errors: errors.array(),
      });
      return;
    }
    let bearerToken = "";

    // Extract bearer token
    const bearerHeader = req.headers.authorization;
    bearerToken = extractBearerToken(bearerHeader);

    // Verify Token
    jwt.verify(bearerToken, process.env.jwt_key, (err, authData) => {
      if (err) {
        res.json({ msg: "Error" });
      } else {
        // Create new post object
        const publish_status = req.body.published == "true" ? true : false;
        const post = new Post({
          author: authData.user._id,
          title: req.body.title,
          content: req.body.content,
          published: publish_status,
        }).save((err) => {
          if (err) {
            return next(err);
          }
          res.json({
            message: "New post created",
            authDate: authData,
          });
        });
      }
    });
  },
];
exports.update_post = (req, res) => {
  return res.send("TBD update post");
};
exports.delete_post = (req, res) => {
  return res.send("TBD delete post");
};

function extractBearerToken(bearerHeader) {
  if (typeof bearerHeader !== "undefined") {
    // Split at the space
    const bearer = bearerHeader.split(" ");
    bearerToken = bearer[1];
    return bearerToken;
  } else {
    return bearerHeader;
  }
}
