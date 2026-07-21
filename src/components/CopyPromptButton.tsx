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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClick}
          className="min-h-[44px] flex-1 rounded-lg bg-gray-900 px-4 text-[15px] font-semibold text-white hover:bg-gray-700"
        >
          {label}
        </button>
        <a
          href="https://claude.ai/new"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] flex-shrink-0 items-center rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Open Claude ↗
        </a>
      </div>
      {copied && (
        <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          ✓ Copied! Paste it into a Claude conversation.
        </p>
      )}
    </div>
  )
}
