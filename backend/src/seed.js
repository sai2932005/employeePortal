require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Permission = require('./models/Permission');
const Role = require('./models/Role');
const User = require('./models/User');

const ROLE_PERMISSIONS = {
  Admin: ['access_zoho_people', 'access_zoho_crm', 'access_zoho_desk', 'access_zoho_books', 'manage_users', 'view_audit_logs'],
  HR: ['access_zoho_people'],
  Sales: ['access_zoho_crm'],
  Support: ['access_zoho_desk'],
  Finance: ['access_zoho_books'],
};

const PERMISSIONS = [
  { key: 'access_zoho_people', label: 'Access Zoho People' },
  { key: 'access_zoho_crm', label: 'Access Zoho CRM' },
  { key: 'access_zoho_desk', label: 'Access Zoho Desk' },
  { key: 'access_zoho_books', label: 'Access Zoho Books' },
  { key: 'manage_users', label: 'Manage Users & Roles' },
  { key: 'view_audit_logs', label: 'View Audit Logs' },
];

async function seed(){
    await connectDB();

    await Promise.all([Permission.deleteMany({}), Role.deleteMany({}), User.deleteMany({})]);

    await Permission.insertMany(PERMISSIONS);
    const roleDocs = {};

    for (const roleName of Object.keys(ROLE_PERMISSIONS)) { 
        roleDocs[roleName] = await Role.create({
            name : roleName,
            permissionKeys : ROLE_PERMISSIONS[roleName],

        });
    }
    const demoPassword = await bcrypt.hash('password123', 10);
    const demoUsers = [
    { name: 'Alice Admin', email: 'admin@demo.com', role: 'Admin' },
    { name: 'Hannah HR', email: 'hr@demo.com', role: 'HR' },
    { name: 'Sam Sales', email: 'sales@demo.com', role: 'Sales' },
    { name: 'Sean Support', email: 'support@demo.com', role: 'Support' },
    { name: 'Fiona Finance', email: 'finance@demo.com', role: 'Finance' },
  ];

  for (const user of demoUsers){
    await User.create({
        name :user.name,
        email :user.email,
        hashedPassword : demoPassword,
        roleIds :[roleDocs[user.role]._id]

  })
  }
  console.log('✅ Seed complete. Password for all demo users: Password123!');
  console.log('   admin@demo.com / hr@demo.com / sales@demo.com / support@demo.com / finance@demo.com');
  process.exit(0);


} 
seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});