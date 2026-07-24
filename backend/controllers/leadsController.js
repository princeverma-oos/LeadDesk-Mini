const mongoose = require('mongoose');
const Lead = require('../models/Lead');

// Mock leads for Demo Mode fallback
let demoLeads = [
  {
    _id: 'demo_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    budget: '$1000–$5000',
    message: 'We are looking to build a custom SaaS workspace and customer management tool for our sales team.',
    status: 'New',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'demo_2',
    name: 'Alice Smith',
    email: 'alice.smith@techcorp.io',
    budget: '< $500',
    message: 'Need standard landing page visual adjustments and Framer Motion micro-animations.',
    status: 'Contacted',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'demo_3',
    name: 'Robert Johnson',
    email: 'robert@ventures.co',
    budget: '>$5000',
    message: 'Seeking a full-stack engineer to build our core marketplace MVP. High scale Node/Express/MongoDB requirements.',
    status: 'New',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'demo_4',
    name: 'Sarah Connor',
    email: 's.connor@cyberdyne.com',
    budget: '$500–$1000',
    message: 'Require custom React Hook Form integrations and dark mode styles for a defense portal.',
    status: 'Closed',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    _id: 'demo_5',
    name: 'David Lightman',
    email: 'david@wopr.mil',
    budget: '$1000–$5000',
    message: 'Looking to connect our system to external APIs. Need quick live searches and paginated databases.',
    status: 'New',
    createdAt: new Date()
  }
];

// Helper to check DB connection readiness
const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to get stats of demo leads
const getDemoStats = () => {
  return {
    total: demoLeads.length,
    new: demoLeads.filter(l => l.status === 'New').length,
    contacted: demoLeads.filter(l => l.status === 'Contacted').length,
    closed: demoLeads.filter(l => l.status === 'Closed').length
  };
};

// @desc    Save new lead
// @route   POST /api/leads
const createLead = async (req, res) => {
  // If in Demo Mode, block database save operation and return validation error structure
  if (!isDbConnected()) {
    return res.status(400).json({
      success: false,
      message: 'Demo Mode: Database is not connected. Configure MONGODB_URI in the backend to enable this feature.',
      errors: [
        { field: 'db', message: 'Demo Mode. Database is not connected. Configure MONGODB_URI in the backend to enable this feature.' }
      ]
    });
  }

  try {
    const { name, email, budget, message } = req.body;

    const lead = new Lead({
      name,
      email,
      budget,
      message,
    });

    await lead.save();

    res.status(201).json({
      success: true,
      message: 'Lead submitted successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error creating lead:', error.message);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all leads (with optional status filter, pagination)
// @route   GET /api/leads
const getAllLeads = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Fallback to in-memory demo data if database is not connected
    if (!isDbConnected()) {
      let filtered = [...demoLeads];
      if (status && status !== 'All') {
        filtered = filtered.filter(l => l.status === status);
      }
      
      const count = filtered.length;
      const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);
      
      return res.json({
        success: true,
        count,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum,
        leads: paginated,
        stats: getDemoStats()
      });
    }

    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const count = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const stats = {
      total: await Lead.countDocuments({}),
      new: await Lead.countDocuments({ status: 'New' }),
      contacted: await Lead.countDocuments({ status: 'Contacted' }),
      closed: await Lead.countDocuments({ status: 'Closed' }),
    };

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      leads,
      stats
    });
  } catch (error) {
    console.error('Error fetching leads:', error.message);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id
const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['New', 'Contacted', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    // Fallback to in-memory demo data modification if database is not connected
    if (!isDbConnected()) {
      const index = demoLeads.findIndex(l => l._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }
      demoLeads[index].status = status;
      return res.json({
        success: true,
        message: 'Demo Mode: Lead status updated locally',
        data: demoLeads[index]
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, message: 'Lead status updated successfully', data: lead });
  } catch (error) {
    console.error('Error updating lead status:', error.message);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Search leads by name, email, budget, or message
// @route   GET /api/leads/search
const searchLeads = async (req, res) => {
  try {
    const { q, status, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Fallback to in-memory demo search if database is not connected
    if (!isDbConnected()) {
      let filtered = [...demoLeads];
      if (q) {
        const lowerQ = q.toLowerCase();
        filtered = filtered.filter(l => 
          l.name.toLowerCase().includes(lowerQ) ||
          l.email.toLowerCase().includes(lowerQ) ||
          l.budget.toLowerCase().includes(lowerQ) ||
          l.message.toLowerCase().includes(lowerQ)
        );
      }
      if (status && status !== 'All') {
        filtered = filtered.filter(l => l.status === status);
      }
      
      const count = filtered.length;
      const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);
      
      return res.json({
        success: true,
        count,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum,
        leads: paginated,
        stats: getDemoStats()
      });
    }

    let query = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { budget: { $regex: q, $options: 'i' } },
        { message: { $regex: q, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const count = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const stats = {
      total: await Lead.countDocuments({}),
      new: await Lead.countDocuments({ status: 'New' }),
      contacted: await Lead.countDocuments({ status: 'Contacted' }),
      closed: await Lead.countDocuments({ status: 'Closed' }),
    };

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      leads,
      stats
    });
  } catch (error) {
    console.error('Error searching leads:', error.message);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createLead,
  getAllLeads,
  updateLeadStatus,
  searchLeads
};
