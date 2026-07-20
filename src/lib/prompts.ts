import type { GroceryPrepPlan, MealPlan, Preferences } from '../types'

export const MEAL_PLAN_SYSTEM_PROMPT =
  'You are a meal planning assistant. Return ONLY a JSON object — no markdown, no preamble. ' +
  'Never repeat the same protein source in back-to-back meals.'

export function buildMealPlanUserPrompt(prefs: Preferences): string {
  const skipped = Object.entries(prefs.skippedMeals)
    .flatMap(([day, meals]) =>
      Object.entries(meals)
        .filter(([, isSkipped]) => isSkipped)
        .map(([meal]) => `${day} ${meal}`),
    )
    .join(', ') || 'none'

  return `Generate a weekly meal plan as JSON with this exact shape:
{
  "breakfast": { "name": string, "description": string, "protein": string, "days": string[] },
  "lunches": [{ "name": string, "description": string, "protein": string, "option": "A" | "B" | "C" }],
  "dinners": [{ "name": string, "description": string, "protein": string }],
  "snacks": string[]
}

User preferences:
- Nutrition goals: ${prefs.nutritionGoals || 'none specified'}
- Nutrition notes: ${prefs.nutritionNotes || 'none'}
- Cuisines / flavors this week: ${prefs.cuisines || 'no preference'}
- Specific requests: ${prefs.specificRequests || 'none'}
- Shopping at: ${prefs.store || 'unspecified store'}
- Already have on hand (use these where sensible, don't need to buy them): ${prefs.alreadyHave || 'nothing noted'}
- Meals to skip (do not plan these): ${skipped}
- Targets: ${prefs.targets.breakfasts} breakfast(s)${prefs.targets.lunches ? `, ${prefs.targets.lunches} lunch(es)${prefs.targets.lunchRotate ? ' rotating across 2 options (A/B)' : ''}` : ''}${prefs.targets.dinners ? `, ${prefs.targets.dinners} dinner(s)${prefs.targets.dinnerRotate ? ' rotating across 2-3 options' : ''}` : ''}
- Include snack ideas: ${prefs.targets.snacks ? 'yes' : 'no'}

Return ONLY the JSON object, matching the shape above exactly.`
}

export function buildRegenerateMealPrompt(
  prefs: Preferences,
  mealDescription: string,
): string {
  return `The user wants to regenerate just this one meal from an otherwise-approved plan: "${mealDescription}".
Propose a replacement that fits these preferences:
- Nutrition goals: ${prefs.nutritionGoals || 'none specified'}
- Cuisines / flavors this week: ${prefs.cuisines || 'no preference'}
- Specific requests: ${prefs.specificRequests || 'none'}
- Already have on hand: ${prefs.alreadyHave || 'nothing noted'}

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
- Exclude anything the user already has: ${prefs.alreadyHave || 'nothing noted'}.
- Always include these standing items (label them "(standing item)"): ${prefs.standingItems.join(', ') || 'none'}.
- Breakfasts/lunches: prep and pack individually per serving, one container per serving. Dressings/sauces packed separately.
- Dinners: prep or partially prep in bulk per recipe, store together as one batch, uncooked or minimally cooked, ready to finish night-of.
- prepSteps should be numbered-order, one instruction per array entry, prefixed with which meal they're for (e.g. "Breakfast — ...", "Lunch A — ...", "Dinner B — ...").

Approved meal plan:
${JSON.stringify(plan, null, 2)}

Return ONLY the JSON object, matching the shape above exactly.`
}

export type { GroceryPrepPlan }
