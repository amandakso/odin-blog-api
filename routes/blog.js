const express = require("express");
const router = express.Router();
const cors = require("cors");

const passport = require("passport");

// Require controller modules.
const user_controller = require("../controllers/userController");
const post_controller = require("../controllers/postController");
const comment_controller = require("../controllers/commentController");

router.options("*", cors());
// Post Routes //
router.get("/", (req, res) => {
  res.send("TBD");
});

// get posts
router.get("/posts", cors(), post_controller.get_posts);

// get all posts by author
router.get("/posts/author", cors(), post_controller.get_posts_by_author);

// get specific post
router.get("/posts/:postid", cors(), post_controller.get_a_post);

// create new post
router.post(
  "/posts",
  passport.authenticate("jwt", { session: false }),
  post_controller.create_post
);

// update post
router.put("/posts/:postid", post_controller.update_post);

// delete post
router.delete("/posts/:postid", post_controller.delete_post);

//Comment Routes //

// get comments
router.get("/posts/:postid/comments", cors(), comment_controller.get_comments);

// get specific comment
router.get(
  "/posts/:postid/comments/:commentid",
  comment_controller.get_a_comment
);

// create new comment
router.post(
  "/posts/:postid/comments",
  cors(),
  passport.authenticate("jwt", { session: false }),
  comment_controller.create_comment
);

// update comment
router.put(
  "/posts/:postid/comments/:commentid",
  cors(),
  comment_controller.update_comment
);

// delete comment
router.delete(
  "/posts/:postid/comments/:commentid",
  cors(),
  comment_controller.delete_comment
);

// User Routes //

// Create new user
router.post("/sign-up", cors(), user_controller.signup);

// Login user
router.post("/login", cors(), user_controller.login);

// Logout user
router.put("/logout", cors(), user_controller.logout);

module.exports = router;
