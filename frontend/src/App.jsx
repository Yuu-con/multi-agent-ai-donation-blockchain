import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

function App() {
  const [dashboard, setDashboard] = useState({ campaigns: [], transactions: [], alerts: [] })
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    target_amount: '',
    wallet_address: '',
  })
  const [donationForm, setDonationForm] = useState({
    campaign_id: '',
    donor_wallet: '',
    amount: '',
    submit_onchain: false,
  })
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    const response = await fetch(`${API_BASE}/dashboard`)
    if (!response.ok) {
      throw new Error('Unable to load dashboard data')
    }
    const data = await response.json()
    setDashboard(data)
  }

  useEffect(() => {
    loadDashboard().catch((err) => setError(err.message))
  }, [])

  const submitCampaign = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch(`${API_BASE}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...campaignForm,
          target_amount: Number(campaignForm.target_amount),
        }),
      })
      if (!response.ok) throw new Error('Failed to create campaign')
      setCampaignForm({ title: '', description: '', target_amount: '', wallet_address: '' })
      await loadDashboard()
    } catch (err) {
      setError(err.message)
    }
  }

  const submitDonation = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...donationForm,
          campaign_id: Number(donationForm.campaign_id),
          amount: Number(donationForm.amount),
        }),
      })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.detail || 'Failed to record donation')
      }
      setDonationForm({ campaign_id: '', donor_wallet: '', amount: '', submit_onchain: false })
      await loadDashboard()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container">
      <h1>Multi-Agent AI Donation Blockchain</h1>
      {error && <p className="error">{error}</p>}

      <section>
        <h2>Create Campaign</h2>
        <form onSubmit={submitCampaign} className="form-grid">
          <input
            placeholder="Title"
            value={campaignForm.title}
            onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
            required
          />
          <input
            placeholder="Description"
            value={campaignForm.description}
            onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
          />
          <input
            placeholder="Target amount"
            type="number"
            min="1"
            value={campaignForm.target_amount}
            onChange={(e) => setCampaignForm({ ...campaignForm, target_amount: e.target.value })}
            required
          />
          <input
            placeholder="Campaign wallet"
            value={campaignForm.wallet_address}
            onChange={(e) => setCampaignForm({ ...campaignForm, wallet_address: e.target.value })}
            required
          />
          <button type="submit">Create campaign</button>
        </form>
      </section>

      <section>
        <h2>Add Donation</h2>
        <form onSubmit={submitDonation} className="form-grid">
          <input
            placeholder="Campaign ID"
            type="number"
            min="1"
            value={donationForm.campaign_id}
            onChange={(e) => setDonationForm({ ...donationForm, campaign_id: e.target.value })}
            required
          />
          <input
            placeholder="Donor wallet"
            value={donationForm.donor_wallet}
            onChange={(e) => setDonationForm({ ...donationForm, donor_wallet: e.target.value })}
            required
          />
          <input
            placeholder="Amount (ETH)"
            type="number"
            min="0.0001"
            step="0.0001"
            value={donationForm.amount}
            onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={donationForm.submit_onchain}
              onChange={(e) =>
                setDonationForm({ ...donationForm, submit_onchain: e.target.checked })
              }
            />
            Submit on-chain (Ganache)
          </label>
          <button type="submit">Record donation</button>
        </form>
      </section>

      <section>
        <h2>Campaigns</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Target</th>
              <th>Wallet</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>{campaign.id}</td>
                <td>{campaign.title}</td>
                <td>{campaign.target_amount}</td>
                <td>{campaign.wallet_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Transactions with AI Risk</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Campaign</th>
              <th>Donor</th>
              <th>Amount</th>
              <th>Risk</th>
              <th>Explanation</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.campaign_id}</td>
                <td>{tx.donor_wallet}</td>
                <td>{tx.amount}</td>
                <td>
                  <span className={`risk-badge ${tx.risk_level}`}>{tx.risk_level}</span> ({tx.risk_score})
                </td>
                <td>{tx.risk_explanation}</td>
                <td>{tx.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Alerts</h2>
        <ul>
          {dashboard.alerts.map((alert) => (
            <li key={alert.id}>
              <strong>{alert.level.toUpperCase()}</strong>: {alert.message}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default App
