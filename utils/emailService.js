const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Student Opportunities Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Welcome to Student Opportunities Portal!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with our platform. We're excited to help you find the best opportunities for your academic journey.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse available bursaries and opportunities</li>
            <li>Apply for opportunities that match your profile</li>
            <li>Track your application status</li>
            <li>Upload your documents for easy applications</li>
          </ul>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <br>
          <p>Best regards,<br>Student Opportunities Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

const sendApplicationConfirmation = async (email, name, opportunityTitle) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Application Submitted Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Application Submitted!</h2>
          <p>Hello ${name},</p>
          <p>Your application for <strong>${opportunityTitle}</strong> has been submitted successfully.</p>
          <p>We'll review your application and notify you of any updates. You can check the status of your application in your dashboard.</p>
          <br>
          <p>Best regards,<br>Student Opportunities Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Application confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending application confirmation email:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendApplicationConfirmation,
  transporter
};