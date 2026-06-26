import { useState } from 'react';
import { startSimulation, getSimulation, getWebhookLogs } from '../api/api';
import toast from 'react-hot-toast';

const PSP_OPTIONS = [
  'Razorpay', 'Stripe', 'Paymaxis',
  'Korapay', 'Praxis', 'Paymid'
];

function Home() {
  const [form, setForm] = useState({
    pspName: 'Razorpay',
    transactionType: 'DEPOSIT',
    amount: '',
    currency: 'USD',
    targetUrl: '',
    expectedStatus: 'APPROVED',
  });

  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [webhookLog, setWebhookLog] = useState(null);
  const [polling, setPolling] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const pollStatus = async (id) => {
    setPolling(true);
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await getSimulation(id);
        setSimulation(res.data);

        if (res.data.status !== 'PENDING' || attempts >= 10) {
          clearInterval(interval);
          setPolling(false);

          // Fetch webhook log
          const webhookRes = await getWebhookLogs(id);
          if (webhookRes.data.length > 0) {
            setWebhookLog(webhookRes.data[0]);
          }

          if (res.data.status === 'APPROVED') {
            toast.success('Webhook delivered successfully');
          } else if (res.data.status === 'REJECTED') {
            toast.error('Transaction rejected');
          }
        }
      } catch (err) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!form.amount || !form.targetUrl) {
      toast.error('Amount and Target URL are required');
      return;
    }

    setLoading(true);
    setSimulation(null);
    setWebhookLog(null);

    try {
      const res = await startSimulation({
        ...form,
        amount: parseFloat(form.amount),
      });
      setSimulation(res.data);
      toast('Simulation started - waiting for webhook...', { icon: '⏳' });
      pollStatus(res.data.id);
    } catch (err) {
      toast.error('Failed to start simulation');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (status) => {
    if (!status) return '';
    return `badge badge-${status.toLowerCase()}`;
  };

  return (
    <div>
      <h1 className="page-title">PSP Webhook Simulator</h1>
      <p className="text-muted">
        Simulate PSP payment flows and test your webhook endpoints
      </p>

      <div className="card mt-2">
        <h2>New Simulation</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>PSP Name</label>
            <select name="pspName" value={form.pspName} onChange={handleChange}>
              {PSP_OPTIONS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Transaction Type</label>
            <select name="transactionType" value={form.transactionType} onChange={handleChange}>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              placeholder="100.00"
              value={form.amount}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Currency</label>
            <select name="currency" value={form.currency} onChange={handleChange}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="NGN">NGN</option>
            </select>
          </div>

          <div className="form-group">
            <label>Expected Status</label>
            <select name="expectedStatus" value={form.expectedStatus} onChange={handleChange}>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target Webhook URL</label>
            <input
              type="text"
              name="targetUrl"
              placeholder="https://webhook.site/your-url"
              value={form.targetUrl}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || polling}
        >
          {loading ? (
            <><span className="spinner"></span>Starting...</>
          ) : polling ? (
            <><span className="spinner"></span>Waiting for webhook...</>
          ) : (
            '▶ Run Simulation'
          )}
        </button>
      </div>

      {simulation && (
        <div className="card">
          <h2>Simulation Result</h2>
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
              <span className="result-label">Created</span>
              <span className="result-value">
                {new Date(simulation.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {webhookLog && (
        <div className="card">
          <h2>Webhook Delivery</h2>
          <div className="result-box">
            <div className="result-row">
              <span className="result-label">Delivery Status</span>
              <span className={getBadgeClass(webhookLog.deliveryStatus)}>
                {webhookLog.deliveryStatus}
              </span>
            </div>
            <div className="result-row">
              <span className="result-label">Response Status</span>
              <span className="result-value">{webhookLog.responseStatus}</span>
            </div>
          </div>
          <div className="payload-box">
            {JSON.stringify(JSON.parse(webhookLog.webhookPayload), null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;