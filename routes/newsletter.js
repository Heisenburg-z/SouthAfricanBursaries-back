const express = require('express');
const Newsletter = require('../models/Newsletter');

const router = express.Router();

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if email is already subscribed
    const existingSubscription = await Newsletter.findOne({ email });
    
    if (existingSubscription) {
      if (existingSubscription.isSubscribed) {
        return res.status(400).json({ message: 'Email is already subscribed' });
      } else {
        // Resubscribe
        existingSubscription.isSubscribed = true;
        await existingSubscription.save();
        return res.json({ message: 'Successfully resubscribed to newsletter' });
      }
    }
    
    // Create new subscription
    const newsletter = new Newsletter({ email });
    await newsletter.save();
    
    res.status(201).json({ message: 'Successfully subscribed to newsletter' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/subscribers', protect, admin, async (req, res)  => {
const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
res.json(subscribers);
});
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

module.exports = router;