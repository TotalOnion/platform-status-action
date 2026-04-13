import * as core from '@actions/core'
import * as status from '../src/status'
import { run } from '../src/index'

jest.mock('@actions/core')
jest.mock('../src/status')

const mockCore = core as jest.Mocked<typeof core>
const mockStatus = status as jest.Mocked<typeof status>

const mockSummary = {
  addRaw: jest.fn().mockReturnThis(),
  write: jest.fn().mockResolvedValue(undefined),
}

beforeEach(() => {
  jest.resetAllMocks()
  ;(mockCore.summary as unknown) = mockSummary
  mockSummary.addRaw.mockReturnThis()
  mockSummary.write.mockResolvedValue(undefined)
})

function setupInputs(inputs: Record<string, string>) {
  mockCore.getInput.mockImplementation((name: string) => inputs[name] ?? '')
}

const basePayload: status.StatuspageResponse = {
  page: { id: 'abc', name: 'Pantheon Status', url: 'https://status.pantheon.io' },
  status: { indicator: 'none', description: 'All Systems Operational' },
}

describe('run()', () => {
  it('logs status info and sets outputs for a healthy page', async () => {
    setupInputs({ status_page_url: 'https://status.pantheon.io', fail_on: '' })
    mockStatus.fetchStatus.mockResolvedValue(basePayload)
    mockStatus.indicatorToMeta.mockReturnValue({ color: 'green', emoji: '🟢' })

    await run()

    expect(mockCore.setOutput).toHaveBeenCalledWith('indicator', 'none')
    expect(mockCore.setOutput).toHaveBeenCalledWith('color', 'green')
    expect(mockCore.setOutput).toHaveBeenCalledWith('status_description', 'All Systems Operational')
    expect(mockCore.setFailed).not.toHaveBeenCalled()
    expect(mockSummary.write).toHaveBeenCalled()
  })

  it('does NOT fail when indicator is not in fail_on list', async () => {
    setupInputs({ status_page_url: 'https://status.pantheon.io', fail_on: 'critical' })
    mockStatus.fetchStatus.mockResolvedValue({
      ...basePayload,
      status: { indicator: 'minor', description: 'Minor incident' },
    })
    mockStatus.indicatorToMeta.mockReturnValue({ color: 'yellow', emoji: '🟡' })

    await run()

    expect(mockCore.setFailed).not.toHaveBeenCalled()
  })

  it('calls setFailed when indicator matches fail_on', async () => {
    setupInputs({ status_page_url: 'https://status.pantheon.io', fail_on: 'major,critical' })
    mockStatus.fetchStatus.mockResolvedValue({
      ...basePayload,
      status: { indicator: 'critical', description: 'Major outage' },
    })
    mockStatus.indicatorToMeta.mockReturnValue({ color: 'red', emoji: '🔴' })

    await run()

    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('"critical"')
    )
  })

  it('calls setFailed when fail_on uses mixed case/spaces', async () => {
    setupInputs({ status_page_url: 'https://status.pantheon.io', fail_on: ' Major , Critical ' })
    mockStatus.fetchStatus.mockResolvedValue({
      ...basePayload,
      status: { indicator: 'major', description: 'Service disruption' },
    })
    mockStatus.indicatorToMeta.mockReturnValue({ color: 'orange', emoji: '🟠' })

    await run()

    expect(mockCore.setFailed).toHaveBeenCalled()
  })

  it('calls setFailed with the error message when fetchStatus throws', async () => {
    setupInputs({ status_page_url: 'https://bad-url.example.com', fail_on: '' })
    mockStatus.fetchStatus.mockRejectedValue(new Error('Network error'))

    await run()

    expect(mockCore.setFailed).toHaveBeenCalledWith('Network error')
  })

  it('calls setFailed with a generic message for non-Error throws', async () => {
    setupInputs({ status_page_url: 'https://bad-url.example.com', fail_on: '' })
    mockStatus.fetchStatus.mockRejectedValue('some string error')

    await run()

    expect(mockCore.setFailed).toHaveBeenCalledWith('An unexpected error occurred')
  })
})
