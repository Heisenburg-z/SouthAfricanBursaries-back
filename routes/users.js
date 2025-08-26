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

router.get('/', protect, admin, getUsers);
router.get('/:id', protect, admin, getUser);
router.get('/:id/applications', protect, getUserApplications);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;