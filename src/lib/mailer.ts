import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, html: string) {
  // ✅ Test account (useful for dev/testing)

  // ✅ Create transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // ✅ Send mail
  const info = await transporter.sendMail({
    from: '"Demo App" <no-reply@example.com>',
    to,
    subject,
    html,
  });

  console.log("Message sent:", info.messageId);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info)); // open in browser

  return info;
}
