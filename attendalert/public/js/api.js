// Replaces LocalStorage calls in your script.js
const API = {
  async request(path, options = {}) {
    const token = sessionStorage.getItem('token');
    const res = await fetch('/api' + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (res.status === 401 && token) { sessionStorage.clear(); location.href = 'login.html'; return; }
    const data = res.status === 204 ? null : await res.json();
    if (!res.ok) throw new Error(data?.error || 'Request failed');
    return data;
  },
  async login(username, password) {
    const d = await this.request('/auth/login', { method: 'POST', body: { username, password } });
    sessionStorage.setItem('token', d.token);
    sessionStorage.setItem('role', d.role);
    return d;
  },
  students: () => API.request('/students'),
  addStudent: (name, rollNo) => API.request('/students', { method: 'POST', body: { name, rollNo } }),
  deleteStudent: id => API.request('/students/' + id, { method: 'DELETE' }),
  markAttendance: (date, records) => API.request('/attendance/mark', { method: 'POST', body: { date, records } }),
  summary: () => API.request('/attendance/summary'),
  mine: () => API.request('/attendance/me'),
};
