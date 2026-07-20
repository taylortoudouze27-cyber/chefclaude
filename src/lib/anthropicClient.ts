const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

// Latest Sonnet model as of this build. The brief referenced "claude-sonnet-4-6",
// which isn't a real model id — update this if your account uses a different one.
export const DEFAULT_MODEL = 'claude-sonnet-5'

export class AnthropicApiError extends Error {}

interface GenerateJsonOptions {
  apiKey: string
  system: string
  userPrompt: string
  model?: string
  maxTokens?: number
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return fenced ? fenced[1] : trimmed
}

export async function generateJson<T>(options: GenerateJsonOptions): Promise<T> {
  const { apiKey, system, userPrompt, model = DEFAULT_MODEL, maxTokens = 4096 } = options

  if (!apiKey) {
    throw new AnthropicApiError('Missing Anthropic API key. Add it in Settings first.')
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      // Required for calling the Anthropic API directly from a browser.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new AnthropicApiError(
      `Anthropic API request failed (${response.status}): ${body || response.statusText}`,
    )
  }

  const data = await response.json()
  const text: string | undefined = data?.content?.[0]?.text
  if (!text) {
    throw new AnthropicApiError('Anthropic API returned no text content.')
  }

  const jsonText = stripCodeFence(text)
  try {
    return JSON.parse(jsonText) as T
  } catch {
    throw new AnthropicApiError(`Could not parse JSON from model response: ${jsonText.slice(0, 200)}`)
  }
}
