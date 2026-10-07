import { useState, useEffect } from 'react';
import api from '../api';
import { ACADEMY } from '../config';
import AttendanceTab from '../components/AttendanceTab';
import FeesTab from '../components/FeesTab';
import ReportsTab from '../components/ReportsTab';
import PlayersTab from '../components/PlayersTab';
import CoachRegister from '../components/CoachRegister';

const TABS = ['attendance', 'fees', 'reports', 'players'];

export default function Coach() {
  const [loggedIn, setLoggedIn] = useState(!!sessionStorage.getItem('coachToken'));
  const [creds, setCreds] = useState({ phone: '', password: '' });
  const [registering, setRegistering] = useState(false);
  const [players, setPlayers] = useState([]);
  const [tab, setTab] = useState('attendance');

  const logout = () => {
    sessionStorage.removeItem('coachToken');
    setLoggedIn(false);
    setPlayers([]);
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/coaches/login', creds);
      sessionStorage.setItem('coachToken', res.data.token); // api.js reads it from here
      setCreds({ phone: '', password: '' });
      setLoggedIn(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  // get all players, sorted by name (the sort uses an anonymous function)
  const loadPlayers = () =>
    api.get('/players')
      .then((res) => setPlayers(res.data.sort(function (a, b) { return a.name.localeCompare(b.name); })))
      .catch(logout);

  useEffect(() => {
    if (!loggedIn) return;
    loadPlayers();
    document.title = 'Coach | ' + ACADEMY;
    return () => { document.title = ACADEMY; };
  }, [loggedIn]);

  // ---------- login / registration screen ----------
  if (!loggedIn) {
    if (registering) return <CoachRegister onDone={() => setRegistering(false)} />;

    return (
      <form className="card p-4 mx-auto" style={{ maxWidth: 400 }} onSubmit={login}>
        <h4 className="mb-3">Coach login</h4>
        <input
          className="form-control mb-2"
          placeholder="Mobile number"
          value={creds.phone}
          onChange={(e) => setCreds({ ...creds, phone: e.target.value })}
        />
        <input
          className="form-control mb-3"
          type="password"
          placeholder="Password"
          value={creds.password}
          onChange={(e) => setCreds({ ...creds, password: e.target.value })}
        />
        <button className="btn btn-brand">Login</button>
        <button type="button" className="btn btn-link mt-2" onClick={() => setRegistering(true)}>
          New coach? Register here
        </button>
      </form>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Coach panel</h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Log out</button>
      </div>

      <ul className="nav nav-tabs mb-3">
        {TABS.map((t) => (
          <li className="nav-item" key={t}>
            <button className={'nav-link text-capitalize ' + (tab === t ? 'active' : '')} onClick={() => setTab(t)}>
              {t}
            </button>
          </li>
        ))}
      </ul>

      {/* each tab gets the player list as a prop */}
      {tab === 'attendance' && <AttendanceTab players={players} />}
      {tab === 'fees' && <FeesTab players={players} />}
      {tab === 'reports' && <ReportsTab players={players} />}
      {tab === 'players' && <PlayersTab players={players} reload={loadPlayers} />}
    </>
  );
}
