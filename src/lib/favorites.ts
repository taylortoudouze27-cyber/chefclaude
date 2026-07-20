import type { Favorite } from '../types'

const STORAGE_KEY = 'chefclaude.favorites'

export function loadFavorites(): Favorite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Favorite[]) : []
  } catch {
    return []
  }
}

export function saveFavorites(favorites: Favorite[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    // Storage unavailable (private browsing, quota, etc.) — favorites just won't persist.
  }
}
