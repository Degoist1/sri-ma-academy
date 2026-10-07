import { useState, useEffect } from 'react';
import api from '../api';
import { ACADEMY } from '../config';

const when = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
const BADGE = { pending: 'bg-warning text-dark', approved: 'bg-success', rejected: 'bg-secondary' };

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(!!sessionStorage.getItem('adminToken'));
  const [form, setForm] = useState({ username: '', password: '' });
  const [tab, setTab] = useState('coaches');
  const [coaches, setCoaches] = useState([]);
  const [logs, setLogs] = useState([]);
  const [role, setRole] = useState(''); // log filter: '' = everyone

  const logout = () => {
    sessionStorage.removeItem('adminToken');
    setLoggedIn(false);
    setCoaches([]);
    setLogs([]);
  };

  // an expired or invalid token sends the admin back to the login box
  const onError = (err) => { if (err.response?.status === 401) logout(); };

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/login', form);
      sessionStorage.setItem('adminToken', res.data.token);
      setForm({ username: '', password: '' });
      setLoggedIn(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  const loadCoaches = () => api.get('/admin/coaches').then((res) => setCoaches(res.data)).catch(onError);
  const loadLogs = () => api.get('/admin/logs', { params: { role } }).then((res) => setLogs(res.data)).catch(onError);

  useEffect(() => {
    if (!loggedIn) return;
    loadCoaches();
    document.title = 'Admin | ' + ACADEMY;
    return () => { document.title = ACADEMY; };
  }, [loggedIn]);

  useEffect(() => { if (loggedIn) loadLogs(); }, [loggedIn, role]);

  const setStatus = async (c, status) => {
    if (!confirm(`Mark ${c.name} as ${status}?`)) return;
    await api.put('/admin/coaches/' + c._id, { status });
    loadCoaches();
    loadLogs();
  };

  // ---------- login screen ----------
  if (!loggedIn) {
    return (
      <form className="card p-4 mx-auto" style={{ maxWidth: 400 }} onSubmit={login} autoComplete="off">
        <h4 className="mb-3">Admin login</h4>
        <input
          className="form-control mb-2"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          className="form-control mb-3"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn btn-brand">Login</button>
      </form>
    );
  }

  const pending = coaches.filter((c) => c.status === 'pending').length;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Admin panel</h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Log out</button>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={'nav-link ' + (tab === 'coaches' ? 'active' : '')} onClick={() => setTab('coaches')}>
            Coach requests {pending > 0 && <span className="badge bg-warning text-dark">{pending}</span>}
          </button>
        </li>
        <li className="nav-item">
          <button className={'nav-link ' + (tab === 'logs' ? 'active' : '')} onClick={() => setTab('logs')}>
            Activity log
          </button>
        </li>
      </ul>

      {/* ---------- coach registrations ---------- */}
      {tab === 'coaches' && (
        <div className="card p-3 table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Registered</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {coaches.length === 0 && <tr><td colSpan="5" className="text-muted">No coach has registered yet.</td></tr>}
              {coaches.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{when(c.createdAt)}</td>
                  <td><span className={'badge ' + BADGE[c.status]}>{c.status}</span></td>
                  <td className="text-end text-nowrap">
                    {c.status !== 'approved' && (
                      <button className="btn btn-sm btn-brand me-1" onClick={() => setStatus(c, 'approved')}>Approve</button>
                    )}
                    {c.status !== 'rejected' && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setStatus(c, 'rejected')}>Reject</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- every login and data entry ---------- */}
      {tab === 'logs' && (
        <div className="card p-3">
          <div className="d-flex gap-2 mb-3">
            <select className="form-select w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Everyone</option>
              <option value="player">Players</option>
              <option value="coach">Coaches</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn btn-outline-secondary" onClick={loadLogs}>Refresh</button>
          </div>

          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr><th>Time</th><th>Who</th><th>Action</th><th>Details</th><th>IP</th></tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l._id} className={l.action.includes('failed') ? 'table-danger' : ''}>
                    <td className="text-nowrap">{when(l.createdAt)}</td>
                    <td>{l.who} <span className="text-muted small">({l.role})</span></td>
                    <td>{l.action.replace(/_/g, ' ')}</td>
                    <td>{l.detail}</td>
                    <td className="small text-muted">{l.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
