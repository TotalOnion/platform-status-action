/**
 * Maps an Atlassian Statuspage indicator value to a human-friendly color string
 * and an emoji for visual display in GitHub Actions logs.
 *
 * Indicator values come from the Atlassian Statuspage API:
 *   GET /api/v2/status.json  →  { status: { indicator, description } }
 */

export type Indicator = 'none' | 'minor' | 'major' | 'critical' | 'maintenance' | string

export type Color = 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'unknown'

export interface IndicatorMeta {
  color: Color
  emoji: string
}

const INDICATOR_MAP: Record<string, IndicatorMeta> = {
  none: { color: 'green', emoji: '🟢' },
  minor: { color: 'yellow', emoji: '🟡' },
  major: { color: 'orange', emoji: '🟠' },
  critical: { color: 'red', emoji: '🔴' },
  maintenance: { color: 'blue', emoji: '🔵' },
}

export function indicatorToMeta(indicator: Indicator): IndicatorMeta {
  return INDICATOR_MAP[indicator.toLowerCase()] ?? { color: 'unknown', emoji: '⚪' }
}

export interface StatuspageStatus {
  indicator: Indicator
  description: string
}

export interface StatuspageResponse {
  page: {
    id: string
    name: string
    url: string
  }
  status: StatuspageStatus
}

/**
 * Fetches the status JSON from an Atlassian Statuspage-compatible API.
 *
 * @param baseUrl - Base URL of the status page (e.g. https://status.pantheon.io)
 * @returns Parsed status response
 * @throws Error when the HTTP request fails or the response is not valid JSON
 */
export async function fetchStatus(baseUrl: string): Promise<StatuspageResponse> {
  const url = `${baseUrl.replace(/\/$/, '')}/api/v2/status.json`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch status page: HTTP ${response.status} ${response.statusText} (${url})`)
  }

  const data = (await response.json()) as StatuspageResponse

  if (!data?.status?.indicator) {
    throw new Error(`Unexpected response format from status page at ${url}`)
  }

  return data
}
