import { useState } from 'react'
import Step1PreferencesForm from './components/Step1PreferencesForm'
import Step2MealPlanProposal from './components/Step2MealPlanProposal'
import Step3Handoff from './components/Step3Handoff'
import CopyPromptButton from './components/CopyPromptButton'
import PasteImportBox from './components/PasteImportBox'
import { defaultPreferences } from './lib/defaults'
import { buildMealPlanPrompt } from './lib/promptBuilder'
import { parseJsonSafely } from './lib/parseJson'
import type { MealPlan, Preferences, Step } from './types'

const STEP_LABELS: Record<Step, string> = {
  1: 'Preferences',
  2: 'Review Plan',
  3: 'Grocery & Prep',
}

const IMPORT_ERROR = "Couldn't read that as a meal plan — make sure you pasted Claude's full JSON response."

export default function App() {
  const [step, setStep] = useState<Step>(1)
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences())
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  function handleImportMealPlan(text: string) {
    try {
      const plan = parseJsonSafely<MealPlan>(text)
      setMealPlan(plan)
      setImportError(null)
      setStep(2)
    } catch {
      setImportError(IMPORT_ERROR)
    }
  }

  function handleStartOver() {
    setStep(1)
    setMealPlan(null)
    setImportError(null)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ChefClaude — Meal Planner</h1>
        <p className="text-sm text-gray-500">Plan your week, get a grocery list, and prep like a pro.</p>
      </header>

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
        <div className="space-y-4">
          <Step1PreferencesForm preferences={preferences} onChange={setPreferences} />
          <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Get your meal plan</h2>
            <p className="text-sm text-gray-600">
              Copy this prompt into a Claude conversation (claude.ai works great), then paste Claude's response back
              in below.
            </p>
            <CopyPromptButton label="Copy meal plan prompt" getText={() => buildMealPlanPrompt(preferences)} />
            <PasteImportBox
              label="Paste Claude's response here"
              buttonLabel="Use this plan"
              onImport={handleImportMealPlan}
              error={importError}
            />
          </section>
        </div>
      )}

      {step === 2 && mealPlan && (
        <div className="space-y-6">
          <Step2MealPlanProposal plan={mealPlan} onChange={setMealPlan} onApprove={() => setStep(3)} />
          <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Want a different plan?</h2>
            <p className="text-sm text-gray-600">
              Copy the prompt again (edit your preferences above first if you want), get a new response from Claude,
              and paste it in here to replace the plan.
            </p>
            <CopyPromptButton label="Copy meal plan prompt" getText={() => buildMealPlanPrompt(preferences)} />
            <PasteImportBox
              label="Paste the new plan here"
              buttonLabel="Use this plan"
              onImport={handleImportMealPlan}
              error={importError}
            />
          </section>
          <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-800">
            ← Back to preferences
          </button>
        </div>
      )}

      {step === 3 && mealPlan && (
        <Step3Handoff
          preferences={preferences}
          plan={mealPlan}
          onBack={() => setStep(2)}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  )
}
