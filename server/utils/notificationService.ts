import nodemailer from "nodemailer";
import { getTestMessageUrl, createTestAccount } from "nodemailer";
import { User } from "../models/User";

let cached: { transporter: nodemailer.Transporter | null; isEthereal: boolean } = {
  transporter: null,
  isEthereal: false,
};

async function getTransporter() {
  if (cached.transporter) return cached;
  const mode = process.env.NOTIF_MODE || "ethereal"; // ethereal | smtp | console

  if (mode === "smtp" && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: !!(process.env.SMTP_SECURE === "true"),
      auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    });
    cached = { transporter, isEthereal: false };
    return cached;
  }

  // Default: Ethereal (free test inbox)
  const testAccount = await createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  cached = { transporter, isEthereal: true };
  return cached;
}

export async function sendNotification(userId: string, message: string, subject = "Civic Report Update") {
  try {
    const user = await User.findById(userId).lean();
    if (!user?.email) {
      console.log(`[Notify:${userId}] ${message}`);
      return { success: false, reason: "no-email" };
    }
    const { transporter, isEthereal } = await getTransporter();

    const info = await transporter!.sendMail({
      from: process.env.NOTIF_FROM || 'Civic Backend <no-reply@example.com>',
      to: user.email,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    });

    const previewUrl = isEthereal ? getTestMessageUrl(info) : undefined;
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (e) {
    console.error("Notification error:", e);
    return { success: false };
  }
}
