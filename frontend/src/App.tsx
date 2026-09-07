import { useEffect, useState } from 'react'
import { getCurrentUser, type User } from './api/client'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'

type View = 'loading' | 'login' | 'signup' | 'dashboard'

function App() {
  const [view, setView] = useState<View>('loading')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        setUser(u)
        setView('dashboard')
      })
      .catch(() => setView('login'))
  }, [])

  function handleAuthenticated(u: User) {
    setUser(u)
    setView('dashboard')
  }

  function handleLogout() {
    setUser(null)
    setView('login')
  }

  if (view === 'loading') return <p style={{ padding: '2rem' }}>Loading...</p>

  if (view === 'signup') {
    return <SignupPage onSignedUp={handleAuthenticated} onSwitchToLogin={() => setView('login')} />
  }

  if (view === 'dashboard' && user) {
    return <DashboardPage user={user} onLogout={handleLogout} />
  }

  return <LoginPage onLoggedIn={handleAuthenticated} onSwitchToSignup={() => setView('signup')} />
}

export default App
