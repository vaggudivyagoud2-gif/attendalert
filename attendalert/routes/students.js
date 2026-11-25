const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../middleware/auth');

router.get('/', requireRole('faculty', 'hod'), (req, res) => {
  res.json(db.prepare('SELECT id, name, roll_no AS rollNo FROM students ORDER BY roll_no').all());
});

router.post('/', requireRole('faculty', 'hod'), (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const rollNo = typeof req.body?.rollNo === 'string' ? req.body.rollNo.trim() : '';
  if (name.length < 1 || name.length > 100) return res.status(400).json({ error: 'Name must be 1-100 characters' });
  if (!/^[A-Za-z0-9-]{1,20}$/.test(rollNo)) return res.status(400).json({ error: 'Invalid roll number' });
  try {
    const info = db.prepare('INSERT INTO students (name, roll_no) VALUES (?, ?)').run(name, rollNo);
    res.status(201).json({ id: info.lastInsertRowid, name, rollNo });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'Roll number already exists' });
    throw e;
  }
});

router.delete('/:id', requireRole('hod'), (req, res) => {
  const info = db.prepare('DELETE FROM students WHERE id = ?').run(Number(req.params.id));
  info.changes ? res.status(204).end() : res.status(404).json({ error: 'Student not found' });
});

module.exports = router;
