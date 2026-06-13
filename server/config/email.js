const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp, type) => {
  const subject = type === "signup"
    ? "Verify your ContentCraft account"
    : "Your ContentCraft login OTP";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #09090b; color: #fafafa; padding: 32px; border-radius: 16px;">
      <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
        Content<span style="color: #71717a;">Craft</span>
      </h1>
      <p style="color: #71717a; font-size: 14px; margin-bottom: 32px;">AI Content Generator</p>
      
      <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
        ${type === "signup" ? "Verify your email" : "Your login OTP"}
      </h2>
      <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 24px;">
        ${type === "signup"
          ? "Enter this OTP to verify your email and create your account."
          : "Enter this OTP to complete your login."}
      </p>

      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #fafafa; margin: 0;">
          ${otp}
        </p>
      </div>

      <p style="color: #71717a; font-size: 13px;">
        This OTP expires in <strong style="color: #a1a1aa;">10 minutes</strong>.
        If you didn't request this, ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"ContentCraft" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

module.exports = { sendOTPEmail };