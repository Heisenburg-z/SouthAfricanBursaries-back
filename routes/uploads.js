const express = require('express');
const { protect } = require('../middleware/auth');
const { 
  uploadProfilePhoto, 
  uploadResume, 
  uploadTranscript, 
  deleteTranscript, 
  getUserFiles,
  uploadDocument
} = require('../controllers/uploadController');
const { upload } = require('../utils/firebaseUpload');

const router = express.Router();

router.get('/', protect, getUserFiles);
router.post('/profile-photo', protect, upload.single('profilePhoto'), uploadProfilePhoto);
router.post('/resume', protect, upload.single('resume'), uploadResume);
router.post('/transcript', protect, upload.single('transcript'), uploadTranscript);
router.post('/documents', protect, upload.single('document'), uploadDocument); 
router.delete('/transcript/:transcriptId', protect, deleteTranscript);

module.exports = router;