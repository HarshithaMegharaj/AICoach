import { useState } from 'react'
import { logout as apiLogout, type User } from '../api/client'
import DashboardPage from './DashboardPage'
import WeightHistoryPage from './WeightHistoryPage'

interface Props {
  user: User
  onLogout: () => void
}

type Tab = 'profile' | 'weight'

export default function AuthenticatedShell({ user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('profile')

  async function handleLogout() {
    await apiLogout().catch(() => {})
    onLogout()
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 480 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>AICoach</h1>
        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
      <p>Logged in as {user.email}</p>

      <nav style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => setTab('profile')}
          style={{ fontWeight: tab === 'profile' ? 'bold' : 'normal' }}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => setTab('weight')}
          style={{ fontWeight: tab === 'weight' ? 'bold' : 'normal' }}
        >
          Weight History
        </button>
      </nav>

      {tab === 'profile' ? <DashboardPage /> : <WeightHistoryPage />}
    </div>
  )
}
