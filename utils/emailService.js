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
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Student Opportunities Portal',
    html: `
      <h1>Welcome to Student Opportunities Portal, ${name}!</h1>
      <p>Thank you for registering with us. You can now explore various bursaries, internships, graduate programs, and learnerships.</p>
      <p>Start browsing opportunities today and take the next step in your career!</p>
      <br>
      <p>Best regards,<br>Student Opportunities Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendApplicationConfirmation = async (email, opportunityTitle) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Application Submitted Successfully',
    html: `
      <h1>Your application has been submitted!</h1>
      <p>You have successfully applied for: <strong>${opportunityTitle}</strong></p>
      <p>We will review your application and get back to you soon.</p>
      <br>
      <p>Best regards,<br>Student Opportunities Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendStatusUpdate = async (email, opportunityTitle, status) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Application Status Update',
    html: `
      <h1>Application Status Update</h1>
      <p>Your application for <strong>${opportunityTitle}</strong> has been updated to: <strong>${status}</strong></p>
      <p>Log in to your account to view more details.</p>
      <br>
      <p>Best regards,<br>Student Opportunities Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendWelcomeEmail,
  sendApplicationConfirmation,
  sendStatusUpdate,
};