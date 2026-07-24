const mongoose = require('mongoose');
const path = require('path');
// Load .env file from the backend folder
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Lead = require('../models/Lead');

const mockLeads = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    budget: '$1000–$5000',
    message: 'We are looking to build a custom SaaS workspace and customer management tool for our sales team.',
    status: 'New',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Alice Smith',
    email: 'alice.smith@techcorp.io',
    budget: '< $500',
    message: 'Need standard landing page visual adjustments and Framer Motion micro-animations.',
    status: 'Contacted',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Robert Johnson',
    email: 'robert@ventures.co',
    budget: '>$5000',
    message: 'Seeking a full-stack engineer to build our core marketplace MVP. High scale Node/Express/MongoDB requirements.',
    status: 'New',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Sarah Connor',
    email: 's.connor@cyberdyne.com',
    budget: '$500–$1000',
    message: 'Require custom React Hook Form integrations and dark mode styles for a defense portal.',
    status: 'Closed',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    name: 'David Lightman',
    email: 'david@wopr.mil',
    budget: '$1000–$5000',
    message: 'Looking to connect our system to external APIs. Need quick live searches and paginated databases.',
    status: 'New',
    createdAt: new Date()
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leaddesk-mini';
    console.log(`Seeding database at URI: ${mongoUri}...`);
    
    await mongoose.connect(mongoUri);
    
    // Clear existing leads
    await Lead.deleteMany({});
    console.log('Cleared existing leads.');
    
    // Insert new leads
    await Lead.insertMany(mockLeads);
    console.log('Database seeded with mock leads successfully!');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
