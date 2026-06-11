const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    plan: { type: String, enum: ["free", "pro", "business"], default: "free" },
    generationsUsed: { type: Number, default: 0 },
    generationsLimit: { type: Number, default: 5 },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);
