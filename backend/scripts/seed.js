const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
// Load .env file from the backend folder
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Lead = require('../models/Lead');
const Admin = require('../models/Admin');

const mockLeads = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: 'Acme Corp',
    phone: '+1 555-0199',
    message: 'We are looking to build a custom SaaS workspace and customer management tool for our sales team.',
    status: 'New',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Alice Smith',
    email: 'alice.smith@techcorp.io',
    company: 'TechCorp Solutions',
    phone: '+1 555-0142',
    message: 'Need standard landing page visual adjustments and Framer Motion micro-animations.',
    status: 'Contacted',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Robert Johnson',
    email: 'robert@ventures.co',
    company: 'Ventures Co',
    phone: '+1 555-0177',
    message: 'Seeking a full-stack engineer to build our core marketplace MVP. High scale Node/Express/MongoDB requirements.',
    status: 'Qualified',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Sarah Connor',
    email: 's.connor@cyberdyne.com',
    company: 'Cyberdyne Systems',
    phone: '+1 555-0153',
    message: 'Require custom React Hook Form integrations and dark mode styles for a defense portal.',
    status: 'Closed',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    name: 'David Lightman',
    email: 'david@wopr.mil',
    company: 'WOPR Systems',
    phone: '+1 555-0188',
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

    // Seed Admin if none exists
    const adminEmail = 'admin@example.com';
    const adminExists = await Admin.findOne({ email: adminEmail });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Admin.create({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword
      });
      console.log(`✓ Admin user seeded successfully: ${adminEmail} / password123`);
    } else {
      console.log('Admin user already exists, skipping admin seed.');
    }
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
