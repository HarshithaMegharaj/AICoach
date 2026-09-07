import { useState, type FormEvent } from 'react'
import { ApiError, login, signup, type User } from '../api/client'

interface Props {
  onSignedUp: (user: User) => void
  onSwitchToLogin: () => void
}

export default function SignupPage({ onSignedUp, onSwitchToLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signup(email, password)
      // Signup doesn't establish a session, so log in immediately after.
      const user = await login(email, password)
      onSignedUp(user)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 360 }}>
      <h1>Sign up</h1>
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
            Password (min 8 characters)
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit" disabled={submitting} style={{ marginTop: '1rem' }}>
          {submitting ? 'Signing up...' : 'Sign up'}
        </button>
      </form>
      <p>
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin}>
          Log in
        </button>
      </p>
    </div>
  )
}
