# Meal Planner App — Product Brief for Claude Code

## What This Is

A weekly meal planning app that guides a user through:

1. Setting their nutrition goals and preferences
2. Getting a proposed meal plan
3. Approving / editing the plan
4. Auto-generating a grocery list and prep instructions
5. Pushing the grocery list and prep steps to Apple Reminders (via MCP integration)

The app is AI-powered: it uses the Anthropic API (`claude-sonnet-4-6`) to generate meal plans, grocery lists, and prep steps based on user inputs.

## User Flow (Screens / Steps)

### Step 1 — Preferences Form

The user fills out a structured form with the following fields:

**Nutrition Focus**

- Goals (multi-select or free text): e.g. high protein, high fiber, low carb
- Notes (free text): e.g. "light/hydrating lunches for hot weather"

**What I'm Feeling This Week**

- Cuisines / flavors (free text or tag picker): e.g. Mediterranean, Asian-inspired
- Specific requests (free text): e.g. "don't want a ton of chicken, breakfast should be english muffin sandwiches"

**Where I'm Shopping**

- Store name (free text): e.g. "Trader Joe's"

**What I Already Have**

- Free text list of pantry/fridge items: e.g. "feta cheese block, tortillas, half bag of arugula, 4 eggs"

**Meals I'm Skipping**

- Checkboxes for each day × meal type (Breakfast / Lunch / Dinner) — Mon–Sun grid
- User checks off which meals to skip

**Meal Targets**

- Breakfasts: number input (default 5)
- Lunches: number input + "propose 2 options to rotate" toggle
- Dinners: number input + "propose 2–3 options to rotate" toggle
- Snacks: toggle (include snack ideas yes/no)

**Standing Grocery Items**

- Always-add items (editable list): default includes "Creamer or milk (for coffee/breakfast)"

### Step 2 — Meal Plan Proposal

The app calls the Anthropic API and returns a proposed meal plan:

- 1 breakfast option (or same every day)
- 2 lunch rotation options
- 2–3 dinner rotation options
- Snack ideas (if enabled)

Display as a clean card-based layout. Each meal shows:

- Meal name
- Short description (1 line)
- Protein source highlighted

User can:

- Approve the full plan → proceeds to Step 3
- Edit individual meals (free text override or "regenerate this meal")
- Regenerate all (re-calls the API)

### Step 3 — Grocery List + Prep Instructions

After approval, the app calls the Anthropic API again to generate:

**Grocery List**

- Format: one item per line, grouped by category (Produce, Protein, Dairy, Pantry, Frozen, etc.)
- Each item labeled with the meal it belongs to in parentheses
  - e.g. "Salmon fillet (miso-glazed salmon)" NOT "salmon (Tuesday dinner)"
- Standing grocery items always included
- Items the user already has are excluded

**Prep Instructions**

- Numbered steps, one per line
- Breakfasts/lunches: prep and pack individually per serving (e.g. 5 separate containers). Dressing/sauce packed separately.
- Dinners: prep or partially prep in bulk per recipe, store together as one batch, uncooked or minimally cooked, ready to finish night-of.

**Meal Schedule**

- Listed after prep instructions
- Grouped: all breakfasts with their days, then lunches, then dinners
- Format: `Meal name (Day, Day, Day)`

Display both lists side by side (or tabbed on mobile). User can edit individual items inline before sending to Reminders.

### Step 4 — Push to Reminders (Apple Reminders via MCP)

Two buttons:

- "Add to Groceries list" → pushes grocery items to the user's "Groceries" Reminders list
- "Add to Sunday Food Prep list" → pushes prep steps + meal schedule to "Sunday Food Prep" Reminders list

Uses the Apple Reminders MCP server. Each item is a separate reminder.

## AI Prompt Design

### Prompt 1: Generate Meal Plan

System: You are a meal planning assistant. Return ONLY a JSON object — no markdown, no preamble.

User prompt includes:

- Nutrition goals and notes
- Cuisine preferences and specific requests
- Store name
- What the user already has
- Which meals to skip
- Meal targets (# of breakfasts, lunches, dinners, snack toggle)

Expected JSON output:

```json
{
  "breakfast": {
    "name": "English muffin sandwich",
    "description": "Egg, spinach, everything bagel seasoning",
    "protein": "Egg",
    "days": ["Tuesday", "Wednesday", "Thursday", "Friday"]
  },
  "lunches": [
    {
      "name": "Greek cucumber & chickpea salad",
      "description": "With lemon-herb vinaigrette",
      "protein": "Chickpeas",
      "option": "A"
    },
    {
      "name": "Arugula, white bean & feta salad",
      "description": "With lemon olive oil",
      "protein": "White beans + feta",
      "option": "B"
    }
  ],
  "dinners": [
    {
      "name": "Miso-glazed salmon",
      "description": "With steamed edamame and jasmine rice",
      "protein": "Salmon"
    },
    {
      "name": "Mediterranean shrimp over orzo",
      "description": "With cherry tomatoes, olives, and feta",
      "protein": "Shrimp"
    },
    {
      "name": "Turkey & veggie stir-fry",
      "description": "With soba noodles",
      "protein": "Ground turkey"
    }
  ],
  "snacks": ["Hard-boiled eggs", "Hummus with cucumber & bell pepper", "Edamame", "Greek yogurt with honey"]
}
```

### Prompt 2: Generate Grocery List + Prep Instructions

System: You are a meal prep assistant. Return ONLY a JSON object — no markdown, no preamble.

User prompt includes:

- The approved meal plan (from Step 2)
- What the user already has (to exclude from grocery list)
- Standing grocery items (always include)
- Prep style rules (individual packing for breakfast/lunch, bulk batch for dinners)

Expected JSON output:

```json
{
  "groceryList": {
    "Produce": [
      "Persian cucumbers (Greek chickpea salad)",
      "Cherry tomatoes (Mediterranean shrimp)"
    ],
    "Protein": [
      "Salmon fillet (miso-glazed salmon)",
      "Ground turkey (turkey stir-fry)"
    ],
    "Dairy": [
      "Creamer or milk (standing item)"
    ],
    "Pantry": [
      "White miso paste (miso-glazed salmon)",
      "Soy sauce (miso-glazed salmon + turkey stir-fry)"
    ],
    "Frozen": [
      "Edamame (miso-glazed salmon)"
    ]
  },
  "prepSteps": [
    "Breakfast — Cook 4 eggs (one per sandwich), let cool slightly",
    "Breakfast — Lightly wilt spinach in pan; portion into 4 servings",
    "Breakfast — Toast and cool 4 English muffins; assemble 4 individual sandwiches, wrap and refrigerate",
    "Lunch A — Drain and rinse chickpeas; dice cucumbers and red onion; combine with olives and parsley; portion into 3 containers (dressing separate)",
    "Dinner A — Make miso glaze; coat salmon and refrigerate uncooked in one container"
  ],
  "mealSchedule": {
    "Breakfast": {
      "meal": "English muffin sandwich",
      "days": ["Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    "Lunch": [
      { "meal": "Greek chickpea salad (Option A)", "days": ["Wednesday", "Friday"] },
      { "meal": "Arugula white bean salad (Option B)", "days": ["Thursday"] }
    ],
    "Dinner": [
      { "meal": "Miso-glazed salmon", "days": ["Tuesday"] },
      { "meal": "Mediterranean shrimp", "days": ["Wednesday"] },
      { "meal": "Turkey stir-fry", "days": ["Thursday"] }
    ]
  }
}
```

## Reminders Integration (Apple Reminders MCP)

MCP Server URL: `https://reminders-mcp.apple.com/mcp/v1` (or however it's configured in the user's environment)

Target lists:

- "Groceries" — receives grocery items, one reminder per item
- "Sunday Food Prep" — receives numbered prep steps + meal schedule entries, one reminder per step

Each reminder title = the full item string (e.g. `"Salmon fillet (miso-glazed salmon)"`).

## Standing Rules / Business Logic

- Protein variety: never repeat the same protein source back-to-back across meals
- Already-owned items: exclude from grocery list but still use in meal plan
- Skipped meals: don't plan or shop for them
- Dressing/sauces: always pack separately for salads and marinated dishes
- Dinner prep style: bulk batch, uncooked or minimally cooked, finish night-of
- Breakfast/lunch prep style: individual portions, one container per serving

## Tech Stack Suggestions

- Frontend: React (with Tailwind for styling)
- AI: Anthropic API (`claude-sonnet-4-6`) via `fetch` to `https://api.anthropic.com/v1/messages`
- Reminders: Apple Reminders MCP server (user must have it connected)
- State: React `useState` / `useReducer` — no localStorage needed, all in-session
- No backend required — all API calls made client-side

## Sample Data (from a real session)

User inputs:

- Goals: high protein, high fiber
- Notes: light/hydrating lunches for hot weather
- Cuisines: Mediterranean, Asian-inspired
- Specific requests: don't want a ton of chicken, breakfast should be english muffin sandwiches
- Store: Trader Joe's
- Already have: feta cheese block, tortillas, half bag of arugula, 4 eggs, shrimp
- Skipping: Mon breakfast, Mon lunch, Mon dinner, Tue lunch, Fri dinner
- Targets: 4 breakfasts, 3 lunches (2 options), 3 dinners (2–3 options), no snacks
- Standing items: Creamer or milk

Approved meal plan:

- Breakfast: English muffin sandwich — egg, spinach, everything bagel seasoning (Tue–Fri)
- Lunch A: Greek cucumber & chickpea salad with lemon-herb vinaigrette
- Lunch B: Arugula, white bean & feta salad with lemon olive oil
- Dinner A: Miso-glazed salmon with steamed edamame and rice
- Dinner B: Mediterranean shrimp over orzo with cherry tomatoes, olives, and feta
- Dinner C: Turkey & veggie stir-fry with soba noodles
