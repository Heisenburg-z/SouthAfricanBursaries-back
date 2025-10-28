const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Newsletter = require('../models/Newsletter');

// Get comprehensive admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Parallel queries for better performance
    const [
      totalUsers,
      activeOpportunities,
      totalOpportunities,
      applications,
      totalSubscribers,
      activeSubscribers
    ] = await Promise.all([
      User.countDocuments(),
      Opportunity.countDocuments({ isActive: true }),
      Opportunity.countDocuments(),
      Application.find().populate('applicant opportunity'),
      Newsletter.countDocuments(),
      Newsletter.countDocuments({ isSubscribed: true })
    ]);

    // Application statistics by status
    const applicationsByStatus = applications.reduce((acc, app) => {
      const status = app.status.toLowerCase().replace(' ', '');
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Opportunities by category
    const opportunities = await Opportunity.find();
    const opportunitiesByCategory = opportunities.reduce((acc, opp) => {
      acc[opp.category] = (acc[opp.category] || 0) + 1;
      return acc;
    }, {});

    // Recent activity (last 20 items)
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentApplications = await Application.find()
      .populate('applicant opportunity')
      .sort({ applicationDate: -1 })
      .limit(5);
    const recentOpportunities = await Opportunity.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivity = [
      ...recentUsers.map(user => ({
        type: 'user',
        message: 'New user registered',
        details: `${user.firstName} ${user.lastName} (${user.email})`,
        timestamp: user.createdAt
      })),
      ...recentApplications.map(app => ({
        type: 'application',
        message: 'Application submitted',
        details: `${app.applicant.firstName} ${app.applicant.lastName} - ${app.opportunity.title}`,
        timestamp: app.applicationDate
      })),
      ...recentOpportunities.map(opp => ({
        type: 'opportunity',
        message: 'New opportunity added',
        details: opp.title,
        timestamp: opp.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);

    // Monthly statistics for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyApplications = await Application.aggregate([
      {
        $match: { applicationDate: { $gte: sixMonthsAgo } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$applicationDate' },
            month: { $month: '$applicationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyUsers = await User.aggregate([
      {
        $match: { createdAt: { $gte: sixMonthsAgo } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalUsers,
      activeOpportunities,
      totalOpportunities,
      inactiveOpportunities: totalOpportunities - activeOpportunities,
      pendingApplications: applicationsByStatus.pending || 0,
      totalApplications: applications.length,
      totalSubscribers,
      activeSubscribers,
      applicationsByStatus: {
        pending: applicationsByStatus.pending || 0,
        underreview: applicationsByStatus.underreview || 0,
        shortlisted: applicationsByStatus.shortlisted || 0,
        accepted: applicationsByStatus.accepted || 0,
        rejected: applicationsByStatus.rejected || 0
      },
      opportunitiesByCategory,
      recentActivity,
      monthlyStats: {
        applications: monthlyApplications,
        users: monthlyUsers
      },
      successRate: applications.length > 0 
        ? ((applicationsByStatus.accepted || 0) / applications.length * 100).toFixed(1)
        : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent activity logs
const getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(parseInt(limit) / 3);
    const recentApplications = await Application.find()
      .populate('applicant opportunity')
      .sort({ applicationDate: -1 })
      .limit(parseInt(limit) / 3);
    const recentOpportunities = await Opportunity.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 3);

    const activity = [
      ...recentUsers.map(user => ({
        type: 'user',
        icon: 'UserPlus',
        message: 'New user registered',
        details: `${user.firstName} ${user.lastName}`,
        email: user.email,
        timestamp: user.createdAt
      })),
      ...recentApplications.map(app => ({
        type: 'application',
        icon: 'FileText',
        message: 'Application submitted',
        details: app.opportunity.title,
        applicant: `${app.applicant.firstName} ${app.applicant.lastName}`,
        status: app.status,
        timestamp: app.applicationDate
      })),
      ...recentOpportunities.map(opp => ({
        type: 'opportunity',
        icon: 'Briefcase',
        message: 'New opportunity added',
        details: opp.title,
        provider: opp.provider,
        timestamp: opp.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    res.json({ activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Bulk operations on opportunities
const bulkOpportunityOperation = async (req, res) => {
  try {
    const { opportunityIds, action } = req.body;

    if (!opportunityIds || !Array.isArray(opportunityIds) || opportunityIds.length === 0) {
      return res.status(400).json({ message: 'Please provide opportunity IDs' });
    }

    if (!['activate', 'deactivate', 'delete'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    let result;

    switch (action) {
      case 'activate':
        result = await Opportunity.updateMany(
          { _id: { $in: opportunityIds } },
          { isActive: true }
        );
        break;
      case 'deactivate':
        result = await Opportunity.updateMany(
          { _id: { $in: opportunityIds } },
          { isActive: false }
        );
        break;
      case 'delete':
        result = await Opportunity.deleteMany({ _id: { $in: opportunityIds } });
        // Also delete associated applications
        await Application.deleteMany({ opportunity: { $in: opportunityIds } });
        break;
    }

    res.json({
      message: `Bulk ${action} completed successfully`,
      modifiedCount: result.modifiedCount || result.deletedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export data as CSV
const exportData = async (req, res) => {
  try {
    const { type } = req.params;

    let data;
    let filename;

    switch (type) {
      case 'users':
        data = await User.find().select('-password').lean();
        filename = `users_export_${Date.now()}.csv`;
        break;
      case 'applications':
        data = await Application.find()
          .populate('applicant', 'firstName lastName email')
          .populate('opportunity', 'title provider category')
          .lean();
        filename = `applications_export_${Date.now()}.csv`;
        break;
      case 'opportunities':
        data = await Opportunity.find().lean();
        filename = `opportunities_export_${Date.now()}.csv`;
        break;
      case 'newsletter':
        data = await Newsletter.find().lean();
        filename = `newsletter_export_${Date.now()}.csv`;
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    // Convert to CSV format
    const csv = convertToCSV(data, type);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to convert data to CSV
const convertToCSV = (data, type) => {
  if (!data || data.length === 0) return '';

  let headers = [];
  let rows = [];

  switch (type) {
    case 'users':
      headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Date of Birth', 'Gender', 'Race', 'Created At'];
      rows = data.map(user => [
        user._id,
        user.firstName,
        user.lastName,
        user.email,
        user.phone || '',
        user.dateOfBirth || '',
        user.gender || '',
        user.race || '',
        user.createdAt
      ]);
      break;
    case 'applications':
      headers = ['ID', 'Applicant Name', 'Applicant Email', 'Opportunity', 'Provider', 'Category', 'Status', 'Application Date'];
      rows = data.map(app => [
        app._id,
        `${app.applicant?.firstName} ${app.applicant?.lastName}`,
        app.applicant?.email,
        app.opportunity?.title,
        app.opportunity?.provider,
        app.opportunity?.category,
        app.status,
        app.applicationDate
      ]);
      break;
    case 'opportunities':
      headers = ['ID', 'Title', 'Provider', 'Category', 'Field', 'Location', 'Deadline', 'Applications', 'Views', 'Active', 'Created At'];
      rows = data.map(opp => [
        opp._id,
        opp.title,
        opp.provider,
        opp.category,
        opp.field,
        opp.location,
        opp.applicationDeadline,
        opp.applicationsCount || 0,
        opp.views || 0,
        opp.isActive ? 'Yes' : 'No',
        opp.createdAt
      ]);
      break;
    case 'newsletter':
      headers = ['Email', 'Subscribed', 'Subscribed At'];
      rows = data.map(sub => [
        sub.email,
        sub.isSubscribed ? 'Yes' : 'No',
        sub.subscribedAt
      ]);
      break;
  }

  const csvRows = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ];

  return csvRows.join('\n');
};

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // User growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Application trends
    const applicationTrends = await Application.aggregate([
      { $match: { applicationDate: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$applicationDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top opportunities by applications
    const topOpportunities = await Opportunity.find()
      .sort({ applicationsCount: -1 })
      .limit(10)
      .select('title provider applicationsCount views category');

    // Application status distribution
    const statusDistribution = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Category popularity
    const categoryStats = await Opportunity.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalApplications: { $sum: '$applicationsCount' },
          avgViews: { $avg: '$views' }
        }
      }
    ]);

    res.json({
      userGrowth,
      applicationTrends,
      topOpportunities,
      statusDistribution,
      categoryStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  bulkOpportunityOperation,
  exportData,
  getAnalytics
};
