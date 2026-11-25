// Run once: npm run seed   (change these passwords!)
const bcrypt = require('bcryptjs');
const db = require('./db');

const stu = db.prepare('INSERT OR IGNORE INTO students (name, roll_no) VALUES (?, ?)');
stu.run('Demo Student', 'S001');
const studentId = db.prepare('SELECT id FROM students WHERE roll_no = ?').get('S001').id;

const user = db.prepare('INSERT OR IGNORE INTO users (username, password_hash, role, student_id) VALUES (?, ?, ?, ?)');
user.run('faculty1', bcrypt.hashSync('Faculty@123', 10), 'faculty', null);
user.run('hod1', bcrypt.hashSync('Hod@12345', 10), 'hod', null);
user.run('student1', bcrypt.hashSync('Student@123', 10), 'student', studentId);
console.log('Seeded: faculty1, hod1, student1');
