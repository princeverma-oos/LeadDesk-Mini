const express = require('express');
const router = express.Router();
const { validateLead } = require('../middleware/validation');
const {
  createLead,
  getAllLeads,
  updateLeadStatus,
  searchLeads
} = require('../controllers/leadsController');

// Save lead
router.post('/', validateLead, createLead);

// Return all leads
router.get('/', getAllLeads);

// Search leads
router.get('/search', searchLeads);

// Update lead status
router.patch('/:id', updateLeadStatus);

module.exports = router;
