const express = require('express');
const {
  getCompleteProfile,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  uploadResume,
  deleteResume,
  getProfileStats
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/firebaseUpload');

const router = express.Router();

// Profile routes
router.get('/complete', protect, getCompleteProfile);
router.get('/stats', protect, getProfileStats);
router.put('/', protect, updateProfile);

// Profile photo routes
router.post('/photo', protect, upload.single('profilePhoto'), uploadProfilePhoto);
router.delete('/photo', protect, deleteProfilePhoto);

// Resume routes
router.post('/resume', protect, upload.single('resume'), uploadResume);
router.delete('/resume', protect, deleteResume);

module.exports = router;