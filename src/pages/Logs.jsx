import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSimulations } from '../api/api';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllSimulations()
      .then(res => setLogs(res.data))
      .finally(() => setLoading(false));
  }, []);

  const getBadgeClass = (status) => `badge badge-${status.toLowerCase()}`;

  if (loading) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="page-title">Simulation Logs</h1>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>PSP</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{log.orderId}</td>
                  <td>{log.pspName}</td>
                  <td>{log.transactionType}</td>
                  <td>{log.amount} {log.currency}</td>
                  <td>
                    <span className={getBadgeClass(log.status)}>
                      {log.status}
                    </span>
                  </td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>
                    <span
                      className="link"
                      onClick={() => navigate(`/logs/${log.id}`)}
                    >
                      View
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <p className="text-muted mt-2">No simulations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Logs;