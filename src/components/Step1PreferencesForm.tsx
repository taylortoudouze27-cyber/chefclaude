import { useEffect, useState } from 'react'
import { WEEKDAYS, type MealType, type Preferences, type Favorite, STORE_OPTIONS } from '../types'
import { GOAL_OPTIONS, CUISINE_OPTIONS } from '../lib/defaults'
import { loadFavorites, saveFavorites } from '../lib/favorites'

interface Step1Props {
  preferences: Preferences
  onChange: (prefs: Preferences) => void
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{title}</h2>
      {children}
    </section>
  )
}

function ChipRow({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            className={`min-h-[38px] rounded-full border-[1.5px] px-3.5 py-2 text-sm transition-colors ${
              on
                ? 'border-blue-300 bg-blue-50 font-medium text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

const textInputClass =
  'w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-base outline-none focus:border-gray-400 focus:bg-white'

export default function Step1PreferencesForm({ preferences, onChange }: Step1Props) {
  const [favInput, setFavInput] = useState('')

  useEffect(() => {
    const stored = loadFavorites()
    if (stored.length) onChange({ ...preferences, favorites: stored })
    // Only load once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    onChange({ ...preferences, [key]: value })
  }

  function toggleInList(key: 'goals' | 'cuisines', value: string) {
    const list = preferences[key]
    update(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  function toggleSkip(day: (typeof WEEKDAYS)[number], meal: MealType) {
    onChange({
      ...preferences,
      skippedMeals: {
        ...preferences.skippedMeals,
        [day]: { ...preferences.skippedMeals[day], [meal]: !preferences.skippedMeals[day][meal] },
      },
    })
  }

  function updateFavorites(favorites: Favorite[]) {
    update('favorites', favorites)
    saveFavorites(favorites)
  }

  function addFavorite() {
    const name = favInput.trim()
    if (!name) return
    updateFavorites([...preferences.favorites, { id: `fav_${Date.now()}`, name, starred: false, include: false }])
    setFavInput('')
  }

  function toggleFavoriteField(id: string, field: 'starred' | 'include') {
    updateFavorites(preferences.favorites.map((f) => (f.id === id ? { ...f, [field]: !f[field] } : f)))
  }

  function deleteFavorite(id: string) {
    updateFavorites(preferences.favorites.filter((f) => f.id !== id))
  }

  const sortedFavorites = [...preferences.favorites].sort((a, b) => Number(b.starred) - Number(a.starred))

  return (
    <div className="space-y-4">
      <Section title="Nutrition focus">
        <div>
          <label className="mb-1.5 block text-sm text-gray-600">Goals this week</label>
          <ChipRow
            options={GOAL_OPTIONS.map((g) => ({ value: g, label: g.charAt(0).toUpperCase() + g.slice(1) }))}
            selected={preferences.goals}
            onToggle={(v) => toggleInList('goals', v)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-gray-600">Additional notes (optional)</label>
          <input
            className={textInputClass}
            placeholder="e.g. lighter dinners, feeling low energy…"
            value={preferences.focusNotes}
            onChange={(e) => update('focusNotes', e.target.value)}
          />
        </div>
      </Section>

      <Section title="What I'm feeling this week">
        <div>
          <label className="mb-1.5 block text-sm text-gray-600">Cuisines or flavor profiles</label>
          <ChipRow options={CUISINE_OPTIONS} selected={preferences.cuisines} onToggle={(v) => toggleInList('cuisines', v)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-gray-600">Specific meals or ingredients I want</label>
          <textarea
            className={textInputClass}
            rows={2}
            placeholder="e.g. want salmon this week, craving a good salad…"
            value={preferences.cravings}
            onChange={(e) => update('cravings', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-gray-600">Anything to avoid</label>
          <input
            className={textInputClass}
            placeholder="e.g. no red meat, avoiding dairy, nothing too spicy…"
            value={preferences.avoid}
            onChange={(e) => update('avoid', e.target.value)}
          />
        </div>
      </Section>

      <Section title="⭐ Favorites">
        <p className="text-sm text-gray-500">Meals you've loved — save them here and request repeats any week.</p>
        <div className="flex gap-2">
          <input
            className={textInputClass}
            placeholder="e.g. Buffalo chicken salad, Greek bowl…"
            value={favInput}
            onChange={(e) => setFavInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addFavorite()
              }
            }}
          />
          <button
            type="button"
            onClick={addFavorite}
            className="flex-shrink-0 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-700"
          >
            Save
          </button>
        </div>

        {sortedFavorites.length === 0 ? (
          <p className="text-sm text-gray-400">No favorites saved yet. Add meals you love and bring them back any week.</p>
        ) : (
          <div className="space-y-1.5">
            {sortedFavorites.map((f) => (
              <div key={f.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2">
                <button
                  type="button"
                  onClick={() => toggleFavoriteField(f.id, 'starred')}
                  title={f.starred ? 'Unstar' : 'Star'}
                  className="flex-shrink-0 text-lg leading-none"
                >
                  {f.starred ? '⭐' : '☆'}
                </button>
                <span className="flex-1 text-sm text-gray-900">{f.name}</span>
                <button
                  type="button"
                  onClick={() => deleteFavorite(f.id)}
                  title="Remove"
                  className="flex-shrink-0 px-0.5 text-base leading-none text-gray-300 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {preferences.favorites.length > 0 && (
          <div>
            <p className="mb-1.5 mt-1 text-xs text-gray-500">Include this week (Claude will try to fit these in):</p>
            <div className="flex flex-wrap gap-1.5">
              {preferences.favorites.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFavoriteField(f.id, 'include')}
                  className={`min-h-[34px] rounded-full border-[1.5px] px-3 py-1.5 text-[13px] transition-colors ${
                    f.include
                      ? 'border-amber-300 bg-amber-50 font-medium text-amber-800'
                      : 'border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {f.starred ? '⭐ ' : ''}
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="Where I'm shopping">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm text-gray-600">Primary store</label>
            <select
              className={textInputClass}
              value={preferences.store}
              onChange={(e) => update('store', e.target.value)}
            >
              {STORE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'other' ? 'Other (specify →)' : s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-gray-600">If other, specify</label>
            <input
              className={textInputClass}
              placeholder="e.g. Mariano's, Aldi…"
              value={preferences.storeOther}
              onChange={(e) => update('storeOther', e.target.value)}
            />
          </div>
        </div>
      </Section>

      <Section title="What I already have">
        <label className="block text-sm text-gray-600">Leftovers, pantry staples, anything to use up</label>
        <textarea
          className={textInputClass}
          rows={3}
          placeholder="e.g. half bag of spinach, 2 chicken breasts, canned chickpeas, brown rice…"
          value={preferences.onhand}
          onChange={(e) => update('onhand', e.target.value)}
        />
      </Section>

      <Section title="Days I'm eating out / skipping">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[22rem] border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-1.5"></th>
                {MEAL_TYPES.map((meal) => (
                  <th key={meal} className="p-1.5 text-center text-xs font-medium capitalize text-gray-500">
                    {meal}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEKDAYS.map((day) => (
                <tr key={day}>
                  <td className="py-1 pr-2 text-sm font-medium text-gray-800">{day.slice(0, 3)}</td>
                  {MEAL_TYPES.map((meal) => (
                    <td key={meal} className="p-1.5 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${day} ${meal}`}
                        checked={preferences.skippedMeals[day][meal]}
                        onChange={() => toggleSkip(day, meal)}
                        className="h-5 w-5 cursor-pointer accent-blue-600"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-gray-600">Context (optional)</label>
          <input
            className={textInputClass}
            placeholder="e.g. Wednesday dinner is a work event…"
            value={preferences.eatOutNotes}
            onChange={(e) => update('eatOutNotes', e.target.value)}
          />
        </div>
      </Section>

      <Section title="Standing grocery items">
        <p className="text-sm text-gray-500">Always added to the grocery list, every week.</p>
        <div className="flex flex-wrap gap-1.5">
          {preferences.standingItems.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 rounded-full border-[1.5px] border-gray-200 bg-gray-50 py-1.5 pl-3.5 pr-2 text-[13px] text-gray-900"
            >
              {item}
              <button
                type="button"
                onClick={() => update('standingItems', preferences.standingItems.filter((_, idx) => idx !== i))}
                className="text-gray-300 hover:text-red-600"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <StandingItemAdder onAdd={(item) => update('standingItems', [...preferences.standingItems, item])} />
      </Section>
    </div>
  )
}

function StandingItemAdder({ onAdd }: { onAdd: (item: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <div className="flex gap-2">
      <input
        className={textInputClass}
        placeholder="Add a standing item"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            const trimmed = value.trim()
            if (trimmed) {
              onAdd(trimmed)
              setValue('')
            }
          }
        }}
      />
      <button
        type="button"
        onClick={() => {
          const trimmed = value.trim()
          if (trimmed) {
            onAdd(trimmed)
            setValue('')
          }
        }}
        className="flex-shrink-0 rounded-lg border border-gray-300 px-4 text-sm text-gray-700 hover:bg-gray-50"
      >
        Add
      </button>
    </div>
  )
}
