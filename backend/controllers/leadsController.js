const Lead = require('../models/Lead');

// @desc    Save new lead
// @route   POST /api/leads
const createLead = async (req, res) => {
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
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

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
