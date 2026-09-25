import nodemailer from "nodemailer";

const gmailUser = process.env.GMAIL_USER || process.env.gmail || "raj1official786@gmail.com";
const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.gmail_password || "cjhn wman sztv rlhg").replace(/\s+/g, "");

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string) {
  const mailOptions = {
    from: `"ToolVerse AI Security" <${gmailUser}>`,
    to: toEmail,
    subject: "Reset your ToolVerse AI Password",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0f17; color: #f1f5f9; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">ToolVerse AI</h1>
          <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px;">Next-Generation Creative & Engineering Suite</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
            We received a request to reset the password for your ToolVerse AI account. Click the button below to choose a new secure password:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
              Reset Password
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            This link is valid for <strong>1 hour</strong>. If you did not make this request, you can safely ignore this email; your account remains secure.
          </p>
          <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
          <p style="color: #475569; font-size: 12px; word-break: break-all;">
            If the button doesn't work, copy and paste this link into your browser:<br />
            <a href="${resetUrl}" style="color: #10b981;">${resetUrl}</a>
          </p>
        </div>
        <div style="background-color: #030712; padding: 16px 24px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="color: #475569; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} ToolVerse AI. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail] Password reset sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error("[Mail Error] Failed to send password reset email:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(toEmail: string, name: string, planTitle: string) {
  const mailOptions = {
    from: `"ToolVerse AI" <${gmailUser}>`,
    to: toEmail,
    subject: `Welcome to ToolVerse AI, ${name}! 🎉`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0f17; color: #f1f5f9; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800;">Welcome to ToolVerse AI!</h1>
          <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px;">Your 7-Day Free Trial is Now Active</p>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #f1f5f9; font-size: 16px; line-height: 1.6;">
            Hi <strong>${name}</strong>,
          </p>
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
            Welcome to ToolVerse AI! Your account has been unlocked with 7 days of complimentary access to our <strong>${planTitle}</strong> plan.
          </p>
          <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <h4 style="margin: 0 0 12px 0; color: #10b981; font-size: 15px;">What's included in your trial:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 14px; line-height: 1.8;">
              <li>Full access to 50+ AI, Image, Video, and Developer tools</li>
              <li>Lightning-fast cloud processing</li>
              <li>Unlimited creative generations</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
              Launch Studio Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("[Mail Error] Failed to send welcome email:", error);
  }
}

export async function sendContactInquiryEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const adminRecipient = "Solestyle41@gmail.com";
  const mailOptions = {
    from: `"ToolVerse AI Inquiries" <${gmailUser}>`,
    to: adminRecipient,
    replyTo: data.email,
    subject: `[ToolVerse Contact] ${data.subject} - from ${data.name}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0f17; color: #f1f5f9; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0;">New Contact Form Submission</h2>
        </div>
        <div style="padding: 24px;">
          <p><strong>Sender Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #10b981;">${data.email}</a></p>
          ${data.phone ? `<p><strong>Phone / WhatsApp:</strong> ${data.phone}</p>` : ""}
          <p><strong>Subject:</strong> ${data.subject}</p>
          <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 16px; margin-top: 16px;">
            <p style="margin: 0; color: #e2e8f0; white-space: pre-wrap;">${data.message}</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("[Mail Error] Failed to send contact inquiry email:", error);
    return { success: false, error };
  }
}
