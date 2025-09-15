const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const { uploadToFirebase } = require('../utils/firebaseUpload');

const getApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    // If not admin, only show user's applications
    if (!req.user.isAdmin) {
      query.applicant = req.user.id;
    }
    
    const applications = await Application.find(query)
      .sort({ applicationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('applicant', 'firstName lastName email')
      .populate('opportunity', 'title provider type');
    
    const total = await Application.countDocuments(query);
    
    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant')
      .populate('opportunity');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if user is authorized to view this application
    if (!req.user.isAdmin && application.applicant._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }
    
    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createApplication = async (req, res) => {
  try {
    const { opportunityId, answers } = req.body;
    
    // Check if opportunity exists
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Check if application already exists
    const existingApplication = await Application.findOne({
      applicant: req.user.id,
      opportunity: opportunityId
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this opportunity' });
    }
    
    // Check if application deadline has passed
    if (new Date() > opportunity.applicationDeadline) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }
    
    // Handle file uploads if any
    let documents = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileInfo = await uploadToFirebase(file, 'application-documents');
        documents.push({
          name: fileInfo.filename,
          firebaseName: fileInfo.firebaseName,
          downloadURL: fileInfo.downloadURL,
          uploadedAt: new Date()
        });
      }
    }
    
    const application = new Application({
      applicant: req.user.id,
      opportunity: opportunityId,
      answers,
      documents
    });
    
    const savedApplication = await application.save();
    
    // Add application to opportunity
    opportunity.applications.push(savedApplication._id);
    await opportunity.save();
    
    // Populate and return the application
    const populatedApplication = await Application.findById(savedApplication._id)
      .populate('applicant', 'firstName lastName email')
      .populate('opportunity', 'title provider type');
    
    res.status(201).json(populatedApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    application.status = status;
    const updatedApplication = await application.save();
    
    res.json(updatedApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus
};