// The skip grid only covers the workweek — meal prep here is about
// getting Mon-Fri covered, weekends are assumed to be more freeform.
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const

export type Weekday = (typeof WEEKDAYS)[number]
export type MealType = 'breakfast' | 'lunch' | 'dinner'

export type SkipGrid = Record<Weekday, Record<MealType, boolean>>

export const STORE_OPTIONS = [
  "Trader Joe's",
  'Whole Foods',
  'Costco',
  'Target',
  'Walmart',
  'Kroger / local grocery',
  'other',
] as const

export interface Favorite {
  id: string
  name: string
  starred: boolean
  include: boolean
}

export interface Preferences {
  goals: string[]
  focusNotes: string
  cuisines: string[]
  cravings: string
  avoid: string
  favorites: Favorite[]
  store: string
  storeOther: string
  onhand: string
  skippedMeals: SkipGrid
  eatOutNotes: string
  standingItems: string[]
}

export interface BreakfastPlan {
  name: string
  description: string
  protein: string
  days: string[]
}

export interface LunchOption {
  name: string
  description: string
  protein: string
  option: string
}

export interface DinnerOption {
  name: string
  description: string
  protein: string
}

export interface MealPlan {
  breakfast: BreakfastPlan
  lunches: LunchOption[]
  dinners: DinnerOption[]
  snacks: string[]
}

export type Step = 1 | 2 | 3
