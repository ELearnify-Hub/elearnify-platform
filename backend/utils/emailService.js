// utils/emailService.js
// All emails sent from the app go through this single file
// This is called the "Single Responsibility" principle

const nodemailer = require('nodemailer');

// ── Create Transporter ────────────────────────────────────────────────────────
// A transporter = a configured email client
// We create it fresh for each email to avoid connection issues

const createTransporter = () => {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,   // smtp.gmail.com
    port:   Number(process.env.EMAIL_PORT), // 587
    secure: false,  // false for port 587 (uses STARTTLS)
    auth: {
      user: process.env.EMAIL_USER,   // your gmail
      pass: process.env.EMAIL_PASS    // your app password
    }
  });
};

// ── Password Reset Email ──────────────────────────────────────────────────────
const sendPasswordResetEmail = async ({ toEmail, userName, resetURL }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      toEmail,
    subject: '🔐 Reset Your ELearnify Password',
    html: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">

      <div style="max-width:560px;margin:40px auto;background:#ffffff;
        border-radius:16px;overflow:hidden;
        box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#2563eb,#4f46e5);
          padding:32px 40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">
            🎓 ELearnify
          </h1>
          <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">
            E-Learning Platform
          </p>
        </div>

        <!-- Body -->
        <div style="padding:40px;">
          <h2 style="color:#1e293b;font-size:20px;margin:0 0 12px;">
            Password Reset Request
          </h2>
          <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Hi <strong>${userName}</strong>,<br><br>
            We received a request to reset your ELearnify password.
            Click the button below to create a new password.
          </p>

          <!-- Button -->
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetURL}"
              style="background:#2563eb;color:#fff;text-decoration:none;
                padding:14px 36px;border-radius:10px;font-size:15px;
                font-weight:600;display:inline-block;
                box-shadow:0 4px 12px rgba(37,99,235,0.4);">
              Reset My Password
            </a>
          </div>

          <!-- Warning box -->
          <div style="background:#fef9c3;border:1px solid #fde047;
            border-radius:10px;padding:16px;margin:24px 0;">
            <p style="color:#854d0e;margin:0;font-size:13px;line-height:1.6;">
              ⏰ <strong>This link expires in 10 minutes.</strong><br>
              If you did not request this, you can safely ignore this email.
              Your password will not change.
            </p>
          </div>

          <!-- Fallback link -->
          <p style="color:#94a3b8;font-size:12px;margin:0;word-break:break-all;">
            If the button doesn't work, copy and paste:<br>
            <a href="${resetURL}" style="color:#2563eb;">${resetURL}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;padding:20px 40px;
          border-top:1px solid #e2e8f0;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} ELearnify. All rights reserved.<br>
            This is an automated email — please do not reply.
          </p>
        </div>
      </div>

    </body>
    </html>
    `
  });

  console.log(`✅ Reset email sent to: ${toEmail}`);
};

// ── Welcome Email ─────────────────────────────────────────────────────────────
const sendWelcomeEmail = async ({ toEmail, userName }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      toEmail,
    subject: '🎉 Welcome to ELearnify!',
    html: `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f8fafc;
      font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#fff;
        border-radius:16px;overflow:hidden;
        box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <div style="background:linear-gradient(135deg,#2563eb,#4f46e5);
          padding:32px 40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">
            🎓 Welcome to ELearnify!
          </h1>
        </div>

        <div style="padding:40px;">
          <h2 style="color:#1e293b;font-size:20px;margin:0 0 16px;">
            Hi ${userName}! 👋
          </h2>
          <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Your account has been created successfully.
            You're all set to start your learning journey!
          </p>

          <div style="text-align:center;margin:32px 0;">
            <a href="${process.env.FRONTEND_URL}/courses"
              style="background:#2563eb;color:#fff;text-decoration:none;
                padding:14px 36px;border-radius:10px;font-size:15px;
                font-weight:600;display:inline-block;">
              Browse Courses 🚀
            </a>
          </div>
        </div>

        <div style="background:#f8fafc;padding:20px 40px;
          border-top:1px solid #e2e8f0;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} ELearnify. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    `
  });

  console.log(`✅ Welcome email sent to: ${toEmail}`);
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail
};