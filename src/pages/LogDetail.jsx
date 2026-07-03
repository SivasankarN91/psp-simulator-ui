import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSimulation, getWebhookLogs } from '../api/api';

function LogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState(null);
  const [webhooks, setWebhooks] = useState([]);

  useEffect(() => {
    getSimulation(id).then(res => setSimulation(res.data));
    getWebhookLogs(id).then(res => setWebhooks(res.data));
  }, [id]);

  const getBadgeClass = (status) => {
    if (!status) return '';
    return `badge badge-${status.toLowerCase()}`;
  };

  if (!simulation) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      <button
        className="btn btn-secondary"
        onClick={() => navigate('/logs')}
      >
        ← Back to Logs
      </button>

      <div className="card mt-2">
        <h2>Simulation Detail</h2>
        <div className="result-box">
          <div className="result-row">
            <span className="result-label">Order ID</span>
            <span className="result-value">{simulation.orderId}</span>
          </div>
          <div className="result-row">
            <span className="result-label">PSP</span>
            <span className="result-value">{simulation.pspName}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Type</span>
            <span className="result-value">{simulation.transactionType}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Amount</span>
            <span className="result-value">
              {simulation.amount} {simulation.currency}
            </span>
          </div>
          <div className="result-row">
            <span className="result-label">Status</span>
            <span className={getBadgeClass(simulation.status)}>
              {simulation.status}
            </span>
          </div>
          <div className="result-row">
            <span className="result-label">Target URL</span>
            <span className="result-value">{simulation.targetUrl}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Created</span>
            <span className="result-value">
              {new Date(simulation.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Webhook Logs</h2>
        {webhooks.map((wh, i) => (
          <div key={wh.id}>
            <div className="result-box">
              <div className="result-row">
                <span className="result-label">Delivery Status</span>
                <span className={getBadgeClass(wh.deliveryStatus)}>
                  {wh.deliveryStatus}
                </span>
                {wh.deliveryDurationMs && (
  <div className="result-row">
    <span className="result-label">Response Time</span>
    <span className="result-value">{wh.deliveryDurationMs}ms</span>
  </div>
)}
{wh.errorReason && (
  <div className="result-row">
    <span className="result-label">Error Reason</span>
    <span className="result-value" style={{ color: "#fc8181" }}>
      {wh.errorReason}
    </span>
  </div>
)}
              </div>
              <div className="result-row">
                <span className="result-label">Response Status</span>
                <span className="result-value">{wh.responseStatus}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Delivered At</span>
                <span className="result-value">
                  {new Date(wh.deliveredAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="payload-box">
              {JSON.stringify(JSON.parse(wh.webhookPayload), null, 2)}
            </div>
          </div>
        ))}
        {webhooks.length === 0 && (
          <p className="text-muted">No webhook logs yet.</p>
        )}
      </div>
    </div>
  );
}

export default LogDetail;