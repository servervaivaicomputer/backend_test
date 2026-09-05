require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

app.use(express.json());

// In-memory user (no database)
const USERS = [
  {
    id: 1,
    username: process.env.ADMIN_USER || 'admin',
    password: process.env.ADMIN_PASS || 'admin123'
  }
];

// ─── PUBLIC ROUTES ──────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required.'
    });
  }

  const user = USERS.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials.'
    });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    token,
    username: user.username
  });
});

app.get('/api/verify', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ─── PROTECTED ROUTES ───────────────────────────────
// Private pages served from backend/private/ folder

app.get('/cloud', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'private', 'cloud.html'));
});

app.get('/workplace', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'private', 'workplace.html'));
});

// Catch-all
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});