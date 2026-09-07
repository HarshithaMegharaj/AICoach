import { useState } from 'react'
import { logout as apiLogout, type User } from '../api/client'
import DashboardPage from './DashboardPage'
import WeightHistoryPage from './WeightHistoryPage'
import MeasurementsPage from './MeasurementsPage'
import NutritionPage from './NutritionPage'

interface Props {
  user: User
  onLogout: () => void
}

type Tab = 'profile' | 'weight' | 'measurements' | 'nutrition'

const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'weight', label: 'Weight History' },
  { key: 'measurements', label: 'Measurements' },
  { key: 'nutrition', label: 'Nutrition' },
]

export default function AuthenticatedShell({ user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('profile')

  async function handleLogout() {
    await apiLogout().catch(() => {})
    onLogout()
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>AICoach</h1>
        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
      <p>Logged in as {user.email}</p>

      <nav style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{ fontWeight: tab === key ? 'bold' : 'normal' }}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'profile' && <DashboardPage />}
      {tab === 'weight' && <WeightHistoryPage />}
      {tab === 'measurements' && <MeasurementsPage />}
      {tab === 'nutrition' && <NutritionPage />}
    </div>
  )
}
