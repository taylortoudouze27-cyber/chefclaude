import { useState } from 'react'
import type { GroceryPrepPlan } from '../types'
import { pushToReminders } from '../lib/reminders'

interface Step3Props {
  plan: GroceryPrepPlan
  onChange: (plan: GroceryPrepPlan) => void
  onBack: () => void
}

type PushStatus = { state: 'idle' | 'pushing' | 'done' | 'error'; message?: string }

function flattenGroceryList(groceryList: GroceryPrepPlan['groceryList']): string[] {
  return Object.entries(groceryList).flatMap(([category, items]) => items.map((item) => `${item} [${category}]`))
}

function flattenPrepAndSchedule(plan: GroceryPrepPlan): string[] {
  const scheduleLines = [
    `${plan.mealSchedule.Breakfast.meal} (${plan.mealSchedule.Breakfast.days.join(', ')})`,
    ...plan.mealSchedule.Lunch.map((e) => `${e.meal} (${e.days.join(', ')})`),
    ...plan.mealSchedule.Dinner.map((e) => `${e.meal} (${e.days.join(', ')})`),
  ]
  return [...plan.prepSteps, ...scheduleLines]
}

export default function Step3GroceryPrep({ plan, onChange, onBack }: Step3Props) {
  const [tab, setTab] = useState<'grocery' | 'prep'>('grocery')
  const [groceryPush, setGroceryPush] = useState<PushStatus>({ state: 'idle' })
  const [prepPush, setPrepPush] = useState<PushStatus>({ state: 'idle' })

  function editGroceryItem(category: string, index: number, value: string) {
    const items = [...plan.groceryList[category]]
    items[index] = value
    onChange({ ...plan, groceryList: { ...plan.groceryList, [category]: items } })
  }

  function editPrepStep(index: number, value: string) {
    const steps = [...plan.prepSteps]
    steps[index] = value
    onChange({ ...plan, prepSteps: steps })
  }

  async function handlePushGroceries() {
    setGroceryPush({ state: 'pushing' })
    try {
      const result = await pushToReminders('Groceries', flattenGroceryList(plan.groceryList))
      setGroceryPush({ state: 'done', message: `Added ${result.itemCount} item(s) to "Groceries".` })
    } catch (err) {
      setGroceryPush({ state: 'error', message: err instanceof Error ? err.message : 'Push failed.' })
    }
  }

  async function handlePushPrep() {
    setPrepPush({ state: 'pushing' })
    try {
      const result = await pushToReminders('Sunday Food Prep', flattenPrepAndSchedule(plan))
      setPrepPush({ state: 'done', message: `Added ${result.itemCount} item(s) to "Sunday Food Prep".` })
    } catch (err) {
      setPrepPush({ state: 'error', message: err instanceof Error ? err.message : 'Push failed.' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-200">
        {(['grocery', 'prep'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === t ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t === 'grocery' ? 'Grocery List' : 'Prep Instructions & Schedule'}
          </button>
        ))}
      </div>

      {tab === 'grocery' && (
        <div className="space-y-5">
          {Object.entries(plan.groceryList).map(([category, items]) =>
            items.length === 0 ? null : (
              <div key={category}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">{category}</h3>
                <ul className="space-y-1">
                  {items.map((item, i) => (
                    <li key={i}>
                      <input
                        className="w-full rounded border border-transparent bg-gray-50 px-2 py-1 text-sm hover:border-gray-200 focus:border-emerald-500 focus:outline-none"
                        value={item}
                        onChange={(e) => editGroceryItem(category, i, e.target.value)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}

          <button
            type="button"
            onClick={handlePushGroceries}
            disabled={groceryPush.state === 'pushing'}
            className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {groceryPush.state === 'pushing' ? 'Adding to Reminders…' : 'Add to Groceries list'}
          </button>
          {groceryPush.message && (
            <p className={`text-sm ${groceryPush.state === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>
              {groceryPush.message}
            </p>
          )}
        </div>
      )}

      {tab === 'prep' && (
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Prep Steps</h3>
            <ol className="space-y-1">
              {plan.prepSteps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="pt-1.5 text-xs text-gray-400">{i + 1}.</span>
                  <input
                    className="w-full rounded border border-transparent bg-gray-50 px-2 py-1 text-sm hover:border-gray-200 focus:border-emerald-500 focus:outline-none"
                    value={step}
                    onChange={(e) => editPrepStep(i, e.target.value)}
                  />
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Meal Schedule</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">{plan.mealSchedule.Breakfast.meal}</span> (
                {plan.mealSchedule.Breakfast.days.join(', ')})
              </p>
              {plan.mealSchedule.Lunch.map((e, i) => (
                <p key={i}>
                  <span className="font-medium">{e.meal}</span> ({e.days.join(', ')})
                </p>
              ))}
              {plan.mealSchedule.Dinner.map((e, i) => (
                <p key={i}>
                  <span className="font-medium">{e.meal}</span> ({e.days.join(', ')})
                </p>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handlePushPrep}
            disabled={prepPush.state === 'pushing'}
            className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {prepPush.state === 'pushing' ? 'Adding to Reminders…' : 'Add to Sunday Food Prep list'}
          </button>
          {prepPush.message && (
            <p className={`text-sm ${prepPush.state === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>
              {prepPush.message}
            </p>
          )}
        </div>
      )}

      <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800">
        ← Back to meal plan
      </button>
    </div>
  )
}
