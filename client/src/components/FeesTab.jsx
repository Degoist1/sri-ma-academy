import { useState, useEffect } from 'react';
import api from '../api';
import { lastMonths } from '../helpers';

export default function FeesTab({ players }) {
  const [month, setMonth] = useState(lastMonths(1)[0]); // this month
  const [fees, setFees] = useState([]);

  const load = () => api.get('/fees', { params: { month } }).then((res) => setFees(res.data));
  useEffect(() => { load(); }, [month]);

  const isPaid = (p) => fees.some((f) => f.player === p._id && f.paid);

  const setPaid = async (p, paid) => {
    let mode = 'cash';
    // prompt popup asks how the fee was paid
    if (paid) mode = prompt('Payment mode (cash / upi)?', 'cash') || 'cash';
    await api.put('/fees', { player: p._id, month, amount: p.monthlyFee, paid, mode });
    load();
  };

  // totals for the little summary line
  const collected = fees.filter((f) => f.paid).reduce((sum, f) => sum + f.amount, 0);
  const expected = players.reduce((sum, p) => sum + p.monthlyFee, 0);

  return (
    <div className="card p-3">
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <input type="month" className="form-control w-auto" value={month} onChange={(e) => setMonth(e.target.value)} />
        <span>Collected Rs. {collected} of Rs. {expected}</span>
      </div>

      <table className="table align-middle mb-0">
        <tbody>
          {players.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>Rs. {p.monthlyFee}</td>
              <td className="text-end">
                {isPaid(p)
                  ? <button className="btn btn-sm btn-outline-secondary" onClick={() => setPaid(p, false)}>Undo paid</button>
                  : <button className="btn btn-sm btn-brand" onClick={() => setPaid(p, true)}>Mark paid</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
