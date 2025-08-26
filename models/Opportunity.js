const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['bursary', 'internship', 'graduate', 'learnership']
  },
  field: {
    type: String,
    required: [true, 'Field is required']
  },
  provider: {
    type: String,
    required: [true, 'Provider is required']
  },
  eligibility: {
    minAge: Number,
    maxAge: Number,
    requiredEducation: String,
    requiredFields: [String],
    minimumAverage: String,
    citizenship: [String],
    yearOfStudy: [Number],
    otherRequirements: String
  },
  funding: {
    tuition: String,
    accommodation: String,
    allowance: String
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  applicationProcess: String,
  applyMethod: {
    type: {
      type: String,
      enum: ['site', 'redirect']
    },
    url: String
  },
  documentsRequired: [String],
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }]
}, {
  timestamps: true
});

// Virtual for formatted deadline
opportunitySchema.virtual('formattedDeadline').get(function() {
  return this.applicationDeadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Index for better query performance
opportunitySchema.index({ category: 1, isActive: 1 });
opportunitySchema.index({ applicationDeadline: 1 });
opportunitySchema.index({ rating: -1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);