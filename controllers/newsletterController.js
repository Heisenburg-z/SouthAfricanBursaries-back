const { sendNewsletter } = require('../utils/emailService');
const Newsletter = require('../models/Newsletter'); // Model for subscribers

// POST /api/newsletter/send
exports.sendNewsletter = async (req, res) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required.' });
    }

    // Get all verified subscriber emails
    const subscribers = await Newsletter.find({ isVerified: true });
    if (subscribers.length === 0) {
      return res.status(400).json({ message: 'No subscribers to send to.' });
    }

    // Use sendNewsletter function (resend-based)
    const stats = await sendNewsletter(subscribers, subject, content);

    res.json({
      message: `Newsletter sent: ${stats.successful} of ${stats.total} successful.`,
      success: true,
      stats
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send newsletter', error: err.message });
  }
};
