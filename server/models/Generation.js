const mongoose = require("mongoose");
const generationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    tone: { type: String, enum: ["professional", "casual", "funny", "gen-z"], default: "professional" },
    outputType: { type: String, enum: ["blog", "linkedin", "email"], required: true },
    generatedContent: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Generation", generationSchema);
