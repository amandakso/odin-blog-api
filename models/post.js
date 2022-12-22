const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, maxLength: 500 },
  content: { type: String, required: true, maxLength: 5000 },
  timestamp: { type: Date, default: Date.now },
  published: { type: Boolean, required: true, default: false },
  publish_date: { type: Date, default: Date.now },
});

// Export model
module.exports = mongoose.model("Post", PostSchema);
