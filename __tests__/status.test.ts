import { indicatorToMeta, fetchStatus } from '../src/status'

describe('indicatorToMeta', () => {
  it('returns green for "none"', () => {
    const meta = indicatorToMeta('none')
    expect(meta.color).toBe('green')
    expect(meta.emoji).toBe('🟢')
  })

  it('returns yellow for "minor"', () => {
    const meta = indicatorToMeta('minor')
    expect(meta.color).toBe('yellow')
    expect(meta.emoji).toBe('🟡')
  })

  it('returns orange for "major"', () => {
    const meta = indicatorToMeta('major')
    expect(meta.color).toBe('orange')
    expect(meta.emoji).toBe('🟠')
  })

  it('returns red for "critical"', () => {
    const meta = indicatorToMeta('critical')
    expect(meta.color).toBe('red')
    expect(meta.emoji).toBe('🔴')
  })

  it('returns blue for "maintenance"', () => {
    const meta = indicatorToMeta('maintenance')
    expect(meta.color).toBe('blue')
    expect(meta.emoji).toBe('🔵')
  })

  it('returns unknown for an unrecognised indicator', () => {
    const meta = indicatorToMeta('something_new')
    expect(meta.color).toBe('unknown')
    expect(meta.emoji).toBe('⚪')
  })

  it('is case-insensitive', () => {
    expect(indicatorToMeta('NONE').color).toBe('green')
    expect(indicatorToMeta('Critical').color).toBe('red')
  })
})

describe('fetchStatus', () => {
  const mockFetch = jest.fn()

  beforeAll(() => {
    ;(global as unknown as { fetch: jest.Mock }).fetch = mockFetch
  })

  afterAll(() => {
    delete (global as unknown as { fetch?: jest.Mock }).fetch
  })

  afterEach(() => {
    mockFetch.mockReset()
  })

  const makeResponse = (body: unknown, ok = true, status = 200) =>
    ({
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      json: async () => body,
    }) as unknown as Response

  it('fetches and returns parsed status', async () => {
    const payload = {
      page: { id: 'abc', name: 'My Status Page', url: 'https://status.example.com' },
      status: { indicator: 'none', description: 'All Systems Operational' },
    }
    mockFetch.mockResolvedValue(makeResponse(payload))

    const result = await fetchStatus('https://status.example.com')
    expect(result.status.indicator).toBe('none')
    expect(result.status.description).toBe('All Systems Operational')
    expect(mockFetch).toHaveBeenCalledWith('https://status.example.com/api/v2/status.json')
  })

  it('strips trailing slash from base URL', async () => {
    const payload = {
      page: { id: 'abc', name: 'Test', url: 'https://status.example.com/' },
      status: { indicator: 'minor', description: 'Minor incident' },
    }
    mockFetch.mockResolvedValue(makeResponse(payload))

    await fetchStatus('https://status.example.com/')
    expect(mockFetch).toHaveBeenCalledWith('https://status.example.com/api/v2/status.json')
  })

  it('throws when the HTTP response is not ok', async () => {
    mockFetch.mockResolvedValue(makeResponse(null, false, 503))
    await expect(fetchStatus('https://status.example.com')).rejects.toThrow(
      'Failed to fetch status page: HTTP 503'
    )
  })

  it('throws when the response body is missing the indicator field', async () => {
    mockFetch.mockResolvedValue(makeResponse({ page: {}, status: {} }))
    await expect(fetchStatus('https://status.example.com')).rejects.toThrow(
      'Unexpected response format'
    )
  })
})
