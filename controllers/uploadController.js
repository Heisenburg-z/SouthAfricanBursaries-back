const User = require('../models/User');
const { uploadToFirebase, deleteFromFirebase } = require('../utils/firebaseUpload');

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    
    // Delete old profile photo if exists
    if (user.profilePhoto && user.profilePhoto.firebaseName) {
      try {
        await deleteFromFirebase(user.profilePhoto.firebaseName);
      } catch (error) {
        console.error('Error deleting old profile photo:', error);
      }
    }

    // Upload new photo to Firebase
    const fileInfo = await uploadToFirebase(req.file, 'profile-photos');
    
    // Update user document
    user.profilePhoto = {
      filename: fileInfo.filename,
      firebaseName: fileInfo.firebaseName,
      downloadURL: fileInfo.downloadURL,
      uploadedAt: new Date()
    };
    
    await user.save();
    
    res.json({
      message: 'Profile photo uploaded successfully',
      profilePhoto: user.profilePhoto
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// Upload resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    
    // Delete old resume if exists
    if (user.resume && user.resume.firebaseName) {
      try {
        await deleteFromFirebase(user.resume.firebaseName);
      } catch (error) {
        console.error('Error deleting old resume:', error);
      }
    }

    // Upload new resume to Firebase
    const fileInfo = await uploadToFirebase(req.file, 'resumes');
    
    // Update user document
    user.resume = {
      filename: fileInfo.filename,
      firebaseName: fileInfo.firebaseName,
      downloadURL: fileInfo.downloadURL,
      uploadedAt: new Date()
    };
    
    await user.save();
    
    res.json({
      message: 'Resume uploaded successfully',
      resume: user.resume
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// Upload transcript
const uploadTranscript = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    const { description } = req.body;

    // Upload transcript to Firebase
    const fileInfo = await uploadToFirebase(req.file, 'transcripts');
    
    // Add to user's transcripts array
    user.transcripts.push({
      filename: fileInfo.filename,
      firebaseName: fileInfo.firebaseName,
      downloadURL: fileInfo.downloadURL,
      uploadedAt: new Date(),
      description: description || 'Academic Transcript'
    });
    
    await user.save();
    
    res.json({
      message: 'Transcript uploaded successfully',
      transcript: user.transcripts[user.transcripts.length - 1]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// Delete transcript
const deleteTranscript = async (req, res) => {
  try {
    const { transcriptId } = req.params;
    const user = await User.findById(req.user.id);
    
    // Find the transcript
    const transcript = user.transcripts.id(transcriptId);
    if (!transcript) {
      return res.status(404).json({ message: 'Transcript not found' });
    }
    
    // Delete from Firebase
    await deleteFromFirebase(transcript.firebaseName);
    
    // Remove from user's transcripts array
    user.transcripts.pull(transcriptId);
    await user.save();
    
    res.json({ message: 'Transcript deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
};

// Get user files
const getUserFiles = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('resume profilePhoto transcripts');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadProfilePhoto,
  uploadResume,
  uploadTranscript,
  deleteTranscript,
  getUserFiles
};