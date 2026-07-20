import { WEEKDAYS, type Preferences, type SkipGrid } from '../types'

export const GOAL_OPTIONS = [
  'high protein',
  'high fiber',
  'iron rich',
  'hydrating',
  'budget friendly',
  'easy prep & cleanup',
  'veggie forward',
  'balanced macros',
] as const

export const CUISINE_OPTIONS = [
  { value: 'Mediterranean', label: 'Mediterranean' },
  { value: 'Mexican / Tex-Mex', label: 'Mexican' },
  { value: 'Asian-inspired', label: 'Asian-inspired' },
  { value: 'American / comfort', label: 'Comfort food' },
  { value: 'Middle Eastern', label: 'Middle Eastern' },
  { value: 'Italian', label: 'Italian' },
  { value: 'light and fresh', label: 'Light & fresh' },
  { value: 'hearty and warm', label: 'Hearty & warm' },
]

function emptySkipGrid(): SkipGrid {
  return WEEKDAYS.reduce((grid, day) => {
    grid[day] = { breakfast: false, lunch: false, dinner: false }
    return grid
  }, {} as SkipGrid)
}

export function defaultPreferences(): Preferences {
  return {
    goals: ['high protein'],
    focusNotes: '',
    cuisines: [],
    cravings: '',
    avoid: '',
    favorites: [],
    store: "Trader Joe's",
    storeOther: '',
    onhand: '',
    skippedMeals: emptySkipGrid(),
    eatOutNotes: '',
    standingItems: ['Creamer or milk (for coffee/breakfast)'],
  }
}
