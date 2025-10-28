const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const { uploadToFirebase } = require('../utils/firebaseUpload');

// Add this new function for user's applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('opportunity', 'title provider category applicationDeadline')
      .sort({ applicationDate: -1 });
    
    res.json({ applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
      .populate('opportunity', 'title provider category applicationDeadline');
    
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
    console.log('📝 Creating application with data:', req.body);
    
    const { opportunityId, answers, documents } = req.body;

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

    // ✅ FIX: Accept documents from request body (already uploaded to Firebase)
    // Documents come as an array with: { name, firebaseName, downloadURL, uploadedAt, size, type }
    const applicationDocuments = documents || [];

    console.log('📄 Documents received:', applicationDocuments.length);

    // Create application
    const application = new Application({
      applicant: req.user.id,
      opportunity: opportunityId,
      answers: answers || [],
      documents: applicationDocuments
    });

    const savedApplication = await application.save();
    console.log('✅ Application saved:', savedApplication._id);

    // ✅ Add application to opportunity and increment count
    opportunity.applications.push(savedApplication._id);
    opportunity.applicationsCount = (opportunity.applicationsCount || 0) + 1;
    await opportunity.save();
    console.log('✅ Opportunity updated, applications count:', opportunity.applicationsCount);

    // ✅ Add application to user's applications array
    const user = await User.findById(req.user.id);
    if (user && user.applications) {
      user.applications.push(savedApplication._id);
      await user.save();
      console.log('✅ User applications updated');
    }

    // Populate and return the application
    const populatedApplication = await Application.findById(savedApplication._id)
      .populate('applicant', 'firstName lastName email')
      .populate('opportunity', 'title provider category applicationDeadline location field');

    console.log('🎉 Application submitted successfully!');
    res.status(201).json(populatedApplication);

  } catch (error) {
    console.error('❌ Error creating application:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
  getMyApplications, // Add this export
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus
};