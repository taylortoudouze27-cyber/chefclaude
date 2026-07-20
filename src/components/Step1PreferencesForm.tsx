import { useState } from 'react'
import { DAYS_OF_WEEK, type MealType, type Preferences } from '../types'

interface Step1Props {
  preferences: Preferences
  onChange: (prefs: Preferences) => void
  onSubmit: () => void
  submitting: boolean
  error: string | null
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner']

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-800">{label}</span>
      {hint && <span className="mb-1 block text-xs text-gray-500">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  )
}

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'

export default function Step1PreferencesForm({ preferences, onChange, onSubmit, submitting, error }: Step1Props) {
  const [newStandingItem, setNewStandingItem] = useState('')

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    onChange({ ...preferences, [key]: value })
  }

  function toggleSkip(day: (typeof DAYS_OF_WEEK)[number], meal: MealType) {
    onChange({
      ...preferences,
      skippedMeals: {
        ...preferences.skippedMeals,
        [day]: {
          ...preferences.skippedMeals[day],
          [meal]: !preferences.skippedMeals[day][meal],
        },
      },
    })
  }

  function addStandingItem() {
    const trimmed = newStandingItem.trim()
    if (!trimmed) return
    update('standingItems', [...preferences.standingItems, trimmed])
    setNewStandingItem('')
  }

  function removeStandingItem(index: number) {
    update(
      'standingItems',
      preferences.standingItems.filter((_, i) => i !== index),
    )
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Nutrition Focus</h2>
        <Field label="Goals" hint="e.g. high protein, high fiber, low carb">
          <input
            className={inputClass}
            value={preferences.nutritionGoals}
            onChange={(e) => update('nutritionGoals', e.target.value)}
          />
        </Field>
        <Field label="Notes" hint='e.g. "light/hydrating lunches for hot weather"'>
          <textarea
            className={inputClass}
            rows={2}
            value={preferences.nutritionNotes}
            onChange={(e) => update('nutritionNotes', e.target.value)}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">What I'm Feeling This Week</h2>
        <Field label="Cuisines / flavors" hint="e.g. Mediterranean, Asian-inspired">
          <input
            className={inputClass}
            value={preferences.cuisines}
            onChange={(e) => update('cuisines', e.target.value)}
          />
        </Field>
        <Field
          label="Specific requests"
          hint={'e.g. "don\'t want a ton of chicken, breakfast should be english muffin sandwiches"'}
        >
          <textarea
            className={inputClass}
            rows={2}
            value={preferences.specificRequests}
            onChange={(e) => update('specificRequests', e.target.value)}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Where I'm Shopping</h2>
        <Field label="Store name" hint={'e.g. "Trader Joe\'s"'}>
          <input className={inputClass} value={preferences.store} onChange={(e) => update('store', e.target.value)} />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">What I Already Have</h2>
        <Field label="Pantry / fridge items" hint='e.g. "feta cheese block, tortillas, half bag of arugula, 4 eggs"'>
          <textarea
            className={inputClass}
            rows={2}
            value={preferences.alreadyHave}
            onChange={(e) => update('alreadyHave', e.target.value)}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Meals I'm Skipping</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left font-medium text-gray-600">Day</th>
                {MEAL_TYPES.map((meal) => (
                  <th key={meal} className="p-2 text-center font-medium capitalize text-gray-600">
                    {meal}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS_OF_WEEK.map((day) => (
                <tr key={day} className="border-t border-gray-100">
                  <td className="p-2 text-gray-800">{day}</td>
                  {MEAL_TYPES.map((meal) => (
                    <td key={meal} className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={preferences.skippedMeals[day][meal]}
                        onChange={() => toggleSkip(day, meal)}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Meal Targets</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Breakfasts">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={preferences.targets.breakfasts}
              onChange={(e) =>
                update('targets', { ...preferences.targets, breakfasts: Number(e.target.value) })
              }
            />
          </Field>
          <div className="space-y-1">
            <Field label="Lunches">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={preferences.targets.lunches}
                onChange={(e) => update('targets', { ...preferences.targets, lunches: Number(e.target.value) })}
              />
            </Field>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={preferences.targets.lunchRotate}
                onChange={(e) => update('targets', { ...preferences.targets, lunchRotate: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Propose 2 options to rotate
            </label>
          </div>
          <div className="space-y-1">
            <Field label="Dinners">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={preferences.targets.dinners}
                onChange={(e) => update('targets', { ...preferences.targets, dinners: Number(e.target.value) })}
              />
            </Field>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={preferences.targets.dinnerRotate}
                onChange={(e) => update('targets', { ...preferences.targets, dinnerRotate: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Propose 2–3 options to rotate
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={preferences.targets.snacks}
              onChange={(e) => update('targets', { ...preferences.targets, snacks: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            Include snack ideas
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Standing Grocery Items</h2>
        <ul className="space-y-1">
          {preferences.standingItems.map((item, i) => (
            <li key={i} className="flex items-center justify-between rounded bg-gray-50 px-3 py-1.5 text-sm">
              <span>{item}</span>
              <button
                type="button"
                onClick={() => removeStandingItem(i)}
                className="text-xs text-gray-400 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            className={inputClass}
            placeholder="Add a standing item"
            value={newStandingItem}
            onChange={(e) => setNewStandingItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addStandingItem()
              }
            }}
          />
          <button
            type="button"
            onClick={addStandingItem}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Add
          </button>
        </div>
      </section>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Generating meal plan…' : 'Generate meal plan'}
      </button>
    </form>
  )
}
