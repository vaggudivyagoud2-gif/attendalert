const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../middleware/auth');
const Calc = require('../public/js/calculator');

const TARGET = 75;
const SUMMARY_SQL = `
  SELECT s.id, s.name, s.roll_no AS rollNo,
         COUNT(a.id) AS total,
         COALESCE(SUM(a.status = 'present'), 0) AS attended
  FROM students s LEFT JOIN attendance a ON a.student_id = s.id`;

function withStats(row) {
  return {
    ...row,
    percentage: Number(Calc.percentage(row.attended, row.total).toFixed(1)),
    classesToRecover: Calc.classesToRecover(row.attended, row.total, TARGET),
    classesCanSkip: Calc.classesCanSkip(row.attended, row.total, TARGET),
  };
}

// Faculty/HoD: mark a whole class at once
router.post('/mark', requireRole('faculty', 'hod'), (req, res) => {
  const { date, records } = req.body || {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || Number.isNaN(Date.parse(date)))
    return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
  if (!Array.isArray(records) || records.length === 0 || records.length > 500)
    return res.status(400).json({ error: 'records must be a non-empty array' });
  for (const r of records)
    if (!Number.isInteger(r.studentId) || !['present', 'absent'].includes(r.status))
      return res.status(400).json({ error: 'Each record needs studentId and status (present/absent)' });

  const upsert = db.prepare(`
    INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)
    ON CONFLICT(student_id, date) DO UPDATE SET status = excluded.status`);
  try {
    db.transaction(() => records.forEach(r => upsert.run(r.studentId, date, r.status)))();
  } catch (e) {
    return res.status(400).json({ error: 'Unknown student in records' });
  }
  res.json({ saved: records.length });
});

// Faculty/HoD: everyone's summary
router.get('/summary', requireRole('faculty', 'hod'), (req, res) => {
  res.json(db.prepare(`${SUMMARY_SQL} GROUP BY s.id ORDER BY s.roll_no`).all().map(withStats));
});

// Student: only their own record
router.get('/me', requireRole('student'), (req, res) => {
  const row = db.prepare(`${SUMMARY_SQL} WHERE s.id = ? GROUP BY s.id`).get(req.user.studentId);
  row ? res.json(withStats(row)) : res.status(404).json({ error: 'No student record linked' });
});

module.exports = router;
