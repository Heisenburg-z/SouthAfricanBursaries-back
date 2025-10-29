const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

///////////////////////////////
// ---- Helper: Single send
///////////////////////////////
const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'Student Opportunities'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
    if (error) {
      console.error('❌ Resend Error:', error);
      throw error;
    }
    console.log(`✅ Email sent to ${to}: ${subject}`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

///////////////////////////////
// ---- Welcome Email (long, professional)
///////////////////////////////
const sendWelcomeEmail = async user => {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; background:#f3f4f6; color: #1f2937; margin:0; padding:0; }
        .container { max-width:600px; margin:0 auto; background:#fff; border-radius:16px; box-shadow:0 4px 6px rgba(0,0,0,0.08); overflow:hidden; }
        .header { background:linear-gradient(135deg, #10b981 0, #059669 100%); color:#fff; text-align:center; padding:40px 30px; }
        .header h1 { font-size:28px; margin-bottom:10px; }
        .content { padding:40px 30px; background:#fff; }
        .content h2 { color:#10b981; font-size:24px; margin-bottom:20px; }
        .content p { margin-bottom:15px; color:#4b5563; }
        .features { background:#f0fdf4; border-left:4px solid #10b981; padding:20px; margin:25px 0; border-radius:8px; }
        .features ul { list-style:none; padding:0; }
        .features li { padding:8px 0 8px 25px; position:relative; }
        .features li::before { content: "✓"; position:absolute; left:0; color:#10b981; font-weight:bold; }
        .button { display:inline-block; background:#10b981; color:#fff !important; padding:14px 32px; text-decoration:none; border-radius:8px; margin:25px 0; font-weight:600; text-align:center; }
        .button:hover { background:#059669; }
        .tips { background:#eff6ff; border-radius:8px; padding:20px; margin:25px 0; }
        .tips h3 { color:#1e40af; margin-bottom:15px; font-size:18px; }
        .tips ol { padding-left:20px; color:#4b5563; }
        .tips li { margin-bottom:8px; }
        .footer { text-align:center; padding:30px; background:#f9fafb; color:#6b7280; font-size:13px; border-top:1px solid #e5e7eb; }
        .footer a { color:#10b981; text-decoration:none; }
      </style>
    </head>
    <body style="padding:20px;">
      <div class="container">
        <div class="header">
          <h1>Welcome Aboard!</h1>
          <p style="font-size:16px; margin:0;">You're now part of South Africa's #1 Student Platform</p>
        </div>
        <div class="content">
          <h2>Hi ${user.firstName || ''}!</h2>
          <p>We're absolutely thrilled to have you join our growing community of ambitious South African students!</p>
          <div class="features">
            <strong style="color:#10b981; font-size:16px;">Here's what you can do now:</strong>
            <ul style="margin-top:15px;">
              <li>Browse 55+ verified opportunities from top SA companies</li>
              <li>Apply for bursaries, internships, and graduate programs</li>
              <li>Track all your applications in one place</li>
              <li>Upload documents once, reuse for multiple applications</li>
              <li>Get deadline reminders so you never miss out</li>
            </ul>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Go to Your Dashboard</a>
          </div>
          <div class="tips">
            <h3>💡 Quick Tips to Get Started</h3>
            <ol>
              <li><strong>Complete Your Profile</strong> - Get better opportunity matches</li>
              <li><strong>Upload Your Documents</strong> - Save time on future applications</li>
              <li><strong>Set Application Goals</strong> - Apply to at least 3-5 opportunities</li>
              <li><strong>Check Daily</strong> - New opportunities are added regularly</li>
            </ol>
          </div>
          <p><strong>Need help?</strong> We're here for you! Simply reply to this email or check out our <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/help">Help Center</a>.</p>
          <p style="margin-top:30px;">Wishing you all the best on your journey to success!<br><em style="color:#6b7280">The Student Opportunities Team</em></p>
        </div>
        <div class="footer">
          <p><strong>Student Opportunities Portal</strong></p>
          <p style="margin-top:5px;">South Africa's Premier Student Career Platform</p>
          <p style="margin-top:15px;">You're receiving this because you registered at <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Student Opportunities Portal</a></p>
          <p style="margin-top:10px;"><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe?email=${user.email}">Unsubscribe</a> | <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/privacy">Privacy Policy</a></p>
        </div>
      </div>
    </body>
  </html>
  `;
  return sendEmail({
    to: user.email,
    subject: "Welcome to Student Opportunities Portal - Let's Get Started!",
    html
  });
};

///////////////////////////////
// ---- Application Confirmation Email (can keep default)
///////////////////////////////
const sendApplicationConfirmation = async (user, opportunity) => {
  const html = `
    <html>
    <body style="font-family:Arial,sans-serif;padding:32px;">
      <div style="max-width:600px;margin:auto;background:#fff;padding:32px;border-radius:12px;">
        <h1 style="color:#10b981;">✅ Application Submitted!</h1>
        <p>Hi ${user.firstName},<br>
        We've received your application for <b>${opportunity.title}</b> at <b>${opportunity.provider}</b>.</p>
        <p>
          Check the status anytime in your dashboard.<br>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background:#10b981;color:#fff;padding:11px 26px;border-radius:7px;text-decoration:none;font-weight:bold;">View My Applications</a>
        </p>
      </div>
    </body>
    </html>
  `;
  return sendEmail({
    to: user.email,
    subject: `✅ Application Submitted: ${opportunity.title}`,
    html
  });
};

///////////////////////////////
// ---- Professional Newsletter Send (long, rate-limited 2/sec)
///////////////////////////////
const sendNewsletter = async (subscribers, subject, content) => {
  let successful = 0;
  let failed = 0;
  const batchSize = 2; // 2 per second for Resend
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async sub => {
        const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; background:#f3f4f6; color: #1f2937; margin:0; padding:0; }
              .container { max-width:600px; margin:0 auto; background:#fff; border-radius:16px; box-shadow:0 4px 6px rgba(0,0,0,0.08); overflow:hidden; }
              .header { background:linear-gradient(135deg, #10b981 0, #059669 100%); color:#fff; text-align:center; padding:40px 30px; }
              .header h1 { font-size:26px; margin-bottom:10px; }
              .content { padding:40px 30px; background:#fff; }
              .footer { text-align:center; padding:20px; background:#f9fafb; color:#6b7280; font-size:12px;}
              .footer a { color:#10b981; text-decoration:none; }
            </style>
          </head>
          <body style="padding:20px;">
            <div class="container">
              <div class="header">
                <h1>${subject}</h1>
              </div>
              <div class="content">
                ${content}
              </div>
              <div class="footer">
                <p><strong>Student Opportunities Portal</strong></p>
                <p style="margin-top:10px;"><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe?email=${sub.email}">Unsubscribe</a></p>
              </div>
            </div>
          </body>
        </html>
        `;
        try {
          await sendEmail({
            to: sub.email,
            subject,
            html
          });
          successful++;
        } catch {
          failed++;
        }
      })
    );
    if (i + batchSize < subscribers.length) {
      await new Promise(res => setTimeout(res, 1000));
    }
  }
  console.log(`📧 Newsletter sent: ${successful} successful, ${failed} failed out of ${subscribers.length}`);
  return { successful, failed, total: subscribers.length };
};

// ==== EXPORTS ====
module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendApplicationConfirmation,
  sendNewsletter
};
