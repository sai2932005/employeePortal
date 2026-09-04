require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require("./src/routes/dashboardRoutes") ;
const adminRoutes = require("./src/routes/adminRoutes");


const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/admin",adminRoutes);


const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error(' Failed to connect to DB:', err.message);
    process.exit(1);
  });