import { useState, useEffect } from 'react';
import api from '../api';
import { ACADEMY } from '../config';
import { lastMonths } from '../helpers';

export default function Player() {
  const [phone, setPhone] = useState('');
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [reports, setReports] = useState([]);

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get('/players/phone/' + phone);
      setPlayer(res.data);
      setError('');
    } catch {
      setError('No player found with this number');
    }
  };

  // runs after a player logs in: load attendance, fees and reports together
  useEffect(() => {
    if (!player) return;
    document.title = player.name + ' | ' + ACADEMY;

    Promise.all([
      api.get('/attendance/player/' + player._id),
      api.get('/fees/player/' + player._id),
      api.get('/reports/player/' + player._id),
    ]).then(([a, f, r]) => {
      setAttendance(a.data);
      setFees(f.data);
      setReports(r.data);
    });

    // cleanup: runs when the player logs out or leaves the page
    return () => { document.title = ACADEMY; };
  }, [player]);

  // ---------- login screen ----------
  if (!player) {
    return (
      <form className="card p-4 mx-auto" style={{ maxWidth: 400 }} onSubmit={login}>
        <h4 className="mb-3">Player login</h4>
        <input
          className="form-control mb-2"
          placeholder="Registered mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {error && <div className="text-danger small mb-2">{error}</div>}
        <button className="btn btn-brand">Open my page</button>
      </form>
    );
  }

  // ---------- numbers for the attendance card ----------
  const presentDays = attendance.filter((a) => a.present).length;
  const percent = attendance.length ? Math.round((presentDays * 100) / attendance.length) : 0;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0">{player.name}</h4>
          <span className="text-muted">{player.batch}</span>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setPlayer(null)}>Log out</button>
      </div>

      <div className="row g-3">
        {/* attendance */}
        <div className="col-md-6">
          <div className="card p-3 h-100">
            <h5>Attendance</h5>
            <p className="mb-2">{presentDays} of {attendance.length} days present ({percent}%)</p>
            <div className="d-flex flex-wrap gap-1">
              {attendance.slice(0, 10).map((a) => (
                <span key={a._id} className={'badge ' + (a.present ? 'bg-success' : 'bg-secondary')}>
                  {a.date.slice(5)} {a.present ? 'P' : 'A'}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* fees: last 6 months, a month with no record counts as due */}
        <div className="col-md-6">
          <div className="card p-3 h-100">
            <h5>Monthly fee (Rs. {player.monthlyFee})</h5>
            <table className="table table-sm mb-0">
              <tbody>
                {lastMonths().map((m) => {
                  const fee = fees.find((f) => f.month === m);
                  return (
                    <tr key={m}>
                      <td>{m}</td>
                      <td className="text-end">
                        {fee?.paid
                          ? <span className="badge bg-success">Paid ({fee.mode})</span>
                          : <span className="badge bg-warning text-dark">Due</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* season reports written by the coach */}
        <div className="col-12">
          <div className="card p-3">
            <h5>Season reports</h5>
            {reports.length === 0 && <p className="text-muted mb-0">No report yet.</p>}
            {reports.map((r) => (
              <div key={r._id} className="border-top py-2">
                <strong>{r.season}</strong>
                <div className="small text-muted">Matches: {r.matches || 0}, rating: {r.rating}/5</div>
                <div>{r.remarks}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
