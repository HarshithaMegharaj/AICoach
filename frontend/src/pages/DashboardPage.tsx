import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, getProfile, updateProfile, type FitnessGoal, type Profile } from '../api/client'

const GOAL_OPTIONS: { value: FitnessGoal; label: string }[] = [
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'gain_muscle', label: 'Gain muscle' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'improve_fitness', label: 'Improve fitness' },
]

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [age, setAge] = useState('')
  const [goal, setGoal] = useState<FitnessGoal | ''>('')
  const [status, setStatus] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p)
        setHeightCm(p.height_cm?.toString() ?? '')
        setWeightKg(p.weight_kg?.toString() ?? '')
        setAge(p.age?.toString() ?? '')
        setGoal(p.fitness_goal ?? '')
      })
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 404)) {
          setStatus('Failed to load profile')
        }
      })
      .finally(() => setLoadingProfile(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus(null)
    try {
      const payload: Record<string, unknown> = {}
      if (heightCm) payload.height_cm = Number(heightCm)
      if (weightKg) payload.weight_kg = Number(weightKg)
      if (age) payload.age = Number(age)
      if (goal) payload.fitness_goal = goal

      const updated = await updateProfile(payload)
      setProfile(updated)
      setStatus('Profile saved')
    } catch (err) {
      setStatus(err instanceof ApiError ? err.message : 'Failed to save profile')
    }
  }

  return (
    <div>
      <h2>Profile</h2>
      {loadingProfile ? (
        <p>Loading profile...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Height (cm)
              <br />
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                min={0}
                step="0.1"
              />
            </label>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label>
              Weight (kg)
              <br />
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                min={0}
                step="0.1"
              />
            </label>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label>
              Age
              <br />
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} min={0} />
            </label>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label>
              Fitness goal
              <br />
              <select value={goal} onChange={(e) => setGoal(e.target.value as FitnessGoal)}>
                <option value="">-- Select --</option>
                {GOAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {status && <p>{status}</p>}
          <button type="submit" style={{ marginTop: '1rem' }}>
            Save profile
          </button>
        </form>
      )}

      {profile && (
        <p style={{ fontSize: '0.85em', color: '#666' }}>
          Last updated: {new Date(profile.updated_at).toLocaleString()}
        </p>
      )}
    </div>
  )
}
