const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');

const app = express();

app.use(cors({
  origin: 'https://your-frontend.netlify.app',  // frontend URL
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ---- Login route (no DB, hardcoded or env-based) ----
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.ADMIN_USER;
  const validPass = process.env.ADMIN_PASS;

  if (username === validUser && password === validPass) {
    // Simple token (JWT or random string stored in cookie)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000 // 1 hour
    });
    return res.json({ success: true, message: 'Logged in' });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// ---- Logout ----
app.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

// ---- Protected pages (from private folder) ----
app.get('/page/:pageName', auth, (req, res) => {
  const pageName = req.params.pageName;
  const allowedPages = ['cloud', 'workplace'];

  if (!allowedPages.includes(pageName)) {
    return res.status(404).send('Page not found');
  }

  res.sendFile(path.join(__dirname, 'private', `${pageName}.html`));
});

// ---- Check auth status ----
app.get('/check-auth', auth, (req, res) => {
  res.json({ authenticated: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
