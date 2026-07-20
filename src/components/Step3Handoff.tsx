import CopyPromptButton from './CopyPromptButton'
import { buildGroceryPrepPrompt } from '../lib/promptBuilder'
import type { MealPlan, Preferences } from '../types'

interface Step3Props {
  preferences: Preferences
  plan: MealPlan
  onBack: () => void
  onStartOver: () => void
}

export default function Step3Handoff({ preferences, plan, onBack, onStartOver }: Step3Props) {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Grocery list &amp; prep</h2>
        <p className="text-sm text-gray-600">
          Copy this prompt into a Claude conversation that has your <strong>Apple Reminders MCP</strong> connected
          (e.g. Claude Desktop). Claude will generate your grocery list and prep steps, then add them directly to
          your "Groceries" and "Sunday Food Prep" Reminders lists.
        </p>
        <CopyPromptButton label="Copy grocery + prep prompt" getText={() => buildGroceryPrepPrompt(preferences, plan)} />
      </section>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800">
          ← Back to meal plan
        </button>
        <button type="button" onClick={onStartOver} className="ml-auto text-sm text-gray-500 hover:text-gray-800">
          Start a new week →
        </button>
      </div>
    </div>
  )
}
