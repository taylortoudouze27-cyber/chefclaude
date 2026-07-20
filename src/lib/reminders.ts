/**
 * Apple Reminders integration.
 *
 * STUBBED: Apple Reminders MCP only runs locally on a Mac, which this app's
 * dev session may not have access to. This function simulates the push so
 * the UI flow is complete end-to-end. Swap the body of `pushToReminders`
 * for a real MCP client call when running where the MCP server is reachable.
 */

export interface ReminderPushResult {
  listName: string
  itemCount: number
  items: string[]
}

const SIMULATED_LATENCY_MS = 500

export async function pushToReminders(
  listName: string,
  items: string[],
): Promise<ReminderPushResult> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))

  // eslint-disable-next-line no-console
  console.info(`[reminders stub] Would push ${items.length} item(s) to "${listName}":`, items)

  return { listName, itemCount: items.length, items }
}
