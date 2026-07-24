const mongoose = require('mongoose');
const Lead = require('../models/Lead');

// Mock leads for Demo Mode fallback
let demoLeads = [
  {
    _id: 'demo_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: 'Acme Corp',
    phone: '+1 555-0199',
    message: 'We are looking to build a custom SaaS workspace and customer management tool for our sales team.',
    status: 'New',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'demo_2',
    name: 'Alice Smith',
    email: 'alice.smith@techcorp.io',
    company: 'TechCorp Solutions',
    phone: '+1 555-0142',
    message: 'Need standard landing page visual adjustments and Framer Motion micro-animations.',
    status: 'Contacted',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'demo_3',
    name: 'Robert Johnson',
    email: 'robert@ventures.co',
    company: 'Ventures Co',
    phone: '+1 555-0177',
    message: 'Seeking a full-stack engineer to build our core marketplace MVP. High scale Node/Express/MongoDB requirements.',
    status: 'Qualified',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'demo_4',
    name: 'Sarah Connor',
    email: 's.connor@cyberdyne.com',
    company: 'Cyberdyne Systems',
    phone: '+1 555-0153',
    message: 'Require custom React Hook Form integrations and dark mode styles for a defense portal.',
    status: 'Closed',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    _id: 'demo_5',
    name: 'David Lightman',
    email: 'david@wopr.mil',
    company: 'WOPR Systems',
    phone: '+1 555-0188',
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
    qualified: demoLeads.filter(l => l.status === 'Qualified').length,
    closed: demoLeads.filter(l => l.status === 'Closed').length
  };
};

// @desc    Save new lead
// @route   POST /api/leads
const createLead = async (req, res) => {
  try {
    const { name, email, company, phone, message } = req.body;

    // Duplicate Submission Prevention (last 10 minutes)
    if (isDbConnected()) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const duplicate = await Lead.findOne({
        email: email.toLowerCase(),
        message: message,
        createdAt: { $gte: tenMinutesAgo }
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate submission detected. Please wait a few minutes before submitting the same inquiry again.'
        });
      }
    } else {
      // Demo mode duplicate check
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      const duplicate = demoLeads.find(
        l => l.email.toLowerCase() === email.toLowerCase() && 
             l.message === message && 
             new Date(l.createdAt).getTime() >= tenMinutesAgo
      );
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate submission detected. Please wait a few minutes.'
        });
      }
    }

    // Connect to DB and save
    if (!isDbConnected()) {
      // In demo mode, add to in-memory array for preview
      const newLead = {
        _id: 'demo_' + (demoLeads.length + 1),
        name,
        email,
        company,
        phone,
        message,
        status: 'New',
        createdAt: new Date()
      };
      demoLeads.push(newLead);
      return res.status(201).json({
        success: true,
        message: 'Lead submitted successfully (Demo Mode)',
        data: newLead
      });
    }

    const lead = new Lead({
      name,
      email,
      company,
      phone,
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

// @desc    Get all leads (with sorting, searching, status filter, pagination)
// @route   GET /api/leads
const getAllLeads = async (req, res) => {
  try {
    const { status, page = 1, limit = 8, q, sortBy = 'createdAt', order = 'desc' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Build filter query
    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { message: { $regex: q, $options: 'i' } }
      ];
    }

    // Build sorting parameters
    const sortObj = {};
    sortObj[sortBy] = order === 'desc' ? -1 : 1;

    // Fallback to in-memory demo data if database is not connected
    if (!isDbConnected()) {
      let filtered = [...demoLeads];
      if (status && status !== 'All') {
        filtered = filtered.filter(l => l.status === status);
      }
      if (q) {
        const lowerQ = q.toLowerCase();
        filtered = filtered.filter(l => 
          l.name.toLowerCase().includes(lowerQ) ||
          l.email.toLowerCase().includes(lowerQ) ||
          l.company.toLowerCase().includes(lowerQ) ||
          l.phone.toLowerCase().includes(lowerQ) ||
          l.message.toLowerCase().includes(lowerQ)
        );
      }

      // Sort
      filtered.sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        if (sortBy === 'createdAt') {
          return order === 'desc' ? new Date(valB) - new Date(valA) : new Date(valA) - new Date(valB);
        }
        if (typeof valA === 'string') {
          return order === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return order === 'desc' ? valB - valA : valA - valB;
      });
      
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

    const count = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const stats = {
      total: await Lead.countDocuments({}),
      new: await Lead.countDocuments({ status: 'New' }),
      contacted: await Lead.countDocuments({ status: 'Contacted' }),
      qualified: await Lead.countDocuments({ status: 'Qualified' }),
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
    if (!['New', 'Contacted', 'Qualified', 'Closed'].includes(status)) {
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

// @desc    Search leads
// @route   GET /api/leads/search
const searchLeads = async (req, res) => {
  // Reuse full query capability inside getAllLeads
  return getAllLeads(req, res);
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
const deleteLead = async (req, res) => {
  try {
    // Fallback to in-memory demo deletion
    if (!isDbConnected()) {
      const index = demoLeads.findIndex(l => l._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }
      demoLeads.splice(index, 1);
      return res.json({
        success: true,
        message: 'Demo Mode: Lead deleted locally'
      });
    }

    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error.message);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createLead,
  getAllLeads,
  updateLeadStatus,
  searchLeads,
  deleteLead
};
