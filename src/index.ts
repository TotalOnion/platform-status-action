import * as core from '@actions/core'
import { fetchStatus, indicatorToMeta } from './status'

/**
 * Parses the `fail_on` input into a set of indicator strings.
 */
function parseFailOn(raw: string): Set<string> {
  return new Set(
    raw
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
  )
}

/**
 * Builds the markdown content written to the GitHub Actions job summary.
 */
function buildSummary(
  pageUrl: string,
  pageName: string,
  indicator: string,
  description: string,
  color: string,
  emoji: string
): string {
  return [
    `## ${emoji} Platform Status`,
    '',
    `| Field | Value |`,
    `|-------|-------|`,
    `| **Page** | [${pageName}](${pageUrl}) |`,
    `| **Indicator** | \`${indicator}\` |`,
    `| **Color** | ${color} |`,
    `| **Description** | ${description} |`,
    '',
  ].join('\n')
}

export async function run(): Promise<void> {
  try {
    const statusPageUrl = core.getInput('status_page_url', { required: true })
    const failOnRaw = core.getInput('fail_on')
    const failOnSet = parseFailOn(failOnRaw)

    core.info(`Fetching status from: ${statusPageUrl}`)

    const data = await fetchStatus(statusPageUrl)
    const { indicator, description } = data.status
    const { color, emoji } = indicatorToMeta(indicator)

    // Log status to the workflow run
    core.info(`${emoji}  Status: ${description}`)
    core.info(`     Indicator: ${indicator}`)
    core.info(`     Color:     ${color}`)

    // Set outputs so downstream steps can consume them
    core.setOutput('indicator', indicator)
    core.setOutput('color', color)
    core.setOutput('status_description', description)

    // Write a rich summary to the job summary panel
    const summaryContent = buildSummary(
      data.page.url,
      data.page.name,
      indicator,
      description,
      color,
      emoji
    )
    await core.summary.addRaw(summaryContent).write()

    // Optionally fail the workflow for severe indicators
    if (failOnSet.has(indicator.toLowerCase())) {
      core.setFailed(
        `Status page reports indicator "${indicator}" (${description}). ` +
          `The action is configured to fail on: ${[...failOnSet].join(', ')}.`
      )
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('An unexpected error occurred')
    }
  }
}

// Only call run() when executed directly (not when imported in tests)
/* istanbul ignore next */
if (require.main === module) {
  run()
}
