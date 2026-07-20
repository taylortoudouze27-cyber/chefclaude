export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]
export type MealType = 'breakfast' | 'lunch' | 'dinner'

export type SkipGrid = Record<DayOfWeek, Record<MealType, boolean>>

export interface MealTargets {
  breakfasts: number
  lunches: number
  lunchRotate: boolean
  dinners: number
  dinnerRotate: boolean
  snacks: boolean
}

export interface Preferences {
  nutritionGoals: string
  nutritionNotes: string
  cuisines: string
  specificRequests: string
  store: string
  alreadyHave: string
  skippedMeals: SkipGrid
  targets: MealTargets
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

export type GroceryCategory = 'Produce' | 'Protein' | 'Dairy' | 'Pantry' | 'Frozen' | string

export type GroceryList = Record<GroceryCategory, string[]>

export interface MealScheduleEntry {
  meal: string
  days: string[]
}

export interface MealSchedule {
  Breakfast: MealScheduleEntry
  Lunch: MealScheduleEntry[]
  Dinner: MealScheduleEntry[]
}

export interface GroceryPrepPlan {
  groceryList: GroceryList
  prepSteps: string[]
  mealSchedule: MealSchedule
}

export type Step = 1 | 2 | 3
