import { useEffect, useState, type FormEvent } from 'react'
import {
  ApiError,
  createWeightEntry,
  deleteWeightEntry,
  listWeightEntries,
  type WeightEntry,
} from '../api/client'

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function WeightHistoryPage() {
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [recordedAt, setRecordedAt] = useState(todayIsoDate())
  const [weightKg, setWeightKg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  function refresh() {
    return listWeightEntries()
      .then(setEntries)
      .catch(() => setError('Failed to load weight history'))
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createWeightEntry(recordedAt, Number(weightKg))
      setWeightKg('')
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add entry')
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteWeightEntry(id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete entry')
    }
  }

  return (
    <div>
      <h2>Weight History</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '1rem' }}
      >
        <label>
          Date
          <br />
          <input
            type="date"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            required
          />
        </label>
        <label>
          Weight (kg)
          <br />
          <input
            type="number"
            step="0.1"
            min={0}
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            required
          />
        </label>
        <button type="submit">Add</button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : entries.length === 0 ? (
        <p>No entries yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
              <th>Date</th>
              <th>Weight (kg)</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{entry.recorded_at}</td>
                <td>{entry.weight_kg}</td>
                <td>
                  <button type="button" onClick={() => handleDelete(entry.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
