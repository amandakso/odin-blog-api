const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, maxLength: 100 },
  email: { type: String, required: true },
  password: { type: String, required: true },
  author: { type: Boolean, required: true },
});

// Export model
module.exports = mongoose.model("User", UserSchema);
