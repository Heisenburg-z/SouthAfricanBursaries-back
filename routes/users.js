const express = require('express');
const {
  getUsers,
  getUser,
  getUserApplications,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Add this new route for user profile with completion calculation
router.get('/profile/complete', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpire -verificationToken');
    
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
});

// Helper function to calculate profile completion
function calculateProfileCompletion(user) {
  let completedFields = 0;
  const totalFields = 10; // Adjust based on your required fields
  
  if (user.firstName && user.lastName) completedFields++;
  if (user.email) completedFields++;
  if (user.phone) completedFields++;
  if (user.dateOfBirth) completedFields++;
  if (user.idNumber) completedFields++;
  if (user.gender) completedFields++;
  if (user.race) completedFields++;
  if (user.address?.street && user.address?.city && user.address?.province) completedFields++;
  if (user.education?.institution && user.education?.qualification && user.education?.yearOfStudy) completedFields++;
  if (user.resume?.downloadURL) completedFields++;
  
  return Math.round((completedFields / totalFields) * 100);
}

router.get('/', protect, admin, getUsers);
router.get('/:id', protect, admin, getUser);
router.get('/:id/applications', protect, getUserApplications);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;