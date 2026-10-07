import { useState, useEffect } from 'react';
import api from '../api';
import { today } from '../helpers';

export default function AttendanceTab({ players }) {
  const [date, setDate] = useState(today());
  const [present, setPresent] = useState({}); // { playerId: true / false }

    // lifecycle demo: open the browser console (Cmd+Option+C) to watch these lines
  useEffect(() => {
    console.log('AttendanceTab: mounted');
    return () => console.log('AttendanceTab: unmounted');  // cleanup runs when the tab is closed
  }, []);                                                   // [] = only once, when the component appears

  useEffect(() => {
    console.log('AttendanceTab: date is now', date);       // runs on mount and whenever date changes
  }, [date]);
  
  const markAll = () => setPresent(Object.fromEntries(players.map((p) => [p._id, true])));

  const save = async () => {
    const records = players.map((p) => ({ player: p._id, present: !!present[p._id] }));
    await api.post('/attendance', { date, records });
    alert('Attendance saved for ' + date);
  };

  return (
    <div className="card p-3">
      <div className="d-flex flex-wrap gap-2 mb-3">
        <input type="date" className="form-control w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="btn btn-outline-secondary" onClick={markAll}>Mark all present</button>
        <button className="btn btn-brand ms-auto" onClick={save}>Save attendance</button>
      </div>

      <table className="table align-middle mb-0">
        <tbody>
          {players.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td className="text-muted">{p.batch}</td>
              <td className="text-end">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={!!present[p._id]}
                  onChange={(e) => setPresent({ ...present, [p._id]: e.target.checked })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
