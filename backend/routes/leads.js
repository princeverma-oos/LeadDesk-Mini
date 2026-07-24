const express = require('express');
const router = express.Router();
const { validateLead } = require('../middleware/validation');
const { verifyJWT } = require('../middleware/auth');
const {
  createLead,
  getAllLeads,
  updateLeadStatus,
  searchLeads,
  deleteLead
} = require('../controllers/leadsController');

// Save lead (Public endpoint)
router.post('/', validateLead, createLead);

// Protected endpoints (require authentication)
router.get('/', verifyJWT, getAllLeads);
router.get('/search', verifyJWT, searchLeads);
router.patch('/:id', verifyJWT, updateLeadStatus);
router.delete('/:id', verifyJWT, deleteLead);

module.exports = router;
