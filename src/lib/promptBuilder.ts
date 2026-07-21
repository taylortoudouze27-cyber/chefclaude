import { WEEKDAYS } from '../types'
import type { MealPlan, Preferences } from '../types'

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

/** Prompt 1: propose a meal plan. Asks for JSON so the app can parse Claude's reply back in. */
export function buildMealPlanPrompt(prefs: Preferences): string {
  const counts = mealCounts(prefs)
  const favoritesToInclude = prefs.favorites.filter((f) => f.include).map((f) => f.name)

  const lines: string[] = []
  lines.push(
    "I'm using a meal-planning app that needs your reply as a single JSON object so it can import it directly. " +
      'Reply with ONLY the JSON object below — no markdown code fences, no preamble, no explanation.',
  )
  lines.push(`
{
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

  return lines.join('\n')
}

/** Small scoped prompt to swap out just one meal on an already-reviewed plan. */
export function buildAlternateMealPrompt(prefs: Preferences, mealDescription: string): string {
  const lines: string[] = []
  lines.push(
    `I'm reviewing a meal plan and want a different option for just this one meal: "${mealDescription}". ` +
      'Propose a replacement that fits these preferences.',
  )
  lines.push(`\nGoals: ${prefs.goals.join(', ') || 'none specified'}`)
  lines.push(`Cuisines / flavors: ${prefs.cuisines.join(', ') || 'no preference'}`)
  if (prefs.cravings) lines.push(`Specific requests: ${prefs.cravings}`)
  if (prefs.avoid) lines.push(`Avoid: ${prefs.avoid}`)
  lines.push(`Already have on hand: ${prefs.onhand || 'nothing noted'}`)
  lines.push(
    '\nReply with ONLY this JSON object — no markdown code fences, no preamble, no explanation:\n' +
      '{ "name": string, "description": string, "protein": string }',
  )
  return lines.join('\n')
}

function formatMealPlanForPrompt(plan: MealPlan): string {
  const lines: string[] = []
  lines.push(
    `Breakfast: ${plan.breakfast.name} — ${plan.breakfast.description} (protein: ${plan.breakfast.protein}) — ${
      plan.breakfast.days.join(', ') || 'every day'
    }`,
  )
  plan.lunches.forEach((l) => lines.push(`Lunch option ${l.option}: ${l.name} — ${l.description} (protein: ${l.protein})`))
  plan.dinners.forEach((d, i) => lines.push(`Dinner ${i + 1}: ${d.name} — ${d.description} (protein: ${d.protein})`))
  if (plan.snacks.length) lines.push(`Snacks: ${plan.snacks.join(', ')}`)
  return lines.join('\n')
}

/**
 * Prompt 2: hand off the approved plan for grocery list + prep + Reminders push.
 * This is the terminal step — meant to run in a Claude conversation with the
 * Apple Reminders MCP connected (e.g. Claude Desktop), not parsed back into the app.
 */
export function buildGroceryPrepPrompt(prefs: Preferences, plan: MealPlan): string {
  const lines: string[] = []
  lines.push("Here's the meal plan I approved:\n")
  lines.push(formatMealPlanForPrompt(plan))

  const skipped = skippedList(prefs)
  if (skipped !== 'none') {
    lines.push(`\nDays I'm eating out / skipping (do not schedule or shop for these): ${skipped}`)
    if (prefs.eatOutNotes) lines.push(`Context: ${prefs.eatOutNotes}`)
  }

  lines.push('\nPlease now:')
  lines.push(
    '1. Assign each meal to specific weekdays (Monday-Friday), skipping the days listed above, before sizing ' +
      'anything — the grocery quantities and prep batch sizes must match the actual number of days each meal is ' +
      'scheduled for, not a full 5-day week.',
  )
  lines.push(
    '2. Generate a grocery list — one item per line, grouped by category (Produce, Protein, Dairy, Pantry, ' +
      'Frozen, etc.), each item labeled with the meal it belongs to in parentheses, e.g. "Salmon fillet ' +
      `(miso-glazed salmon)". Exclude anything I already have: ${prefs.onhand || 'nothing noted'}. Always include ` +
      `these standing items: ${prefs.standingItems.join(', ') || 'none'}.`,
  )
  lines.push(
    '3. Generate prep instructions, numbered. Breakfasts/lunches: prep and pack individually per serving, ' +
      'dressings/sauces packed separately. Dinners: prep or partially prep in bulk per recipe, store together as ' +
      'one batch, uncooked or minimally cooked, ready to finish night-of.',
  )
  lines.push(
    '4. After the prep instructions, list the meal schedule you assigned in step 1, grouped by meal type (all ' +
      'breakfasts with their days, then lunches, then dinners), formatted as "Meal name (Day, Day, Day)".',
  )
  lines.push('5. Add the grocery items to my Reminders list "Groceries" — one reminder per item.')
  lines.push('6. Add the prep steps and meal schedule entries to my Reminders list "Sunday Food Prep" — one reminder per item.')

  return lines.join('\n')
}
