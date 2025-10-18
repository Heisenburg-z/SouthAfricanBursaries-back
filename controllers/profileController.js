const User = require('../models/User');
const { uploadToFirebase, deleteFromFirebase } = require('../utils/firebaseUpload');

// Get complete user profile with completion percentage
const getCompleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpire -verificationToken');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate profile completion percentage
    const profileCompletion = calculateProfileCompletion(user);
    
    res.json({
      ...user.toObject(),
      profileCompletion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      idNumber,
      gender,
      race,
      address,
      education,
      skills
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic info
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (idNumber) user.idNumber = idNumber;
    if (gender) user.gender = gender;
    if (race) user.race = race;

    // Update address
    if (address) {
      if (typeof address === 'string') {
        try {
          user.address = JSON.parse(address);
        } catch (e) {
          user.address = { ...user.address, ...address };
        }
      } else {
        user.address = { ...user.address, ...address };
      }
    }

    // Update education
    if (education) {
      if (typeof education === 'string') {
        try {
          user.education = { ...user.education, ...JSON.parse(education) };
        } catch (e) {
          user.education = { ...user.education, ...education };
        }
      } else {
        user.education = { ...user.education, ...education };
      }
    }

    // Update skills
    if (skills) {
      user.skills = Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim());
    }

    await user.save();

    // Calculate updated profile completion
    const profileCompletion = calculateProfileCompletion(user);

    res.json({
      message: 'Profile updated successfully',
      user: {
        ...user.toObject(),
        profileCompletion
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only JPEG, PNG, and GIF images are allowed' });
    }

    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size must be less than 5MB' });
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

    // Upload new photo to Firebase with user-specific folder
    const fileInfo = await uploadToFirebase(req.file, `profile-photos/${req.user.id}`);
    
    // Update user document
    user.profilePhoto = {
      filename: fileInfo.filename,
      firebaseName: fileInfo.firebaseName,
      downloadURL: fileInfo.downloadURL,
      uploadedAt: new Date()
    };
    
    await user.save();

    // Calculate updated profile completion
    const profileCompletion = calculateProfileCompletion(user);
    
    res.json({
      message: 'Profile photo uploaded successfully',
      profilePhoto: user.profilePhoto,
      profileCompletion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// Delete profile photo
const deleteProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.profilePhoto) {
      return res.status(400).json({ message: 'No profile photo to delete' });
    }

    // Delete from Firebase
    await deleteFromFirebase(user.profilePhoto.firebaseName);
    
    // Remove from user document
    user.profilePhoto = undefined;
    await user.save();

    // Calculate updated profile completion
    const profileCompletion = calculateProfileCompletion(user);
    
    res.json({
      message: 'Profile photo deleted successfully',
      profileCompletion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
};

// Upload resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only PDF and DOC/DOCX files are allowed' });
    }

    // Validate file size (max 10MB)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size must be less than 10MB' });
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

    // Upload new resume to Firebase with user-specific folder
    const fileInfo = await uploadToFirebase(req.file, `resumes/${req.user.id}`);
    
    // Update user document
    user.resume = {
      filename: fileInfo.filename,
      firebaseName: fileInfo.firebaseName,
      downloadURL: fileInfo.downloadURL,
      uploadedAt: new Date()
    };
    
    await user.save();

    // Calculate updated profile completion
    const profileCompletion = calculateProfileCompletion(user);
    
    res.json({
      message: 'Resume uploaded successfully',
      resume: user.resume,
      profileCompletion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// Delete resume
const deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.resume) {
      return res.status(400).json({ message: 'No resume to delete' });
    }

    // Delete from Firebase
    await deleteFromFirebase(user.resume.firebaseName);
    
    // Remove from user document
    user.resume = undefined;
    await user.save();

    // Calculate updated profile completion
    const profileCompletion = calculateProfileCompletion(user);
    
    res.json({
      message: 'Resume deleted successfully',
      profileCompletion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
};

// Get profile statistics
const getProfileStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const profileCompletion = calculateProfileCompletion(user);
    
    const stats = {
      profileCompletion,
      hasProfilePhoto: !!user.profilePhoto,
      hasResume: !!user.resume,
      hasEducation: !!(user.education?.institution && user.education?.qualification),
      hasPersonalInfo: !!(user.phone && user.dateOfBirth && user.gender),
      missingFields: getMissingFields(user)
    };
    
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate profile completion
function calculateProfileCompletion(user) {
  let completedFields = 0;
  const totalFields = 12;
  
  if (user.firstName && user.lastName) completedFields++;
  if (user.email) completedFields++;
  if (user.phone) completedFields++;
  if (user.dateOfBirth) completedFields++;
  if (user.idNumber) completedFields++;
  if (user.gender) completedFields++;
  if (user.race) completedFields++;
  if (user.address?.street) completedFields++;
  if (user.address?.city) completedFields++;
  if (user.address?.province) completedFields++;
  if (user.education?.institution && user.education?.qualification && user.education?.yearOfStudy) completedFields++;
  if (user.resume?.downloadURL) completedFields++;
  
  return Math.round((completedFields / totalFields) * 100);
}

// Helper function to get missing fields
function getMissingFields(user) {
  const missing = [];
  
  if (!user.phone) missing.push('Phone number');
  if (!user.dateOfBirth) missing.push('Date of birth');
  if (!user.idNumber) missing.push('ID number');
  if (!user.gender) missing.push('Gender');
  if (!user.race) missing.push('Race');
  if (!user.address?.street) missing.push('Street address');
  if (!user.address?.city) missing.push('City');
  if (!user.address?.province) missing.push('Province');
  if (!user.education?.institution) missing.push('Educational institution');
  if (!user.education?.qualification) missing.push('Qualification');
  if (!user.education?.yearOfStudy) missing.push('Year of study');
  if (!user.resume) missing.push('Resume');
  
  return missing;
}

module.exports = {
  getCompleteProfile,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  uploadResume,
  deleteResume,
  getProfileStats
};