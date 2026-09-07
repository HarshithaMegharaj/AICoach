import { useState, type FormEvent } from 'react'
import { ApiError, login, type User } from '../api/client'

interface Props {
  onLoggedIn: (user: User) => void
  onSwitchToSignup: () => void
}

export default function LoginPage({ onLoggedIn, onSwitchToSignup }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await login(email, password)
      onLoggedIn(user)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 360 }}>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Email
            <br />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <label>
            Password
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit" disabled={submitting} style={{ marginTop: '1rem' }}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p>
        No account?{' '}
        <button type="button" onClick={onSwitchToSignup}>
          Sign up
        </button>
      </p>
    </div>
  )
}
