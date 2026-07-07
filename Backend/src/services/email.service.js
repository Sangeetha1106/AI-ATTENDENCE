const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create a transporter
// We use dummy Ethereal email or standard SMTP configuration based on environment variables
const createTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Generate a test account if no SMTP provided
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test Email Account created:', testAccount.user);
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }
};

const sendWelcomeEmail = async (email, name, password) => {
  try {
    const transporter = await createTransporter();
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173/employee/login';

    const mailOptions = {
      from: `"AI Attendance System" <${process.env.EMAIL_USER || 'no-reply@aiattendance.com'}>`,
      to: email,
      subject: 'Welcome to AI Attendance System',
      text: `Hello ${name},

Your employee account has been created successfully.

Login Details:

Employee Name: ${name}
Employee Email: ${email}
Default Password: ${password}

Employee Login URL:
${loginUrl}

Thank you,
AI Attendance System`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    
    // For test ethereal email, log the URL to view the email
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
};
