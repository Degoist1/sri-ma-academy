import api from '../api';

export default function PlayersTab({ players, reload }) {
  // update: change the monthly fee
  const changeFee = async (p) => {
    const fee = prompt('New monthly fee for ' + p.name, p.monthlyFee);
    if (!fee) return;
    await api.put('/players/' + p._id, { monthlyFee: Number(fee) });
    reload();
  };

  // delete: also removes the player's attendance, fees and reports on the server
  const remove = async (p) => {
    if (!confirm('Remove ' + p.name + ' and all their records?')) return;
    await api.delete('/players/' + p._id);
    reload();
  };

  return (
    <div className="card p-3 table-responsive">
      <table className="table align-middle mb-0">
        <thead>
          <tr><th>Name</th><th>Phone</th><th>Batch</th><th>Fee</th><th></th></tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.phone}</td>
              <td>{p.batch}</td>
              <td>Rs. {p.monthlyFee}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => changeFee(p)}>Change fee</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
