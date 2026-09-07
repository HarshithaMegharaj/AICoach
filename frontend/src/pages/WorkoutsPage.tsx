import { useEffect, useState, type FormEvent } from 'react'
import {
  ApiError,
  createExercise,
  createWorkoutLogEntry,
  deleteExercise,
  deleteWorkoutLogEntry,
  listExercises,
  listWorkoutLogEntries,
  type Exercise,
  type WorkoutLogEntry,
} from '../api/client'

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function WorkoutsPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [exerciseName, setExerciseName] = useState('')
  const [category, setCategory] = useState('')
  const [exerciseError, setExerciseError] = useState<string | null>(null)

  const [logDate, setLogDate] = useState(todayIsoDate())
  const [entries, setEntries] = useState<WorkoutLogEntry[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [weightKg, setWeightKg] = useState('')
  const [notes, setNotes] = useState('')
  const [logError, setLogError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  function refreshExercises() {
    return listExercises().then(setExercises)
  }

  function refreshEntries() {
    return listWorkoutLogEntries(logDate).then(setEntries)
  }

  useEffect(() => {
    Promise.all([refreshExercises(), refreshEntries()]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading) refreshEntries()
  }, [logDate])

  async function handleAddExercise(e: FormEvent) {
    e.preventDefault()
    setExerciseError(null)
    try {
      await createExercise({
        name: exerciseName,
        ...(category && { category }),
      })
      setExerciseName('')
      setCategory('')
      await refreshExercises()
    } catch (err) {
      setExerciseError(err instanceof ApiError ? err.message : 'Failed to add exercise')
    }
  }

  async function handleDeleteExercise(id: number) {
    setExerciseError(null)
    try {
      await deleteExercise(id)
      await refreshExercises()
      await refreshEntries()
    } catch (err) {
      setExerciseError(err instanceof ApiError ? err.message : 'Failed to delete exercise')
    }
  }

  async function handleAddEntry(e: FormEvent) {
    e.preventDefault()
    setLogError(null)
    try {
      await createWorkoutLogEntry({
        exercise_id: Number(selectedExerciseId),
        logged_at: logDate,
        sets: Number(sets),
        reps: Number(reps),
        ...(weightKg && { weight_kg: Number(weightKg) }),
        ...(notes && { notes }),
      })
      setNotes('')
      await refreshEntries()
    } catch (err) {
      setLogError(err instanceof ApiError ? err.message : 'Failed to log entry')
    }
  }

  async function handleDeleteEntry(id: number) {
    setLogError(null)
    try {
      await deleteWorkoutLogEntry(id)
      await refreshEntries()
    } catch (err) {
      setLogError(err instanceof ApiError ? err.message : 'Failed to delete entry')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h2>My Exercises</h2>
      <form onSubmit={handleAddExercise} style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label>
            Name
            <br />
            <input value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} required />
          </label>
          <label>
            Category (optional)
            <br />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. chest" />
          </label>
        </div>
        <button type="submit" style={{ marginTop: '0.75rem' }}>
          Add exercise
        </button>
      </form>
      {exerciseError && <p style={{ color: 'crimson' }}>{exerciseError}</p>}

      {exercises.length === 0 ? (
        <p>No exercises yet. Add one above.</p>
      ) : (
        <ul>
          {exercises.map((exercise) => (
            <li key={exercise.id}>
              {exercise.name}
              {exercise.category ? ` (${exercise.category})` : ''}
              <button
                type="button"
                onClick={() => handleDeleteExercise(exercise.id)}
                style={{ marginLeft: '0.5rem' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2>Workout Log</h2>
      <label>
        Date
        <br />
        <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
      </label>

      <form
        onSubmit={handleAddEntry}
        style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap', margin: '0.75rem 0' }}
      >
        <label>
          Exercise
          <br />
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            required
          >
            <option value="" disabled>
              -- Select --
            </option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sets
          <br />
          <input type="number" min={1} value={sets} onChange={(e) => setSets(e.target.value)} />
        </label>
        <label>
          Reps
          <br />
          <input type="number" min={1} value={reps} onChange={(e) => setReps(e.target.value)} />
        </label>
        <label>
          Weight (kg, optional)
          <br />
          <input
            type="number"
            min={0}
            step="0.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </label>
        <label>
          Notes (optional)
          <br />
          <input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <button type="submit" disabled={exercises.length === 0}>
          Log it
        </button>
      </form>
      {logError && <p style={{ color: 'crimson' }}>{logError}</p>}

      {entries.length === 0 ? (
        <p>No entries for this date.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
              <th>Exercise</th>
              <th>Sets</th>
              <th>Reps</th>
              <th>Weight (kg)</th>
              <th>Notes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{entry.exercise.name}</td>
                <td>{entry.sets}</td>
                <td>{entry.reps}</td>
                <td>{entry.weight_kg ?? '-'}</td>
                <td>{entry.notes ?? '-'}</td>
                <td>
                  <button type="button" onClick={() => handleDeleteEntry(entry.id)}>
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
