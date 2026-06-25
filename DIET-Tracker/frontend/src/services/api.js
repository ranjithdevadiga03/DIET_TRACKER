const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

function getToken() {
  return localStorage.getItem("authToken")
}

export function setToken(token) {
  localStorage.setItem("authToken", token)
}

export function clearToken() {
  localStorage.removeItem("authToken")
}

export function isLoggedIn() {
  return !!getToken()
}

async function authFetch(path, options = {}) {
  const token = getToken()
  const headers = { ...options.headers }
  if (token) headers["Authorization"] = `Bearer ${token}`
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (res.status === 401) {
    clearToken()
    throw new Error("Session expired. Please login again.")
  }
  return res
}

export async function register(username, password, weightKg) {
  const res = await authFetch("/api/register", {
    method: "POST",
    body: JSON.stringify({ username, password, weight_kg: weightKg || null }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Registration failed")
  }
  const data = await res.json()
  setToken(data.token)
  return data.user
}

export async function login(username, password) {
  const res = await authFetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Login failed")
  }
  const data = await res.json()
  setToken(data.token)
  return data.user
}

export async function getProfile() {
  const res = await authFetch("/api/profile")
  if (!res.ok) throw new Error("Failed to load profile")
  return res.json()
}

export async function updateProfile(weightKg, newPassword) {
  const body = {}
  if (weightKg !== undefined) body.weight_kg = weightKg
  if (newPassword) body.password = newPassword
  const res = await authFetch("/api/profile", {
    method: "PUT",
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error("Failed to update profile")
  return res.json()
}

export async function analyzeFood(imageBlob) {
  const formData = new FormData()
  formData.append("file", imageBlob, "food.jpg")
  const res = await authFetch("/analyze", { method: "POST", body: formData })
  if (!res.ok) throw new Error(`Server error: ${res.status}`)
  return res.json()
}

export async function logIntake(nutritionData) {
  const res = await authFetch("/api/intake/log", {
    method: "POST",
    body: JSON.stringify(nutritionData),
  })
  if (!res.ok) throw new Error("Failed to log intake")
  return res.json()
}

export async function getTodayIntake() {
  const res = await authFetch("/api/intake/today")
  if (!res.ok) throw new Error("Failed to fetch intake")
  return res.json()
}

export async function clearTodayIntake() {
  const res = await authFetch("/api/intake/clear", { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to clear intake")
  return res.json()
}

export async function getHistory() {
  const res = await authFetch("/api/intake/history")
  if (!res.ok) throw new Error("Failed to fetch history")
  return res.json()
}

export async function getDayIntake(date) {
  const res = await authFetch(`/api/intake/day/${date}`)
  if (!res.ok) throw new Error("Failed to fetch day intake")
  return res.json()
}
