import { useState } from 'react'
import { copyToClipboard } from '../lib/clipboard'

interface CopyPromptButtonProps {
  label: string
  getText: () => string
}

export default function CopyPromptButton({ label, getText }: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    await copyToClipboard(getText())
    setCopied(true)
    setTimeout(() => setCopied(false), 3500)
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className="min-h-[44px] w-full rounded-lg bg-gray-900 px-4 text-[15px] font-semibold text-white hover:bg-gray-700"
      >
        {label}
      </button>
      {copied && (
        <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          ✓ Copied! Paste it into a Claude conversation.
        </p>
      )}
    </div>
  )
}
