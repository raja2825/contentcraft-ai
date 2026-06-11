const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      process.env.CLIENT_URL,
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser()); // ← parse cookies

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/generate", require("./routes/generate"));
app.use("/api/history", require("./routes/history"));
app.use("/api/payment", require("./routes/payment"));

// Health check
app.get("/", (req, res) => res.json({ message: "ContentCraft API is running ✅" }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => res.status(500).json({ message: "Something went wrong" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));