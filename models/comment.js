const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxLength: 2500 },
  timestamp: { type: Date, default: Date.now },
  updated: { type: Date },
});

// Export model
module.exports = mongoose.model("Comment", CommentSchema);
