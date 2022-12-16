const express = require("express");
const router = express.Router();

// Require controller modules.
const user_controller = require("../controllers/userController");
const post_controller = require("../controllers/postController");
const comment_controller = require("../controllers/commentController");

// Require controller modules

// User Routes //

// Create new user
router.post("/sign-up", user_controller.signup);

// Login user
router.post("/login", user_controller.login);

// Logout user
router.post("/logout", user_controller.logout);

// Post Routes //

// get posts
router.get("/posts", post_controller.get_posts);

// get specific post
router.get("/posts/:postid", post_controller.get_a_post);

// create new post
router.post("/posts", post_controller.create_post);

// update post
router.put("/posts/:postid", post_controller.update_post);

// delete post
router.delete("/posts/:postid", post_controller.delete_post);

//Comment Routes //

// get comments
router.get("/posts/:postid/comments", comment_controller.get_comments);

// get specific comment
router.get(
  "/posts/:postid/comments/:commentid",
  comment_controller.get_a_comment
);

// create new comment
router.post("/posts/:postid/comments", comment_controller.create_comment);

// update comment
router.put(
  "/posts/:postid/comments/:commentid",
  comment_controller.update_comment
);

// delete comment
router.delete(
  "/posts/:postid/comments/:commentid",
  comment_controller.delete_comment
);
