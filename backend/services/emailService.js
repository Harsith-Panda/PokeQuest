require("dotenv").config();
const nodemailer = require("nodemailer");

const sendVerifyEmail = async (email, username, verificationToken) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${email}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en" style="font-family: Arial, sans-serif; background-color:#f6f8fc; padding: 0; margin: 0;">
      <body style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e3e3e3;">

        <!-- Header -->
        <div style="text-align: center;">
          <img src="https://cdn.dribbble.com/userupload/32959400/file/original-dbe29920e290da99d214598ac9e2001f.png?resize=752x&vertical=center" alt="Pokéball" width="70" style="margin-bottom: 16px;" />
          <h1 style="color: #ffcb05; text-shadow: 2px 2px #3b4cca; margin-bottom: 0;">
            Welcome to PokeQuest!
          </h1>
          <p style="color: #555; font-size: 14px; margin-top: 4px;">
            Your adventure begins now.
          </p>
        </div>

        <!-- Body -->
        <p style="font-size: 16px; color: #333;">
          Hi <strong>${username}</strong>,
        </p>

        <p style="font-size: 15px; color: #444;">
          We noticed that you requested to resend your email verification link.
          Please verify your email address to unlock your account and start capturing creatures around your location!
        </p>

        <!-- Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationLink}"
            style="background-color: #3b4cca; color: #ffffff; padding: 14px 24px; font-size: 16px;
                   text-decoration: none; border-radius: 8px; display: inline-block;">
            Verify Email
          </a>
        </div>

        <!-- Expiry Info -->
        <p style="color: #666; font-size: 14px;">
          This verification link is valid for the next <strong>30 minutes</strong>.
          If it expires, you can request a new one anytime.
        </p>

        <!-- Footer -->
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

        <p style="font-size: 12px; color: #888; text-align: center;">
          If you did not request this email, you can safely ignore it.
          <br><br>
          © 2025 PokeQuest. All rights reserved.
        </p>

      </body>
    </html>
  `;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.APP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Verify Your Email - PokeQuest",
    html: html, // <-- HTML content
    text: "This is fallback text for non-HTML clients",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
  } catch (error) {
    console.log("Email sending error:", error);
    throw new Error("Email sending failed");
  }
};

const sendResetPasswordEmail = async (email, username, token) => {
  const reset_link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Reset Your Password</title>
      </head>
      <body
        style="
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          padding: 0;
          margin: 0;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="max-width: 600px; margin: auto; background: #ffffff"
        >
          <tr>
            <td style="padding: 20px; text-align: center; background: #4f46e5">
              <h1 style="color: #ffffff; margin: 0">Reset Your Password</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px; color: #333333">
              <p style="font-size: 16px; margin-bottom: 20px">
                Hi ${username},
              </p>

              <p style="font-size: 16px; margin-bottom: 20px">
                We received a request to reset your password. Click the button below to choose a new one.
              </p>

              <p style="text-align: center; margin: 30px 0">
                <a
                  href="${reset_link}"
                  style="
                    background-color: #4f46e5;
                    color: #ffffff;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    display: inline-block;
                    font-size: 16px;
                  "
                >
                  Reset Password
                </a>
              </p>

              <p style="font-size: 14px; color: #555; margin-top: 20px">
                This link will expire in <strong>15 minutes</strong>.
                If you didn’t request a password reset, you can safely ignore this email.
              </p>

              <p style="font-size: 14px; color: #555; margin-top: 30px">
                Thanks,<br />
                <strong>Your App Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td
              style="
                padding: 15px;
                text-align: center;
                background: #f0f0f0;
                font-size: 12px;
                color: #777;
              "
            >
              If the button doesn't work, copy and paste this URL into your browser:<br />
              <span style="color: #4f46e5">${reset_link}</span>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.APP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Request to reset your password - PokeQuest",
    html: html, // <-- HTML content
    text: "This is fallback text for non-HTML clients",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
  } catch (error) {
    console.log("Email sending error:", error);
    throw new Error("Email sending failed");
  }
};

module.exports = { sendVerifyEmail, sendResetPasswordEmail };
