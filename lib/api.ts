// lib/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'API request failed')
  }

  return res.json()
}
