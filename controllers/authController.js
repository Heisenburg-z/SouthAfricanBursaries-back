const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
      user.idNumber = req.body.idNumber || user.idNumber;
      user.gender = req.body.gender || user.gender;
      user.race = req.body.race || user.race;
      
      if (req.body.address) {
        user.address.street = req.body.address.street || user.address.street;
        user.address.city = req.body.address.city || user.address.city;
        user.address.province = req.body.address.province || user.address.province;
        user.address.postalCode = req.body.address.postalCode || user.address.postalCode;
      }
      
      if (req.body.education) {
        user.education.institution = req.body.education.institution || user.education.institution;
        user.education.qualification = req.body.education.qualification || user.education.qualification;
        user.education.fieldOfStudy = req.body.education.fieldOfStudy || user.education.fieldOfStudy;
        user.education.yearOfStudy = req.body.education.yearOfStudy || user.education.yearOfStudy;
        user.education.graduationYear = req.body.education.graduationYear || user.education.graduationYear;
        user.education.averageMarks = req.body.education.averageMarks || user.education.averageMarks;
      }
      
      user.skills = req.body.skills || user.skills;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};