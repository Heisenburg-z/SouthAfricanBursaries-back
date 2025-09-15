const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  idNumber: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  race: {
    type: String,
    enum: ['African', 'Coloured', 'Indian', 'White', 'Other']
  },
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String
  },
  education: {
    institution: String,
    qualification: String,
    fieldOfStudy: String,
    yearOfStudy: Number,
    graduationYear: Number,
    averageMarks: Number
  },
  skills: [String],
  resume: {
    filename: String,
    firebaseName: String,  // Firebase storage path
    downloadURL: String,   // Firebase download URL
    uploadedAt: Date
  },
  profilePhoto: {
    filename: String,
    firebaseName: String,  // Firebase storage path
    downloadURL: String,   // Firebase download URL
    uploadedAt: Date
  },
  transcripts: [{
    filename: String,
    firebaseName: String,  // Firebase storage path
    downloadURL: String,   // Firebase download URL
    uploadedAt: Date,
    description: String
  }],
  isAdmin: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);