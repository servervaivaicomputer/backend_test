const auth = (req, res, next) => {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ authenticated: false, message: 'Not logged in' });
  }

  // Simple validation (token exists = logged in)
  // For stronger check, decode and verify token structure
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [username] = decoded.split(':');
    req.user = username;
    next();
  } catch {
    return res.status(401).json({ authenticated: false, message: 'Invalid token' });
  }
};

module.exports = auth;
