const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message = body?.detail ? JSON.stringify(body.detail) : res.statusText
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export interface User {
  id: number
  email: string
  created_at: string
}

export type FitnessGoal = 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_fitness'

export interface Profile {
  user_id: number
  height_cm: number | null
  weight_kg: number | null
  age: number | null
  fitness_goal: FitnessGoal | null
  updated_at: string
}

export interface ProfileUpdate {
  height_cm?: number
  weight_kg?: number
  age?: number
  fitness_goal?: FitnessGoal
}

export function signup(email: string, password: string): Promise<User> {
  return request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function login(email: string, password: string): Promise<User> {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function logout(): Promise<{ detail: string }> {
  return request('/auth/logout', { method: 'POST' })
}

export function getCurrentUser(): Promise<User> {
  return request('/users/me')
}

export function getProfile(): Promise<Profile> {
  return request('/users/me/profile')
}

export function updateProfile(payload: ProfileUpdate): Promise<Profile> {
  return request('/users/me/profile', { method: 'PATCH', body: JSON.stringify(payload) })
}

export interface WeightEntry {
  id: number
  recorded_at: string
  weight_kg: number
  created_at: string
}

export function listWeightEntries(): Promise<WeightEntry[]> {
  return request('/weight-entries')
}

export function createWeightEntry(recordedAt: string, weightKg: number): Promise<WeightEntry> {
  return request('/weight-entries', {
    method: 'POST',
    body: JSON.stringify({ recorded_at: recordedAt, weight_kg: weightKg }),
  })
}

export function deleteWeightEntry(id: number): Promise<void> {
  return request(`/weight-entries/${id}`, { method: 'DELETE' })
}

export interface BodyMeasurement {
  id: number
  recorded_at: string
  waist_cm: number | null
  chest_cm: number | null
  hips_cm: number | null
  arm_cm: number | null
  thigh_cm: number | null
  created_at: string
}

export interface BodyMeasurementCreate {
  recorded_at: string
  waist_cm?: number
  chest_cm?: number
  hips_cm?: number
  arm_cm?: number
  thigh_cm?: number
}

export function listBodyMeasurements(): Promise<BodyMeasurement[]> {
  return request('/body-measurements')
}

export function createBodyMeasurement(payload: BodyMeasurementCreate): Promise<BodyMeasurement> {
  return request('/body-measurements', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteBodyMeasurement(id: number): Promise<void> {
  return request(`/body-measurements/${id}`, { method: 'DELETE' })
}

export interface Food {
  id: number
  name: string
  serving_size: string
  calories_per_serving: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  created_at: string
}

export interface FoodCreate {
  name: string
  serving_size: string
  calories_per_serving: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
}

export function listFoods(): Promise<Food[]> {
  return request('/foods')
}

export function createFood(payload: FoodCreate): Promise<Food> {
  return request('/foods', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteFood(id: number): Promise<void> {
  return request(`/foods/${id}`, { method: 'DELETE' })
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface FoodLogEntry {
  id: number
  food: Food
  logged_at: string
  meal_type: MealType
  quantity: number
  calories: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  created_at: string
}

export interface FoodLogEntryCreate {
  food_id: number
  logged_at: string
  meal_type: MealType
  quantity?: number
}

export function listFoodLogEntries(loggedAt?: string): Promise<FoodLogEntry[]> {
  const query = loggedAt ? `?logged_at=${loggedAt}` : ''
  return request(`/food-log${query}`)
}

export function createFoodLogEntry(payload: FoodLogEntryCreate): Promise<FoodLogEntry> {
  return request('/food-log', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteFoodLogEntry(id: number): Promise<void> {
  return request(`/food-log/${id}`, { method: 'DELETE' })
}

export interface Exercise {
  id: number
  name: string
  category: string | null
  created_at: string
}

export interface ExerciseCreate {
  name: string
  category?: string
}

export function listExercises(): Promise<Exercise[]> {
  return request('/exercises')
}

export function createExercise(payload: ExerciseCreate): Promise<Exercise> {
  return request('/exercises', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteExercise(id: number): Promise<void> {
  return request(`/exercises/${id}`, { method: 'DELETE' })
}

export interface WorkoutLogEntry {
  id: number
  exercise: Exercise
  logged_at: string
  sets: number
  reps: number
  weight_kg: number | null
  notes: string | null
  created_at: string
}

export interface WorkoutLogEntryCreate {
  exercise_id: number
  logged_at: string
  sets: number
  reps: number
  weight_kg?: number
  notes?: string
}

export function listWorkoutLogEntries(loggedAt?: string): Promise<WorkoutLogEntry[]> {
  const query = loggedAt ? `?logged_at=${loggedAt}` : ''
  return request(`/workout-log${query}`)
}

export function createWorkoutLogEntry(payload: WorkoutLogEntryCreate): Promise<WorkoutLogEntry> {
  return request('/workout-log', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteWorkoutLogEntry(id: number): Promise<void> {
  return request(`/workout-log/${id}`, { method: 'DELETE' })
}
