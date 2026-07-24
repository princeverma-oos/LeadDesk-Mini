const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  budget: {
    type: String,
    required: [true, 'Budget is required'],
    enum: {
      values: ['< $500', '$500–$1000', '$500-$1000', '$1000–$5000', '$1000-$5000', '>$5000'],
      message: 'Budget must be one of the specified options',
    },
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    minlength: [10, 'Message must be at least 10 characters long'],
  },
  status: {
    type: String,
    required: true,
    enum: ['New', 'Contacted', 'Closed'],
    default: 'New',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Lead', LeadSchema);
