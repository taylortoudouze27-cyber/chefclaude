import { useState } from 'react'
import type { MealPlan } from '../types'

interface Step2Props {
  plan: MealPlan
  onChange: (plan: MealPlan) => void
  onApprove: () => void
}

interface MealCardProps {
  title: string
  name: string
  description: string
  protein: string
  onEdit: (field: 'name' | 'description' | 'protein', value: string) => void
}

function MealCard({ title, name, description, protein, onEdit }: MealCardProps) {
  const [editing, setEditing] = useState(false)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{title}</span>
        <button type="button" onClick={() => setEditing((v) => !v)} className="text-xs text-gray-500 hover:text-gray-800">
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>
      {editing ? (
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
      ) : (
        <>
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">{description}</p>
          <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
            {protein}
          </span>
        </>
      )}
    </div>
  )
}

export default function Step2MealPlanProposal({ plan, onChange, onApprove }: Step2Props) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Breakfast</h2>
        <MealCard
          title={plan.breakfast.days.join(', ') || 'Every day'}
          name={plan.breakfast.name}
          description={plan.breakfast.description}
          protein={plan.breakfast.protein}
          onEdit={(field, value) => onChange({ ...plan, breakfast: { ...plan.breakfast, [field]: value } })}
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
              onEdit={(field, value) => {
                const next = [...plan.lunches]
                next[i] = { ...next[i], [field]: value }
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
              onEdit={(field, value) => {
                const next = [...plan.dinners]
                next[i] = { ...next[i], [field]: value }
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
