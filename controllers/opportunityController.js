const Opportunity = require('../models/Opportunity');

// Add this new function for upcoming deadlines
const getUpcomingDeadlines = async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const opportunities = await Opportunity.find({
      applicationDeadline: { 
        $gte: new Date(), 
        $lte: thirtyDaysFromNow 
      },
      isActive: true
    })
    .select('title provider category applicationDeadline')
    .sort({ applicationDeadline: 1 })
    .limit(10);
    
    // Add days left calculation
    const opportunitiesWithDaysLeft = opportunities.map(opportunity => {
      const daysLeft = calculateDaysLeft(opportunity.applicationDeadline);
      return {
        ...opportunity.toObject(),
        daysLeft
      };
    });
    
    res.json({ opportunities: opportunitiesWithDaysLeft });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate days left
function calculateDaysLeft(deadline) {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

const getOpportunities = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } }
      ];
    }
    
    const opportunities = await Opportunity.find(query)
      .sort({ applicationDeadline: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Opportunity.countDocuments(query);
    
    res.json({
      opportunities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Increment view count
    opportunity.views += 1;
    await opportunity.save();
    
    res.json(opportunity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createOpportunity = async (req, res) => {
  try {
    const opportunity = new Opportunity(req.body);
    const savedOpportunity = await opportunity.save();
    res.status(201).json(savedOpportunity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    res.json(opportunity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    await opportunity.remove();
    res.json({ message: 'Opportunity removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUpcomingDeadlines, // Add this export
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
};