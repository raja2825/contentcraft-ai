const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLANS = {
  pro: { amount: 100, generationsLimit: 100, label: "Pro" },
  business: { amount: 200, generationsLimit: 500, label: "Business" },
};

// POST /api/payment/create-order
router.post("/create-order", protect, async (req, res) => {
  const { plan } = req.body;
  if (!plan || !PLANS[plan])
    return res.status(400).json({ message: "Invalid plan selected" });

  try {
    const order = await razorpay.orders.create({
      amount: PLANS[plan].amount,
      currency: "INR",
      receipt: `receipt_${req.user._id}_${Date.now()}`,
      notes: { userId: req.user._id.toString(), plan },
    });

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
      label: PLANS[plan].label,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
});

// POST /api/payment/verify
router.post("/verify", protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan)
    return res.status(400).json({ message: "Missing payment details" });

  if (!PLANS[plan])
    return res.status(400).json({ message: "Invalid plan" });

  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ message: "Payment verification failed. Invalid signature." });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { plan, generationsLimit: PLANS[plan].generationsLimit, generationsUsed: 0 },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: `Successfully upgraded to ${PLANS[plan].label} plan!`,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        plan: updatedUser.plan,
        generationsUsed: updatedUser.generationsUsed,
        generationsLimit: updatedUser.generationsLimit,
      },
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

module.exports = router;