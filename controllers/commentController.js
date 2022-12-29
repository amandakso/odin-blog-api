const Comment = require("../models/comment");
const Post = require("../models/post");

const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

require("dotenv").config();

exports.get_comments = (req, res, next) => {
  Comment.find({ post: req.params.postid }, "user content timestamp")
    .sort({ timestamp: -1 })
    .populate("user", "username")
    .exec(function (err, list_comments) {
      if (err) {
        return next(err);
      }
      res.json(list_comments);
    });
};
exports.get_a_comment = (req, res, next) => {
  Comment.findById(req.params.commentid)
    .select("user content timestamp")
    .populate("user", "username")
    .exec(function (err, list_comment) {
      if (err) {
        return next(err);
      }
      if (!list_comment) {
        res.json({ msg: "Comment not found" });
      } else {
        res.json(list_comment);
      }
    });
};
exports.create_comment = [
  // Validate and sanitize comment field
  body("comment", "Comment not within character limit.")
    .trim()
    .isLength({ min: 1, max: 2500 })
    .escape(),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Errors exist. send json with error messages
      res.json({
        comment: req.body.comment,
        errors: errors.array(),
      });
      return;
    }
    // Check that post exists
    const checkPost = async function (postid) {
      try {
        let status = true;
        if (!mongoose.isValidObjectId(postid)) {
          status = false;
        } else {
          const existingPost = await Post.findById(
            mongoose.Types.ObjectId(postid)
          );
          if (!existingPost) {
            status = false;
          }
        }
        return status;
      } catch (err) {
        return next(err);
      }
    };
    let checkPostStatus = checkPost(req.params.postid);
    checkPostStatus.then(function (result) {
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
          } else {
            // Check that post exists
            // Create new comment object
            const comment = new Comment({
              post: req.params.postid,
              user: authData.user._id,
              content: req.body.comment,
            }).save((err) => {
              if (err) {
                return next(err);
              }
              res.json({
                message: "New comment created",
                user: authData.user._id,
              });
            });
          }
          return;
        });
      }
    });
  },
];
exports.update_comment = (req, res) => {
  return res.send("TBD update comment");
};
exports.delete_comment = (req, res, next) => {
  Comment.findById(req.params.commentid)
    .populate("post", "author")
    .select("user")
    .exec((err, result) => {
      if (err) {
        return next(err);
      }
      if (!result) {
        res.json({
          msg: "Comment not found",
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
          } else if (
            authData.user._id !== result.user.toString() &&
            authData.user._id !== result.post.author.toString()
            // checks if post author or comment author are trying to delete comment
          ) {
            res.json({ msg: "Not authorized to delete comment" });
          } else {
            Comment.findByIdAndRemove(req.params.commentid, (err) => {
              if (err) {
                return next(err);
              }
              res.json({
                msg: "Comment deleted",
              });
            });
          }
        });
      }
    });
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
