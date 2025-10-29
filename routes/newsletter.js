const express = require('express');
const Newsletter = require('../models/Newsletter');
const { protect, admin } = require('../middleware/auth');
const { sendNewsletter } = require('../utils/emailService'); // NEW

const router = express.Router();

// Public route - Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const existingSubscription = await Newsletter.findOne({ email });
    if (existingSubscription) {
      if (existingSubscription.isSubscribed) {
        return res.status(400).json({ message: 'Email is already subscribed' });
      } else {
        existingSubscription.isSubscribed = true;
        await existingSubscription.save();
        return res.json({ message: 'Successfully resubscribed to newsletter' });
      }
    }
    const newsletter = new Newsletter({ email });
    await newsletter.save();
    res.status(201).json({ message: 'Successfully subscribed to newsletter' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public route - Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const subscription = await Newsletter.findOne({ email });
    if (!subscription) {
      return res.status(404).json({ message: 'Email not found in subscriptions' });
    }
    if (!subscription.isSubscribed) {
      return res.status(400).json({ message: 'Email is already unsubscribed' });
    }
    subscription.isSubscribed = false;
    await subscription.save();
    res.json({ message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-only route - Get all subscribers
router.get('/subscribers', protect, admin, async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-only route - Send newsletter to all subscribers (NEW!)
router.post('/send', protect, admin, async (req, res) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required.' });
    }
    const subscribers = await Newsletter.find({ isSubscribed: true });
    if (subscribers.length === 0) {
      return res.status(400).json({ message: 'No subscribers to send to.' });
    }
    const stats = await sendNewsletter(subscribers, subject, content);
    res.json({
      message: `Newsletter sent: ${stats.successful} of ${stats.total} successful.`,
      success: true,
      stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send newsletter', error: error.message });
  }
});

module.exports = router;
