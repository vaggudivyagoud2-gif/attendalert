const express = require('express');
const helmet = require('helmet');
const path = require('path');
const { authenticate } = require('./middleware/auth');

const app = express();
app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', authenticate, require('./routes/students'));
app.use('/api/attendance', authenticate, require('./routes/attendance'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`AttendAlert running on http://localhost:${port}`));
}
module.exports = app;
