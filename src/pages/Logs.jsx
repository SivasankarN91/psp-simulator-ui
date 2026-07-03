import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSimulations, getWebhookLogs } from '../api/api';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [webhookStatuses, setWebhookStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllSimulations()
      .then(async (res) => {
        const simulations = res.data;
        setLogs(simulations);

        // Fetch webhook status for each simulation
        const statuses = {};
        await Promise.all(
          simulations.map(async (sim) => {
            try {
              const wh = await getWebhookLogs(sim.id);
              if (wh.data.length > 0) {
                const latest = wh.data[wh.data.length - 1];
                statuses[sim.id] = {
                  deliveryStatus: latest.deliveryStatus,
                  errorReason: latest.errorReason,
                  responseStatus: latest.responseStatus,
                };
              }
            } catch (err) {
              // ignore
            }
          })
        );
        setWebhookStatuses(statuses);
      })
      .finally(() => setLoading(false));
  }, []);

  const getBadgeClass = (status) => {
    if (!status) return 'badge';
    return `badge badge-${status.toLowerCase()}`;
  };

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
                <th>Sim Status</th>
                <th>Webhook</th>
                <th>HTTP</th>
                <th>Created</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const wh = webhookStatuses[log.id];
                return (
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
                    <td>
                      {wh ? (
                        <span className={getBadgeClass(wh.deliveryStatus)}>
                          {wh.deliveryStatus}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {wh?.responseStatus || (
                        <span className="text-muted">—</span>
                      )}
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
                );
              })}
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