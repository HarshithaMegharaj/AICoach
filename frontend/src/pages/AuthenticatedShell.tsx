import { useState } from 'react'
import { logout as apiLogout, type User } from '../api/client'
import DashboardChartsPage from './DashboardChartsPage'
import ProfilePage from './ProfilePage'
import WeightHistoryPage from './WeightHistoryPage'
import MeasurementsPage from './MeasurementsPage'
import NutritionPage from './NutritionPage'
import WorkoutsPage from './WorkoutsPage'

interface Props {
  user: User
  onLogout: () => void
}

type Tab = 'dashboard' | 'profile' | 'weight' | 'measurements' | 'nutrition' | 'workouts'

const TABS: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'profile', label: 'Profile' },
  { key: 'weight', label: 'Weight History' },
  { key: 'measurements', label: 'Measurements' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'workouts', label: 'Workouts' },
]

export default function AuthenticatedShell({ user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('dashboard')

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

      {tab === 'dashboard' && <DashboardChartsPage />}
      {tab === 'profile' && <ProfilePage />}
      {tab === 'weight' && <WeightHistoryPage />}
      {tab === 'measurements' && <MeasurementsPage />}
      {tab === 'nutrition' && <NutritionPage />}
      {tab === 'workouts' && <WorkoutsPage />}
    </div>
  )
}
