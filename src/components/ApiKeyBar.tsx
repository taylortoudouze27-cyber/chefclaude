import { useState } from 'react'

interface ApiKeyBarProps {
  apiKey: string
  onChange: (key: string) => void
}

export default function ApiKeyBar({ apiKey, onChange }: ApiKeyBarProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="mb-6 space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
      <span className="font-medium text-amber-900">Anthropic API key</span>
      <div className="flex items-center gap-2">
        <input
          type={visible ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-ant-..."
          className="min-w-0 flex-1 rounded border border-amber-300 bg-white px-2 py-1 font-mono text-xs text-amber-950 outline-none focus:border-amber-500"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="flex-shrink-0 rounded px-2 py-1 text-xs text-amber-700 hover:bg-amber-100"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      <p className="text-xs text-amber-700">Kept in memory only, never saved or sent anywhere but Anthropic.</p>
    </div>
  )
}
