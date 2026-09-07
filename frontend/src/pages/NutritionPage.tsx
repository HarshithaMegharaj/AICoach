import { useEffect, useState, type FormEvent } from 'react'
import {
  ApiError,
  createFood,
  createFoodLogEntry,
  deleteFood,
  deleteFoodLogEntry,
  listFoodLogEntries,
  listFoods,
  type Food,
  type FoodLogEntry,
  type MealType,
} from '../api/client'

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

const MEAL_OPTIONS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default function NutritionPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [foodName, setFoodName] = useState('')
  const [servingSize, setServingSize] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [foodError, setFoodError] = useState<string | null>(null)

  const [logDate, setLogDate] = useState(todayIsoDate())
  const [entries, setEntries] = useState<FoodLogEntry[]>([])
  const [selectedFoodId, setSelectedFoodId] = useState('')
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [quantity, setQuantity] = useState('1')
  const [logError, setLogError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  function refreshFoods() {
    return listFoods().then(setFoods)
  }

  function refreshEntries() {
    return listFoodLogEntries(logDate).then(setEntries)
  }

  useEffect(() => {
    Promise.all([refreshFoods(), refreshEntries()]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading) refreshEntries()
  }, [logDate])

  async function handleAddFood(e: FormEvent) {
    e.preventDefault()
    setFoodError(null)
    try {
      await createFood({
        name: foodName,
        serving_size: servingSize,
        calories_per_serving: Number(calories),
        ...(protein && { protein_g: Number(protein) }),
        ...(carbs && { carbs_g: Number(carbs) }),
        ...(fat && { fat_g: Number(fat) }),
      })
      setFoodName('')
      setServingSize('')
      setCalories('')
      setProtein('')
      setCarbs('')
      setFat('')
      await refreshFoods()
    } catch (err) {
      setFoodError(err instanceof ApiError ? err.message : 'Failed to add food')
    }
  }

  async function handleDeleteFood(id: number) {
    setFoodError(null)
    try {
      await deleteFood(id)
      await refreshFoods()
      await refreshEntries()
    } catch (err) {
      setFoodError(err instanceof ApiError ? err.message : 'Failed to delete food')
    }
  }

  async function handleAddEntry(e: FormEvent) {
    e.preventDefault()
    setLogError(null)
    try {
      await createFoodLogEntry({
        food_id: Number(selectedFoodId),
        logged_at: logDate,
        meal_type: mealType,
        quantity: Number(quantity),
      })
      setQuantity('1')
      await refreshEntries()
    } catch (err) {
      setLogError(err instanceof ApiError ? err.message : 'Failed to log entry')
    }
  }

  async function handleDeleteEntry(id: number) {
    setLogError(null)
    try {
      await deleteFoodLogEntry(id)
      await refreshEntries()
    } catch (err) {
      setLogError(err instanceof ApiError ? err.message : 'Failed to delete entry')
    }
  }

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0)

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h2>My Foods</h2>
      <form onSubmit={handleAddFood} style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label>
            Name
            <br />
            <input value={foodName} onChange={(e) => setFoodName(e.target.value)} required />
          </label>
          <label>
            Serving size
            <br />
            <input
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              placeholder="e.g. 100g"
              required
            />
          </label>
          <label>
            Calories/serving
            <br />
            <input
              type="number"
              min={0}
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              required
            />
          </label>
          <label>
            Protein (g)
            <br />
            <input type="number" min={0} value={protein} onChange={(e) => setProtein(e.target.value)} />
          </label>
          <label>
            Carbs (g)
            <br />
            <input type="number" min={0} value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          </label>
          <label>
            Fat (g)
            <br />
            <input type="number" min={0} value={fat} onChange={(e) => setFat(e.target.value)} />
          </label>
        </div>
        <button type="submit" style={{ marginTop: '0.75rem' }}>
          Add food
        </button>
      </form>
      {foodError && <p style={{ color: 'crimson' }}>{foodError}</p>}

      {foods.length === 0 ? (
        <p>No foods yet. Add one above.</p>
      ) : (
        <ul>
          {foods.map((food) => (
            <li key={food.id}>
              {food.name} ({food.serving_size}) - {food.calories_per_serving} cal
              <button type="button" onClick={() => handleDeleteFood(food.id)} style={{ marginLeft: '0.5rem' }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2>Food Diary</h2>
      <label>
        Date
        <br />
        <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
      </label>

      <form onSubmit={handleAddEntry} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', margin: '0.75rem 0' }}>
        <label>
          Food
          <br />
          <select value={selectedFoodId} onChange={(e) => setSelectedFoodId(e.target.value)} required>
            <option value="" disabled>
              -- Select --
            </option>
            {foods.map((food) => (
              <option key={food.id} value={food.id}>
                {food.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Meal
          <br />
          <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
            {MEAL_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label>
          Servings
          <br />
          <input
            type="number"
            step="0.1"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>
        <button type="submit" disabled={foods.length === 0}>
          Log it
        </button>
      </form>
      {logError && <p style={{ color: 'crimson' }}>{logError}</p>}

      {entries.length === 0 ? (
        <p>No entries for this date.</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                <th>Meal</th>
                <th>Food</th>
                <th>Servings</th>
                <th>Calories</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{entry.meal_type}</td>
                  <td>{entry.food.name}</td>
                  <td>{entry.quantity}</td>
                  <td>{entry.calories}</td>
                  <td>
                    <button type="button" onClick={() => handleDeleteEntry(entry.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>Total: {totalCalories} calories</p>
        </>
      )}
    </div>
  )
}
