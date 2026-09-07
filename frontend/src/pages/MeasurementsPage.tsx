import { useEffect, useState, type FormEvent } from 'react'
import {
  ApiError,
  createBodyMeasurement,
  deleteBodyMeasurement,
  listBodyMeasurements,
  type BodyMeasurement,
  type BodyMeasurementCreate,
} from '../api/client'

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

const FIELDS: { key: 'waist_cm' | 'chest_cm' | 'hips_cm' | 'arm_cm' | 'thigh_cm'; label: string }[] = [
  { key: 'waist_cm', label: 'Waist (cm)' },
  { key: 'chest_cm', label: 'Chest (cm)' },
  { key: 'hips_cm', label: 'Hips (cm)' },
  { key: 'arm_cm', label: 'Arm (cm)' },
  { key: 'thigh_cm', label: 'Thigh (cm)' },
]

export default function MeasurementsPage() {
  const [entries, setEntries] = useState<BodyMeasurement[]>([])
  const [recordedAt, setRecordedAt] = useState(todayIsoDate())
  const [values, setValues] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  function refresh() {
    return listBodyMeasurements()
      .then(setEntries)
      .catch(() => setError('Failed to load measurements'))
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const payload: BodyMeasurementCreate = { recorded_at: recordedAt }
      for (const { key } of FIELDS) {
        if (values[key]) payload[key] = Number(values[key])
      }
      await createBodyMeasurement(payload)
      setValues({})
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add entry')
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteBodyMeasurement(id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete entry')
    }
  }

  return (
    <div>
      <h2>Body Measurements</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <div>
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
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          {FIELDS.map(({ key, label }) => (
            <label key={key}>
              {label}
              <br />
              <input
                type="number"
                step="0.1"
                min={0}
                value={values[key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              />
            </label>
          ))}
        </div>
        <button type="submit" style={{ marginTop: '0.75rem' }}>
          Add
        </button>
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
              {FIELDS.map(({ key, label }) => (
                <th key={key}>{label}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{entry.recorded_at}</td>
                {FIELDS.map(({ key }) => (
                  <td key={key}>{entry[key] ?? '-'}</td>
                ))}
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
