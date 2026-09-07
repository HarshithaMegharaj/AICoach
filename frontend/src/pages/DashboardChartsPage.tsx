import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { listFoodLogEntries, listWeightEntries, listWorkoutLogEntries } from '../api/client'
import { CHART_COLORS } from '../charts/theme'

interface DatedPoint {
  date: string
  value: number
}

function aggregateByDate<T>(
  items: T[],
  getDate: (item: T) => string,
  getValue: (item: T) => number,
): DatedPoint[] {
  const totals = new Map<string, number>()
  for (const item of items) {
    const date = getDate(item)
    totals.set(date, (totals.get(date) ?? 0) + getValue(item))
  }
  return Array.from(totals.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

const axisTick = { fill: CHART_COLORS.mutedText, fontSize: 12 }
const axisLine = { stroke: CHART_COLORS.axis }

export default function DashboardChartsPage() {
  const [weightPoints, setWeightPoints] = useState<DatedPoint[]>([])
  const [caloriePoints, setCaloriePoints] = useState<DatedPoint[]>([])
  const [setsPoints, setSetsPoints] = useState<DatedPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listWeightEntries(), listFoodLogEntries(), listWorkoutLogEntries()])
      .then(([weightEntries, foodEntries, workoutEntries]) => {
        setWeightPoints(
          [...weightEntries]
            .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
            .map((e) => ({ date: e.recorded_at, value: e.weight_kg })),
        )
        setCaloriePoints(aggregateByDate(foodEntries, (e) => e.logged_at, (e) => e.calories))
        setSetsPoints(aggregateByDate(workoutEntries, (e) => e.logged_at, (e) => e.sets))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h2>Weight Trend</h2>
      {weightPoints.length === 0 ? (
        <p>No weight entries yet. Log your first one in Weight History.</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={weightPoints}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="date" tick={axisTick} axisLine={axisLine} tickLine={false} />
            <YAxis tick={axisTick} axisLine={axisLine} tickLine={false} width={40} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke={CHART_COLORS.series}
              strokeWidth={2}
              dot={{ r: 4, fill: CHART_COLORS.series }}
              activeDot={{ r: 5 }}
              name="Weight (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <h2>Daily Calories</h2>
      {caloriePoints.length === 0 ? (
        <p>No food log entries yet. Log a meal in Nutrition.</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={caloriePoints}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="date" tick={axisTick} axisLine={axisLine} tickLine={false} />
            <YAxis tick={axisTick} axisLine={axisLine} tickLine={false} width={40} />
            <Tooltip />
            <Bar dataKey="value" fill={CHART_COLORS.series} radius={[4, 4, 0, 0]} name="Calories" />
          </BarChart>
        </ResponsiveContainer>
      )}

      <h2>Sets Logged Per Day</h2>
      {setsPoints.length === 0 ? (
        <p>No workouts logged yet. Log one in Workouts.</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={setsPoints}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="date" tick={axisTick} axisLine={axisLine} tickLine={false} />
            <YAxis tick={axisTick} axisLine={axisLine} tickLine={false} width={40} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill={CHART_COLORS.series} radius={[4, 4, 0, 0]} name="Sets" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
