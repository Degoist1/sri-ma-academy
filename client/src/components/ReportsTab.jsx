import { useState, useEffect } from 'react';
import api from '../api';

const emptyForm = { season: '', matches: '', rating: 3, remarks: '' };

export default function ReportsTab({ players }) {
  const [playerId, setPlayerId] = useState('');
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    if (!playerId) return setReports([]);
    api.get('/reports/player/' + playerId).then((res) => setReports(res.data));
  };
  useEffect(() => { load(); }, [playerId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (!playerId || !form.season || !form.remarks) {
      return alert('Choose a player and fill season and remarks');
    }
    await api.post('/reports', { ...form, player: playerId });
    setForm(emptyForm);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this report?')) return; // confirm popup
    await api.delete('/reports/' + id);
    load();
  };

  return (
    <div className="card p-3">
      <form className="row g-2 mb-3" onSubmit={save}>
        <div className="col-md-4">
          <select className="form-select" value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
            <option value="">Choose player...</option>
            {players.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <input className="form-control" name="season" placeholder="Season, e.g. 2026-27 Winter" value={form.season} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <input className="form-control" name="matches" type="number" placeholder="Matches" value={form.matches} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <select className="form-select" name="rating" value={form.rating} onChange={handleChange}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} / 5</option>)}
          </select>
        </div>
        <div className="col-12">
          <textarea className="form-control" name="remarks" rows="2" placeholder="Coach remarks" value={form.remarks} onChange={handleChange} />
        </div>
        <div className="col-12">
          <button className="btn btn-brand">Save report</button>
        </div>
      </form>

      {reports.map((r) => (
        <div key={r._id} className="border-top py-2 d-flex justify-content-between gap-3">
          <div>
            <strong>{r.season}</strong> <span className="text-muted small">({r.rating}/5)</span>
            <div>{r.remarks}</div>
          </div>
          <button className="btn btn-sm btn-outline-danger align-self-start" onClick={() => remove(r._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
