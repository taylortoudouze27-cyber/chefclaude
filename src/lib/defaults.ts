import { DAYS_OF_WEEK, type Preferences, type SkipGrid } from '../types'

function emptySkipGrid(): SkipGrid {
  return DAYS_OF_WEEK.reduce((grid, day) => {
    grid[day] = { breakfast: false, lunch: false, dinner: false }
    return grid
  }, {} as SkipGrid)
}

export function defaultPreferences(): Preferences {
  return {
    nutritionGoals: '',
    nutritionNotes: '',
    cuisines: '',
    specificRequests: '',
    store: '',
    alreadyHave: '',
    skippedMeals: emptySkipGrid(),
    targets: {
      breakfasts: 5,
      lunches: 5,
      lunchRotate: true,
      dinners: 5,
      dinnerRotate: true,
      snacks: false,
    },
    standingItems: ['Creamer or milk (for coffee/breakfast)'],
  }
}
