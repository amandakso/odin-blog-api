const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const opts = { toJSON: { virtuals: true } };
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, maxLength: 500 },
    content: { type: String, required: true, maxLength: 5000 },
    timestamp: { type: Date, default: Date.now },
    published: { type: Boolean, required: true, default: false },
    publish_date: { type: Date, default: Date.now },
    updated: { type: Date },
  },
  opts
);

// Format post dates
PostSchema.virtual("publish_date_formatted").get(function () {
  return this.publish_date
    ? DateTime.fromJSDate(this.publish_date).toLocaleString(DateTime.DATE_MED)
    : "";
});

PostSchema.virtual("updated_formatted").get(function () {
  return this.updated
    ? DateTime.fromJSDate(this.updated).toLocaleString(DateTime.DATE_MED)
    : "";
});

// Export model
module.exports = mongoose.model("Post", PostSchema);
