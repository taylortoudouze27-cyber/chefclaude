import { WEEKDAYS } from '../types'
import type { GroceryPrepPlan, MealPlan, Preferences } from '../types'

export const MEAL_PLAN_SYSTEM_PROMPT =
  'You are a meal planning assistant. Return ONLY a JSON object — no markdown, no preamble. ' +
  'Never repeat the same protein source in back-to-back meals.'

export function resolveStore(prefs: Preferences): string {
  return prefs.store === 'other' && prefs.storeOther.trim() ? prefs.storeOther.trim() : prefs.store
}

function mealCounts(prefs: Preferences): { breakfasts: number; lunches: number; dinners: number } {
  const counts = { breakfasts: 5, lunches: 5, dinners: 5 }
  for (const day of WEEKDAYS) {
    const skip = prefs.skippedMeals[day]
    if (skip.breakfast) counts.breakfasts--
    if (skip.lunch) counts.lunches--
    if (skip.dinner) counts.dinners--
  }
  return counts
}

function skippedList(prefs: Preferences): string {
  const skipped = WEEKDAYS.flatMap((day) => {
    const skip = prefs.skippedMeals[day]
    return (['breakfast', 'lunch', 'dinner'] as const).filter((meal) => skip[meal]).map((meal) => `${day} ${meal}`)
  })
  return skipped.join(', ') || 'none'
}

export function buildMealPlanUserPrompt(prefs: Preferences): string {
  const counts = mealCounts(prefs)
  const favoritesToInclude = prefs.favorites.filter((f) => f.include).map((f) => f.name)

  const lines: string[] = []
  lines.push('Generate a weekly meal plan as JSON with this exact shape:')
  lines.push(`{
  "breakfast": { "name": string, "description": string, "protein": string, "days": string[] },
  "lunches": [{ "name": string, "description": string, "protein": string, "option": "A" | "B" | "C" }],
  "dinners": [{ "name": string, "description": string, "protein": string }],
  "snacks": string[]
}`)

  lines.push(`\nNUTRITION FOCUS`)
  lines.push(`Goals: ${prefs.goals.join(', ') || 'none specified'}`)
  if (prefs.focusNotes) lines.push(`Notes: ${prefs.focusNotes}`)

  lines.push(`\nWHAT I'M FEELING THIS WEEK`)
  lines.push(`Cuisines / flavors: ${prefs.cuisines.join(', ') || 'no preference'}`)
  if (prefs.cravings) lines.push(`Specific requests: ${prefs.cravings}`)
  if (prefs.avoid) lines.push(`Avoid: ${prefs.avoid}`)

  if (favoritesToInclude.length) {
    lines.push(`\nFAVORITES TO INCLUDE THIS WEEK`)
    lines.push('Please work these meals (or close versions) into the plan:')
    favoritesToInclude.forEach((f) => lines.push(`- ${f}`))
  }

  lines.push(`\nSHOPPING AT: ${resolveStore(prefs) || 'unspecified store'}`)
  lines.push(`\nWHAT I ALREADY HAVE\n${prefs.onhand || 'Nothing on hand'}`)

  const skipped = skippedList(prefs)
  if (skipped !== 'none') {
    lines.push(`\nMEALS I'M SKIPPING\n${skipped}`)
    if (prefs.eatOutNotes) lines.push(`Context: ${prefs.eatOutNotes}`)
  }

  lines.push(`\nMEAL TARGETS`)
  lines.push(`- Breakfasts: ${counts.breakfasts} (same breakfast every day is fine)`)
  lines.push(`- Lunches: ${counts.lunches} (propose 2 options to rotate)`)
  lines.push(`- Dinners: ${counts.dinners} (propose 2-3 options to rotate)`)
  lines.push(`- Snacks: a few healthy snack ideas`)

  lines.push(`\nSTANDING PREFERENCES`)
  lines.push('- Minimum ingredients and active prep time')
  lines.push("- Vary protein sources — don't repeat the same protein back to back")
  lines.push('- Simple and repeatable is fine')

  lines.push('\nReturn ONLY the JSON object, matching the shape above exactly.')

  return lines.join('\n')
}

export function buildRegenerateMealPrompt(prefs: Preferences, mealDescription: string): string {
  return `The user wants to regenerate just this one meal from an otherwise-approved plan: "${mealDescription}".
Propose a replacement that fits these preferences:
- Goals: ${prefs.goals.join(', ') || 'none specified'}
- Cuisines / flavors this week: ${prefs.cuisines.join(', ') || 'no preference'}
- Specific requests: ${prefs.cravings || 'none'}
- Avoid: ${prefs.avoid || 'nothing'}
- Already have on hand: ${prefs.onhand || 'nothing noted'}

Return ONLY a JSON object with this shape: { "name": string, "description": string, "protein": string }`
}

export const GROCERY_PREP_SYSTEM_PROMPT =
  'You are a meal prep assistant. Return ONLY a JSON object — no markdown, no preamble.'

export function buildGroceryPrepUserPrompt(prefs: Preferences, plan: MealPlan): string {
  return `Given this approved meal plan, generate a grocery list and prep instructions as JSON with this exact shape:
{
  "groceryList": { "Produce": string[], "Protein": string[], "Dairy": string[], "Pantry": string[], "Frozen": string[] },
  "prepSteps": string[],
  "mealSchedule": {
    "Breakfast": { "meal": string, "days": string[] },
    "Lunch": [{ "meal": string, "days": string[] }],
    "Dinner": [{ "meal": string, "days": string[] }]
  }
}

Rules:
- Each grocery item must be labeled with the meal it belongs to in parentheses, e.g. "Salmon fillet (miso-glazed salmon)".
- Exclude anything the user already has: ${prefs.onhand || 'nothing noted'}.
- Always include these standing items (label them "(standing item)"): ${prefs.standingItems.join(', ') || 'none'}.
- Breakfasts/lunches: prep and pack individually per serving, one container per serving. Dressings/sauces packed separately.
- Dinners: prep or partially prep in bulk per recipe, store together as one batch, uncooked or minimally cooked, ready to finish night-of.
- prepSteps should be numbered-order, one instruction per array entry, prefixed with which meal they're for (e.g. "Breakfast — ...", "Lunch A — ...", "Dinner B — ...").

Approved meal plan:
${JSON.stringify(plan, null, 2)}

Return ONLY the JSON object, matching the shape above exactly.`
}

export type { GroceryPrepPlan }
