const Comment = require("../models/comment");

exports.get_comments = (req, res) => {
  return res.render("TBD get all comments");
};
exports.get_a_comment = (req, res) => {
  return res.render("TBD get one comment");
};
exports.create_comment = (req, res) => {
  return res.send("TBD create new comment");
};
exports.update_comment = (req, res) => {
  return res.send("TBD update comment");
};
exports.delete_comment = (req, res) => {
  return res.send("TBD delete comment");
};
