import nodemailer from 'nodemailer';

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpUser || !smtpPass) {
  console.warn('SMTP_USER or SMTP_PASS not set. Email sending will fail.');
}

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendEmail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM || smtpUser;
  const mail = { from, to, subject, text, html };
  const info = await transporter.sendMail(mail);
  return info;
}

export async function sendOtpEmail(to, code, purpose = 'Verification') {
  const subject = `${purpose} Code: ${code}`;
  const text = `Your ${purpose.toLowerCase()} code is ${code}. It expires in 5 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>${purpose} Code</h2>
      <p>Your code is:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</div>
      <p>This code expires in <strong>5 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
  return sendEmail({ to, subject, text, html });
}
