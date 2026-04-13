/**
 * Maps an Atlassian Statuspage indicator value to a human-friendly color string
 * and an emoji for visual display in GitHub Actions logs.
 *
 * Indicator values come from the Atlassian Statuspage API:
 *   GET /api/v2/status.json  →  { status: { indicator, description } }
 */
export type Indicator = 'none' | 'minor' | 'major' | 'critical' | 'maintenance' | string;
export type Color = 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'unknown';
export interface IndicatorMeta {
    color: Color;
    emoji: string;
}
export declare function indicatorToMeta(indicator: Indicator): IndicatorMeta;
export interface StatuspageStatus {
    indicator: Indicator;
    description: string;
}
export interface StatuspageResponse {
    page: {
        id: string;
        name: string;
        url: string;
    };
    status: StatuspageStatus;
}
/**
 * Fetches the status JSON from an Atlassian Statuspage-compatible API.
 *
 * @param baseUrl - Base URL of the status page (e.g. https://status.pantheon.io)
 * @returns Parsed status response
 * @throws Error when the HTTP request fails or the response is not valid JSON
 */
export declare function fetchStatus(baseUrl: string): Promise<StatuspageResponse>;
