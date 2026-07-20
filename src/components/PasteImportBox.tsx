import { useState } from 'react'

interface PasteImportBoxProps {
  label: string
  buttonLabel?: string
  onImport: (text: string) => void
  error: string | null
}

export default function PasteImportBox({ label, buttonLabel = 'Import', onImport, error }: PasteImportBoxProps) {
  const [value, setValue] = useState('')

  return (
    <div className="space-y-2">
      <label className="block text-sm text-gray-600">{label}</label>
      <textarea
        rows={6}
        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 font-mono text-xs outline-none focus:border-gray-400 focus:bg-white"
        placeholder="Paste Claude's response here…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="button"
        onClick={() => onImport(value)}
        disabled={!value.trim()}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonLabel}
      </button>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  )
}
