const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Shortlisted', 'Rejected', 'Accepted'],
    default: 'Pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  answers: [{
    question: String,
    answer: String
  }],
  documents: [{
    name: String,
    firebaseName: String,  // Firebase storage path
    downloadURL: String,   // Firebase download URL
    uploadedAt: Date
  }],
  notes: String
}, {
  timestamps: true
});

// Create compound index to prevent duplicate applications
applicationSchema.index({ applicant: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);