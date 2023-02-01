const Post = require("../models/post");
const Comment = require("../models/comment");
const opts = { toJSON: { virtuals: true } };

const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const async = require("async");

require("dotenv").config();

exports.get_posts = (req, res, next) => {
  Post.find({ published: true }, "author title content publish_date updated")
    .sort({ publish_date: -1 })
    .populate("author", "username")
    .exec(function (err, list_posts) {
      if (err) {
        return next(err);
      }
      res.json(list_posts);
    });
};
exports.get_a_post = (req, res, next) => {
  Post.findById(req.params.postid)
    .select("author title content publish_date")
    .populate("author", "username")
    .exec(function (err, list_post) {
      if (err) {
        return next(err);
      }
      if (!list_post) {
        res.json({ msg: "Post not found" });
      } else {
        res.json(list_post);
      }
    });
};

exports.get_posts_by_author = (req, res, next) => {
  let bearerToken = "";

  // Extract bearer token
  const bearerHeader = req.headers.authorization;
  bearerToken = extractBearerToken(bearerHeader);

  // Verify Token
  jwt.verify(bearerToken, process.env.jwt_key, (err, authData) => {
    if (err) {
      res.json({ error: "Error" });
    } else {
      Post.find(
        { author: authData.user._id },
        "author title content publish_date published updated"
      )
        .sort({ publish_date: -1 })
        .populate("author", "username")
        .exec(function (err, list_posts) {
          if (err) {
            return res.json({ error: err });
          }
          res.json({ data: list_posts });
        });
    }
  });
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
        res.json({ error: "Error" });
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
            return res.json({ error: err.message });
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
exports.update_post = [
  // Validate and sanitize fields.
  body("title", "Title exceeds character limit.")
    .trim()
    .isLength({ max: 500 })
    .escape(),
  body("content", "Blog post exceeds character limit.")
    .trim()
    .isLength({ max: 5000 })
    .escape(),
  body("published").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
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
    // Check that post exists
    Post.findById(req.params.postid)
      .select("author")
      .exec((err, result) => {
        if (err) {
          return next(err);
        }
        if (!result) {
          res.json({
            msg: "Post not found",
          });
        } else {
          let bearerToken = "";

          // Extract bearer token
          const bearerHeader = req.headers.authorization;
          bearerToken = extractBearerToken(bearerHeader);
          // Verify Token
          jwt.verify(bearerToken, process.env.jwt_key, (err, authData) => {
            if (err) {
              res.json({ msg: "Error" });
            } else if (authData.user._id !== result.author.toString()) {
              res.json({ msg: "Not authorized to update post" });
            } else {
              Post.findByIdAndUpdate(
                req.params.postid,
                {
                  title: req.body.title,
                  content: req.body.content,
                  published: req.body.published,
                  updated: Date.now(),
                },
                (err) => {
                  if (err) {
                    return next(err);
                  }
                  res.json({
                    msg: "Post updated",
                  });
                }
              );
            }
          });
        }
      });
  },
];
exports.delete_post = (req, res, next) => {
  async.parallel(
    {
      post(callback) {
        Post.findById(req.params.postid).exec(callback);
      },
      comments_instances(callback) {
        Comment.find({ post: req.params.postid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // check if author of post is trying to delete
      let bearerToken = "";

      // Extract bearer token
      const bearerHeader = req.headers.authorization;
      bearerToken = extractBearerToken(bearerHeader);
      // Verify Token
      jwt.verify(bearerToken, process.env.jwt_key, (err, authData) => {
        if (err) {
          res.json({ msg: "Error" });
        } else if (authData.user._id !== results.post.author.toString()) {
          res.json({ msg: "Not authorized to delete post" });
        } else {
          if (results.comments_instances.length > 0) {
            // Post has comments. Delete each comment
            Comment.deleteMany(
              { post: req.params.postid },
              function (err, result) {
                if (err) {
                  return res.json({ msg: err.message });
                } else {
                  console.log("Comments deleted");
                }
              }
            );
          }
          // check user is post author tbd
          Post.findByIdAndRemove(req.params.postid, (err) => {
            if (err) {
              return res.json({ msg: err.message });
            }
            res.json({
              msg: "Post deleted",
            });
          });
        }
      });
    }
  );
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
