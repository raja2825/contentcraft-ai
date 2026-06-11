const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Generation = require("../models/Generation");

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Build prompt based on output type and tone
const buildPrompt = (topic, tone, outputType) => {
  const toneInstructions = {
    professional: "Use a professional, formal, and authoritative tone.",
    casual: "Use a casual, friendly, and conversational tone.",
    funny: "Use a humorous, witty, and entertaining tone with light jokes.",
    "gen-z": "Use Gen-Z slang, be relatable, use casual internet language, emojis are welcome.",
  };

  const outputInstructions = {
    blog: `Write a complete blog post with:
- An engaging title
- Introduction (2-3 sentences)
- 3 main sections with subheadings
- Conclusion
- Minimum 400 words`,

    linkedin: `Write a LinkedIn post with:
- A strong opening hook (first line must grab attention)
- 3-5 short paragraphs
- Key insights or takeaways
- End with a question to drive engagement
- Add relevant hashtags at the end
- Maximum 300 words`,

    email: `Write a cold outreach email with:
- Subject line (start with "Subject:")
- Personalized greeting
- Pain point identification (1-2 sentences)
- Value proposition (2-3 sentences)
- Clear call to action
- Professional sign-off
- Maximum 200 words`,
  };

  return `
You are an expert content writer.
${toneInstructions[tone]}
${outputInstructions[outputType]}

Topic/Notes: ${topic}

Write the content now:
`;
};

// @route   POST /api/generate
// @desc    Generate AI content
// @access  Private
router.post("/", protect, async (req, res) => {
  const { topic, tone, outputType } = req.body;

  try {
    // Validation
    if (!topic || !tone || !outputType) {
      return res.status(400).json({ message: "Topic, tone and output type are required" });
    }

    if (topic.trim().length < 5) {
      return res.status(400).json({ message: "Topic must be at least 5 characters" });
    }

    // Get fresh user data
    const user = await User.findById(req.user._id);

    // Check usage limit
    if (user.generationsUsed >= user.generationsLimit) {
      return res.status(403).json({
        message: "Free limit reached",
        limitReached: true,
        generationsUsed: user.generationsUsed,
        generationsLimit: user.generationsLimit,
        plan: user.plan,
      });
    }

    // Build prompt
    const prompt = buildPrompt(topic, tone, outputType);

    // Call Gemini API
   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const generatedContent = result.response.text();

    // Save generation to DB
    const generation = await Generation.create({
      userId: user._id,
      topic,
      tone,
      outputType,
      generatedContent,
    });

    // Increment usage count
    await User.findByIdAndUpdate(user._id, {
      $inc: { generationsUsed: 1 },
    });

    // Return response
    res.status(200).json({
      message: "Content generated successfully",
      generation: {
        id: generation._id,
        topic: generation.topic,
        tone: generation.tone,
        outputType: generation.outputType,
        generatedContent: generation.generatedContent,
        createdAt: generation.createdAt,
      },
      usage: {
        generationsUsed: user.generationsUsed + 1,
        generationsLimit: user.generationsLimit,
        remaining: user.generationsLimit - user.generationsUsed - 1,
      },
    });
  } catch (error) {
  console.error("=== GENERATION ERROR ===");
    console.error("Message:", error.message);
    console.error("Status:", error.status);
    console.error("Details:", error.errorDetails);
    console.error("========================");

    if (error.message?.includes("API_KEY")) {
      return res.status(500).json({ message: "Invalid Gemini API key" });
    }
    if (error.message?.includes("quota")) {
      return res.status(429).json({ message: "Gemini API quota exceeded" });
    }

    res.status(500).json({ message: error.message || "Content generation failed" });
  }
});

module.exports = router;