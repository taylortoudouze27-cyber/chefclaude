import { useState } from 'react'
import ApiKeyBar from './components/ApiKeyBar'
import Step1PreferencesForm from './components/Step1PreferencesForm'
import Step2MealPlanProposal from './components/Step2MealPlanProposal'
import Step3GroceryPrep from './components/Step3GroceryPrep'
import { defaultPreferences } from './lib/defaults'
import { generateJson, AnthropicApiError } from './lib/anthropicClient'
import {
  MEAL_PLAN_SYSTEM_PROMPT,
  GROCERY_PREP_SYSTEM_PROMPT,
  buildMealPlanUserPrompt,
  buildRegenerateMealPrompt,
  buildGroceryPrepUserPrompt,
} from './lib/prompts'
import type { GroceryPrepPlan, MealPlan, Preferences, Step } from './types'

const STEP_LABELS: Record<Step, string> = {
  1: 'Preferences',
  2: 'Review Plan',
  3: 'Grocery & Prep',
}

export default function App() {
  const [apiKey, setApiKey] = useState('')
  const [step, setStep] = useState<Step>(1)
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences())
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [groceryPrepPlan, setGroceryPrepPlan] = useState<GroceryPrepPlan | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerateMealPlan() {
    setSubmitting(true)
    setError(null)
    try {
      const plan = await generateJson<MealPlan>({
        apiKey,
        system: MEAL_PLAN_SYSTEM_PROMPT,
        userPrompt: buildMealPlanUserPrompt(preferences),
      })
      setMealPlan(plan)
      setStep(2)
    } catch (err) {
      setError(err instanceof AnthropicApiError ? err.message : 'Something went wrong generating the meal plan.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRegenerateMeal(
    description: string,
    applyResult: (result: { name: string; description: string; protein: string }) => void,
  ) {
    try {
      const result = await generateJson<{ name: string; description: string; protein: string }>({
        apiKey,
        system: MEAL_PLAN_SYSTEM_PROMPT,
        userPrompt: buildRegenerateMealPrompt(preferences, description),
      })
      applyResult(result)
    } catch (err) {
      setError(err instanceof AnthropicApiError ? err.message : 'Could not regenerate that meal.')
    }
  }

  async function handleApprovePlan() {
    if (!mealPlan) return
    setSubmitting(true)
    setError(null)
    try {
      const plan = await generateJson<GroceryPrepPlan>({
        apiKey,
        system: GROCERY_PREP_SYSTEM_PROMPT,
        userPrompt: buildGroceryPrepUserPrompt(preferences, mealPlan),
      })
      setGroceryPrepPlan(plan)
      setStep(3)
    } catch (err) {
      setError(err instanceof AnthropicApiError ? err.message : 'Something went wrong generating the grocery list.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ChefClaude — Meal Planner</h1>
        <p className="text-sm text-gray-500">Plan your week, get a grocery list, and prep like a pro.</p>
      </header>

      <ApiKeyBar apiKey={apiKey} onChange={setApiKey} />

      <nav className="mb-8 flex gap-4 text-sm">
        {([1, 2, 3] as Step[]).map((s) => (
          <span
            key={s}
            className={`flex items-center gap-1 ${
              s === step ? 'font-semibold text-emerald-700' : s < step ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                s <= step ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </span>
            {STEP_LABELS[s]}
          </span>
        ))}
      </nav>

      {step === 1 && (
        <Step1PreferencesForm
          preferences={preferences}
          onChange={setPreferences}
          onSubmit={handleGenerateMealPlan}
          submitting={submitting}
          error={error}
        />
      )}

      {step === 2 && mealPlan && (
        <Step2MealPlanProposal
          plan={mealPlan}
          onChange={setMealPlan}
          onApprove={handleApprovePlan}
          onRegenerateAll={handleGenerateMealPlan}
          onRegenerateMeal={handleRegenerateMeal}
          submitting={submitting}
          error={error}
        />
      )}

      {step === 3 && groceryPrepPlan && (
        <Step3GroceryPrep plan={groceryPrepPlan} onChange={setGroceryPrepPlan} onBack={() => setStep(2)} />
      )}
    </div>
  )
}
