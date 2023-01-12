const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");
const opts = { toJSON: { virtuals: true } };

const CommentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxLength: 2500 },
    timestamp: { type: Date, default: Date.now },
    updated: { type: Date },
  },
  opts
);

// Format comment dates
CommentSchema.virtual("timestamp_formatted").get(function () {
  return this.timestamp
    ? DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATE_MED)
    : "";
});

CommentSchema.virtual("updated_formatted").get(function () {
  return this.updated
    ? DateTime.fromJSDate(this.updated).toLocaleString(DateTime.DATE_MED)
    : "";
});

// Export model
module.exports = mongoose.model("Comment", CommentSchema);
