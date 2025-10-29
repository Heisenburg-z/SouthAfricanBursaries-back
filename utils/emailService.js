const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'Student Opportunities'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html
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

// Welcome email template
const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #1f2937;
          background: #f3f4f6;
          padding: 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .header h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .content { 
          padding: 40px 30px;
          background: white;
        }
        .content h2 {
          color: #10b981;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .content p {
          margin-bottom: 15px;
          color: #4b5563;
        }
        .features {
          background: #f0fdf4;
          border-left: 4px solid #10b981;
          padding: 20px;
          margin: 25px 0;
          border-radius: 8px;
        }
        .features ul {
          list-style: none;
          padding: 0;
        }
        .features li {
          padding: 8px 0;
          padding-left: 25px;
          position: relative;
        }
        .features li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
        }
        .button { 
          display: inline-block; 
          background: #10b981;
          color: white !important; 
          padding: 14px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 25px 0;
          font-weight: 600;
          text-align: center;
        }
        .button:hover {
          background: #059669;
        }
        .tips {
          background: #eff6ff;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        .tips h3 {
          color: #1e40af;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .tips ol {
          padding-left: 20px;
          color: #4b5563;
        }
        .tips li {
          margin-bottom: 8px;
        }
        .footer { 
          text-align: center; 
          padding: 30px;
          background: #f9fafb;
          color: #6b7280; 
          font-size: 13px;
          border-top: 1px solid #e5e7eb;
        }
        .footer a {
          color: #10b981;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Welcome Aboard!</h1>
          <p style="font-size: 16px; margin: 0;">You're now part of South Africa's #1 Student Platform</p>
        </div>
        
        <div class="content">
          <h2>Hi ${user.firstName}! 👋</h2>
          <p>We're absolutely thrilled to have you join our growing community of ambitious South African students!</p>
          
          <div class="features">
            <strong style="color: #10b981; font-size: 16px;">🚀 Here's what you can do now:</strong>
            <ul style="margin-top: 15px;">
              <li>Browse 55+ verified opportunities from top SA companies</li>
              <li>Apply for bursaries, internships, and graduate programs</li>
              <li>Track all your applications in one place</li>
              <li>Upload documents once, reuse for multiple applications</li>
              <li>Get deadline reminders so you never miss out</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">
              🎯 Go to Your Dashboard
            </a>
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

          <p><strong>Need help?</strong> We're here for you! Simply reply to this email or check out our Help Center.</p>
          
          <p style="margin-top: 30px;">
            Wishing you all the best on your journey to success! 🚀<br>
            <em style="color: #6b7280;">The Student Opportunities Team</em>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Student Opportunities Portal</strong></p>
          <p style="margin-top: 5px;">South Africa's Premier Student Career Platform</p>
          <p style="margin-top: 15px;">
            You're receiving this because you registered at 
            <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL || 'Student Opportunities Portal'}</a>
          </p>
          <p style="margin-top: 10px;">
            <a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a> | 
            <a href="${process.env.FRONTEND_URL}/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: '🎓 Welcome to Student Opportunities Portal - Let\'s Get Started!',
    html
  });
};

// Application confirmation email
const sendApplicationConfirmation = async (user, opportunity) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6; 
          color: #1f2937;
          background: #f3f4f6;
          padding: 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .header h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .content { 
          padding: 40px 30px;
        }
        .success-badge {
          background: #dcfce7;
          border: 2px solid #10b981;
          color: #065f46;
          padding: 15px;
          border-radius: 10px;
          text-align: center;
          margin: 20px 0;
          font-weight: 600;
        }
        .opportunity-box { 
          background: #f0fdf4;
          border-left: 4px solid #10b981;
          padding: 20px;
          margin: 25px 0;
          border-radius: 8px;
        }
        .opportunity-box h3 {
          color: #10b981;
          margin-bottom: 15px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .button { 
          display: inline-block; 
          background: #10b981;
          color: white !important; 
          padding: 14px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 25px 0;
          font-weight: 600;
        }
        .steps {
          background: #eff6ff;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .steps ol {
          padding-left: 20px;
          color: #4b5563;
        }
        .steps li {
          margin-bottom: 10px;
        }
        .footer { 
          text-align: center; 
          padding: 30px;
          background: #f9fafb;
          color: #6b7280; 
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Application Submitted!</h1>
          <p>Your application is on its way</p>
        </div>
        
        <div class="content">
          <h2 style="color: #10b981;">Hi ${user.firstName}! 🎉</h2>
          
          <div class="success-badge">
            ✓ Your application has been successfully submitted and is being processed
          </div>
          
          <div class="opportunity-box">
            <h3>${opportunity.title}</h3>
            <div class="detail-row">
              <span><strong>Provider:</strong></span>
              <span>${opportunity.provider}</span>
            </div>
            <div class="detail-row">
              <span><strong>Category:</strong></span>
              <span style="text-transform: capitalize;">${opportunity.category}</span>
            </div>
            <div class="detail-row">
              <span><strong>Location:</strong></span>
              <span>${opportunity.location}</span>
            </div>
            <div class="detail-row">
              <span><strong>Submitted:</strong></span>
              <span>${new Date().toLocaleDateString('en-ZA', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>

          <div class="steps">
            <strong style="color: #1e40af; font-size: 16px;">📋 What Happens Next?</strong>
            <ol style="margin-top: 15px;">
              <li>Your application will be reviewed by <strong>${opportunity.provider}</strong></li>
              <li>You'll receive email updates on your application status</li>
              <li>Track your progress anytime in your dashboard</li>
              <li>If shortlisted, you'll be contacted for the next steps</li>
            </ol>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">
              📊 View My Applications
            </a>
          </div>

          <p style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <strong>💡 Pro Tip:</strong> Don't put all your eggs in one basket! 
            Continue applying to more opportunities to maximize your chances of success.
          </p>
          
          <p style="margin-top: 30px;">
            We're rooting for you! Good luck! 🍀<br>
            <em style="color: #6b7280;">The Student Opportunities Team</em>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Student Opportunities Portal</strong></p>
          <p style="margin-top: 10px;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="color: #10b981;">Dashboard</a> | 
            <a href="${process.env.FRONTEND_URL}/help" style="color: #10b981;">Help Center</a>
          </p>
        </div>
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

// Newsletter - send to multiple recipients
const sendNewsletter = async (subscribers, subject, content) => {
  try {
    // Resend supports batch sending
    const batchSize = 100; // Send in batches of 100
    const batches = [];
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      batches.push(subscribers.slice(i, i + batchSize));
    }

    let successful = 0;
    let failed = 0;

    for (const batch of batches) {
      const emailPromises = batch.map(subscriber => {
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f3f4f6; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .footer { text-align: center; padding: 20px; background: #f9fafb; color: #6b7280; font-size: 12px; }
              a { color: #10b981; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📬 ${subject}</h1>
              </div>
              <div class="content">
                ${content}
              </div>
              <div class="footer">
                <p><strong>Student Opportunities Portal</strong></p>
                <p style="margin-top: 10px;">
                  <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${subscriber.email}">Unsubscribe</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        return sendEmail({
          to: subscriber.email,
          subject,
          html
        });
      });

      const results = await Promise.allSettled(emailPromises);
      successful += results.filter(r => r.status === 'fulfilled').length;
      failed += results.filter(r => r.status === 'rejected').length;
    }

    console.log(`📧 Newsletter sent: ${successful} successful, ${failed} failed out of ${subscribers.length}`);
    return { successful, failed, total: subscribers.length };
  } catch (error) {
    console.error('Newsletter error:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendApplicationConfirmation,
  sendNewsletter
};
