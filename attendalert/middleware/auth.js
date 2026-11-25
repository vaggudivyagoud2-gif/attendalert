const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'dev-only-change-me';

function sign(user) {
  return jwt.sign(
    { id: user.id, role: user.role, studentId: user.student_id || null },
    SECRET,
    { expiresIn: '8h' }
  );
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Login required' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ error: 'Access denied for your role' });

module.exports = { sign, authenticate, requireRole };
