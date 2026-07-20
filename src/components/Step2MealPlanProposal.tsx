import { useState } from 'react'
import type { MealPlan, Preferences } from '../types'
import { buildAlternateMealPrompt } from '../lib/promptBuilder'
import { parseJsonSafely } from '../lib/parseJson'
import CopyPromptButton from './CopyPromptButton'
import PasteImportBox from './PasteImportBox'

interface Step2Props {
  preferences: Preferences
  plan: MealPlan
  onChange: (plan: MealPlan) => void
  onApprove: () => void
}

interface MealFields {
  name: string
  description: string
  protein: string
}

interface MealCardProps {
  title: string
  name: string
  description: string
  protein: string
  mealDescription: string
  preferences: Preferences
  onEdit: (field: 'name' | 'description' | 'protein', value: string) => void
  onApplyAlternate: (result: MealFields) => void
}

function MealCard({
  title,
  name,
  description,
  protein,
  mealDescription,
  preferences,
  onEdit,
  onApplyAlternate,
}: MealCardProps) {
  const [mode, setMode] = useState<'view' | 'editing' | 'alternate'>('view')
  const [importError, setImportError] = useState<string | null>(null)

  function handleImportAlternate(text: string) {
    try {
      const result = parseJsonSafely<MealFields>(text)
      onApplyAlternate(result)
      setImportError(null)
      setMode('view')
    } catch {
      setImportError("Couldn't read that — make sure you pasted Claude's full JSON reply.")
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{title}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode(mode === 'editing' ? 'view' : 'editing')}
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            {mode === 'editing' ? 'Done' : 'Edit'}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'alternate' ? 'view' : 'alternate')}
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            {mode === 'alternate' ? 'Cancel' : 'Get alternate'}
          </button>
        </div>
      </div>

      {mode === 'editing' && (
        <div className="space-y-2">
          <input
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm font-medium"
            value={name}
            onChange={(e) => onEdit('name', e.target.value)}
          />
          <input
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            value={description}
            onChange={(e) => onEdit('description', e.target.value)}
          />
          <input
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
            value={protein}
            onChange={(e) => onEdit('protein', e.target.value)}
          />
        </div>
      )}

      {mode === 'view' && (
        <>
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">{description}</p>
          <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
            {protein}
          </span>
        </>
      )}

      {mode === 'alternate' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Copy this prompt, paste Claude's reply back in below to swap in a new version of this meal.
          </p>
          <CopyPromptButton
            label="Copy prompt for this meal"
            getText={() => buildAlternateMealPrompt(preferences, mealDescription)}
          />
          <PasteImportBox
            label="Paste Claude's reply here"
            buttonLabel="Use this"
            onImport={handleImportAlternate}
            error={importError}
          />
        </div>
      )}
    </div>
  )
}

export default function Step2MealPlanProposal({ preferences, plan, onChange, onApprove }: Step2Props) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Breakfast</h2>
        <MealCard
          title={plan.breakfast.days.join(', ') || 'Every day'}
          name={plan.breakfast.name}
          description={plan.breakfast.description}
          protein={plan.breakfast.protein}
          mealDescription={`Breakfast: ${plan.breakfast.name} — ${plan.breakfast.description}`}
          preferences={preferences}
          onEdit={(field, value) => onChange({ ...plan, breakfast: { ...plan.breakfast, [field]: value } })}
          onApplyAlternate={(result) => onChange({ ...plan, breakfast: { ...plan.breakfast, ...result } })}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Lunches</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {plan.lunches.map((lunch, i) => (
            <MealCard
              key={i}
              title={`Option ${lunch.option}`}
              name={lunch.name}
              description={lunch.description}
              protein={lunch.protein}
              mealDescription={`Lunch option ${lunch.option}: ${lunch.name} — ${lunch.description}`}
              preferences={preferences}
              onEdit={(field, value) => {
                const next = [...plan.lunches]
                next[i] = { ...next[i], [field]: value }
                onChange({ ...plan, lunches: next })
              }}
              onApplyAlternate={(result) => {
                const next = [...plan.lunches]
                next[i] = { ...next[i], ...result }
                onChange({ ...plan, lunches: next })
              }}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Dinners</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {plan.dinners.map((dinner, i) => (
            <MealCard
              key={i}
              title={`Dinner ${i + 1}`}
              name={dinner.name}
              description={dinner.description}
              protein={dinner.protein}
              mealDescription={`Dinner: ${dinner.name} — ${dinner.description}`}
              preferences={preferences}
              onEdit={(field, value) => {
                const next = [...plan.dinners]
                next[i] = { ...next[i], [field]: value }
                onChange({ ...plan, dinners: next })
              }}
              onApplyAlternate={(result) => {
                const next = [...plan.dinners]
                next[i] = { ...next[i], ...result }
                onChange({ ...plan, dinners: next })
              }}
            />
          ))}
        </div>
      </section>

      {plan.snacks.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Snack ideas</h2>
          <ul className="flex flex-wrap gap-2">
            {plan.snacks.map((snack, i) => (
              <li key={i} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                {snack}
              </li>
            ))}
          </ul>
        </section>
      )}

      <button
        type="button"
        onClick={onApprove}
        className="min-h-[44px] w-full rounded-lg bg-emerald-600 px-4 text-[15px] font-semibold text-white hover:bg-emerald-700"
      >
        Approve plan
      </button>
    </div>
  )
}
