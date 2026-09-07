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
