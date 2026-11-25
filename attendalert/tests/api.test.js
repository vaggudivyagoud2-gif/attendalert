process.env.DB_PATH = ':memory:';
const request = require('supertest');
const bcrypt = require('bcryptjs');
const db = require('../db');
const app = require('../server');

let faculty, student;

beforeAll(async () => {
  db.prepare('INSERT INTO students (name, roll_no) VALUES (?, ?)').run('Asha', 'S1');
  const hash = bcrypt.hashSync('pass1234', 4);
  db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?,?,?)').run('fac', hash, 'faculty');
  db.prepare('INSERT INTO users (username, password_hash, role, student_id) VALUES (?,?,?,1)').run('stu', hash, 'student');
  faculty = (await request(app).post('/api/auth/login').send({ username: 'fac', password: 'pass1234' })).body.token;
  student = (await request(app).post('/api/auth/login').send({ username: 'stu', password: 'pass1234' })).body.token;
});

test('rejects wrong password', async () => {
  const r = await request(app).post('/api/auth/login').send({ username: 'fac', password: 'nope' });
  expect(r.status).toBe(401);
});
test('no token -> 401', async () => expect((await request(app).get('/api/students')).status).toBe(401));
test('student cannot list students -> 403', async () => {
  const r = await request(app).get('/api/students').set('Authorization', 'Bearer ' + student);
  expect(r.status).toBe(403);
});
test('faculty marks attendance and student sees stats', async () => {
  const mark = await request(app).post('/api/attendance/mark').set('Authorization', 'Bearer ' + faculty)
    .send({ date: '2026-11-20', records: [{ studentId: 1, status: 'present' }] });
  expect(mark.status).toBe(200);
  const me = await request(app).get('/api/attendance/me').set('Authorization', 'Bearer ' + student);
  expect(me.body.percentage).toBe(100);
});
test('invalid date rejected', async () => {
  const r = await request(app).post('/api/attendance/mark').set('Authorization', 'Bearer ' + faculty)
    .send({ date: 'bad', records: [{ studentId: 1, status: 'present' }] });
  expect(r.status).toBe(400);
});
