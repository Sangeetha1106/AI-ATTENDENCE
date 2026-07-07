require('dotenv').config();
const nodemailer = require('nodemailer');

const sendTestMail = async () => {
  try {
    console.log("Using SMTP settings:");
    console.log("User:", process.env.EMAIL_USER);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"AI Attendance System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test Email Verification',
      text: 'If you receive this, EMAIL_USER and EMAIL_PASS are configured correctly.',
    });

    console.log('Test email sent successfully! Message ID:', info.messageId);
  } catch (err) {
    console.error('Failed to send test email:', err);
  }
};

sendTestMail();
