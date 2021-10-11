const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, default: null },
  password: { type: String },
  name: { type: String, default: null },
  email: { type: String, unique: true },
  phone: { type: String, default: null },
  newsletter: { type: Boolean, default: true },
  type: { type: String, default: "user" },
  token: { type: String },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
});

module.exports = mongoose.model("user", userSchema,'Users');