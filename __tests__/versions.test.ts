/**
 * Unit tests for version handling functions
 */
import { sanitize, resolve } from '../src/versions.js'
import {
  expect,
  test,
  describe,
  jest,
  beforeEach,
  afterEach
} from '@jest/globals'

describe('sanitize', () => {
  test('returns latest for empty string', () => {
    expect(sanitize('')).toBe('latest')
  })

  test('returns latest for whitespace only', () => {
    expect(sanitize('   ')).toBe('latest')
  })

  test('returns latest for "latest"', () => {
    expect(sanitize('latest')).toBe('latest')
  })

  test('returns latest for "LATEST" (case insensitive)', () => {
    expect(sanitize('LATEST')).toBe('latest')
  })

  test('adds v prefix to version without one', () => {
    expect(sanitize('0.9.0')).toBe('v0.9.0')
  })

  test('keeps v prefix if already present', () => {
    expect(sanitize('v0.9.0')).toBe('v0.9.0')
  })

  test('trims whitespace from version', () => {
    expect(sanitize('  v0.9.0  ')).toBe('v0.9.0')
  })

  test('trims whitespace and adds v prefix', () => {
    expect(sanitize('  0.9.0  ')).toBe('v0.9.0')
  })

  test('normalizes uppercase V prefix to lowercase', () => {
    expect(sanitize('V1.2.3')).toBe('v1.2.3')
  })

  test('trims whitespace and normalizes uppercase V prefix', () => {
    expect(sanitize('  V0.9.0  ')).toBe('v0.9.0')
  })
})

describe('resolve', () => {
  let fetchSpy: jest.SpiedFunction<typeof globalThis.fetch>

  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  const jsonResponse = (body: unknown, status = 200): Response =>
    new Response(JSON.stringify(body), { status })

  // A Response body can only be read once, so mocks that serve multiple
  // calls must mint a fresh Response per call.
  const respondWith = (body: unknown): void => {
    fetchSpy.mockImplementation(async () => jsonResponse(body))
  }

  const STABLE_FIXTURE = [
    { tag_name: 'v0.10.2-beta.4', prerelease: true, draft: false },
    { tag_name: 'v0.10.2', prerelease: false, draft: false },
    { tag_name: 'v0.10.1', prerelease: false, draft: false },
    { tag_name: 'v0.9.2', prerelease: false, draft: false }
  ]

  const FULL_PAGE_OF_STABLE_V020S = Array.from({ length: 100 }, (_, i) => ({
    tag_name: `v0.20.${i}`,
    prerelease: false,
    draft: false
  }))

  test('resolves latest via the latest release endpoint', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({ tag_name: 'v0.10.2' }))

    await expect(resolve('latest', '')).resolves.toBe('v0.10.2')

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy.mock.calls[0][0]).toBe(
      'https://api.github.com/repos/mirurobotics/cli/releases/latest'
    )
  })

  test('resolves empty string via the latest release endpoint', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({ tag_name: 'v0.10.2' }))

    await expect(resolve('', '')).resolves.toBe('v0.10.2')

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy.mock.calls[0][0]).toBe(
      'https://api.github.com/repos/mirurobotics/cli/releases/latest'
    )
  })

  test('resolves v0.10 to the newest stable v0.10.x release', async () => {
    respondWith(STABLE_FIXTURE)

    await expect(resolve('v0.10', '')).resolves.toBe('v0.10.2')

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy.mock.calls[0][0]).toBe(
      'https://api.github.com/repos/mirurobotics/cli/releases?per_page=100&page=1'
    )
  })

  test('resolves v0 to the newest stable v0.x release', async () => {
    respondWith(STABLE_FIXTURE)

    await expect(resolve('v0', '')).resolves.toBe('v0.10.2')

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy.mock.calls[0][0]).toBe(
      'https://api.github.com/repos/mirurobotics/cli/releases?per_page=100&page=1'
    )
  })

  test('resolves v0.9 to the newest stable v0.9.x release', async () => {
    respondWith(STABLE_FIXTURE)

    await expect(resolve('v0.9', '')).resolves.toBe('v0.9.2')

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy.mock.calls[0][0]).toBe(
      'https://api.github.com/repos/mirurobotics/cli/releases?per_page=100&page=1'
    )
  })

  test('paginates past a full page of releases', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(FULL_PAGE_OF_STABLE_V020S))
    fetchSpy.mockResolvedValueOnce(
      jsonResponse([{ tag_name: 'v0.9.2', prerelease: false, draft: false }])
    )

    await expect(resolve('v0.9', '')).resolves.toBe('v0.9.2')

    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(fetchSpy.mock.calls[0][0]).toBe(
      'https://api.github.com/repos/mirurobotics/cli/releases?per_page=100&page=1'
    )
    expect(fetchSpy.mock.calls[1][0]).toBe(
      'https://api.github.com/repos/mirurobotics/cli/releases?per_page=100&page=2'
    )
  })

  test('stops paginating after 10 pages', async () => {
    respondWith(FULL_PAGE_OF_STABLE_V020S)

    await expect(resolve('v0.9', '')).rejects.toThrow('No stable release')

    expect(fetchSpy).toHaveBeenCalledTimes(10)
  })

  test('excludes prereleases and drafts from partial resolution', async () => {
    respondWith([
      { tag_name: 'v0.10.3', prerelease: true, draft: false },
      { tag_name: 'v0.10.2', prerelease: false, draft: true },
      { tag_name: 'v0.10.1', prerelease: false, draft: false }
    ])

    await expect(resolve('v0.10', '')).resolves.toBe('v0.10.1')
  })

  test('rejects when no stable release matches the partial version', async () => {
    respondWith([
      { tag_name: 'v0.10.3-beta.1', prerelease: true, draft: false },
      { tag_name: 'v0.10.2-rc.1', prerelease: true, draft: false }
    ])

    await expect(resolve('v0.10', '')).rejects.toThrow(
      'No stable release of mirurobotics/cli matches v0.10'
    )
  })

  test('passes through exact version without fetching', async () => {
    await expect(resolve('v0.10.2', '')).resolves.toBe('v0.10.2')

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  test('passes through exact prerelease version without fetching', async () => {
    await expect(resolve('v0.10.2-beta.4', '')).resolves.toBe('v0.10.2-beta.4')

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  test('does not resolve inherited prototype key "toString"', async () => {
    await expect(resolve('toString', '')).resolves.toBe('toString')

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  test('does not resolve inherited prototype key "constructor"', async () => {
    await expect(resolve('constructor', '')).resolves.toBe('constructor')

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  test('does not resolve inherited prototype key "hasOwnProperty"', async () => {
    await expect(resolve('hasOwnProperty', '')).resolves.toBe('hasOwnProperty')

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  test('rejects with the status code on an HTTP error', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({}, 403))

    await expect(resolve('latest', '')).rejects.toThrow(
      'GitHub API request failed: GET https://api.github.com/repos/mirurobotics/cli/releases/latest returned HTTP 403'
    )
  })

  test('surfaces the root cause when fetch wraps a network failure', async () => {
    const netError = new Error('getaddrinfo ENOTFOUND api.github.com')
    const fetchError = new TypeError('fetch failed', { cause: netError })
    fetchSpy.mockRejectedValue(fetchError)

    await expect(resolve('latest', '')).rejects.toMatchObject({
      message:
        'GitHub API request failed: GET https://api.github.com/repos/mirurobotics/cli/releases/latest (fetch failed: getaddrinfo ENOTFOUND api.github.com)',
      cause: fetchError
    })
  })

  test('rejects with the bare message when a network error has no cause', async () => {
    const netError = new Error('socket hang up')
    fetchSpy.mockRejectedValue(netError)

    await expect(resolve('latest', '')).rejects.toMatchObject({
      message:
        'GitHub API request failed: GET https://api.github.com/repos/mirurobotics/cli/releases/latest (socket hang up)',
      cause: netError
    })
  })

  test('rejects with the status code on an HTTP error while paginating', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({}, 500))

    await expect(resolve('v0.9', '')).rejects.toThrow(
      'GitHub API request failed: GET https://api.github.com/repos/mirurobotics/cli/releases?per_page=100&page=1 returned HTTP 500'
    )
  })

  test('rejects when the response body is not valid JSON', async () => {
    fetchSpy.mockResolvedValue(new Response('not json', { status: 200 }))

    await expect(resolve('latest', '')).rejects.toThrow(
      'GitHub API request failed: GET https://api.github.com/repos/mirurobotics/cli/releases/latest (invalid response body:'
    )
  })

  test('rejects when the latest release body is not a release object', async () => {
    respondWith({ message: 'unexpected' })

    await expect(resolve('latest', '')).rejects.toThrow(
      'GitHub API request failed: GET https://api.github.com/repos/mirurobotics/cli/releases/latest (invalid response body: expected a release object)'
    )
  })

  test('rejects when the release list body is not an array', async () => {
    respondWith({ message: 'unexpected' })

    await expect(resolve('v0.10', '')).rejects.toThrow(
      'GitHub API request failed: GET https://api.github.com/repos/mirurobotics/cli/releases?per_page=100&page=1 (invalid response body: expected an array of releases)'
    )
  })

  test('rejects when a release entry lacks a tag_name', async () => {
    respondWith([{ prerelease: false, draft: false }])

    await expect(resolve('v0.10', '')).rejects.toThrow(
      'invalid response body: expected an array of releases'
    )
  })

  test('sends auth headers when a token is provided', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({ tag_name: 'v0.10.2' }))

    await resolve('latest', 'tok123')

    const [, init] = fetchSpy.mock.calls[0]
    expect(init?.headers).toEqual({
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: 'Bearer tok123'
    })
    expect(init?.signal).toBeInstanceOf(AbortSignal)
  })

  test('omits the Authorization header without a token', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({ tag_name: 'v0.10.2' }))

    await resolve('latest', '')

    const [, init] = fetchSpy.mock.calls[0]
    expect(init?.headers).toEqual({
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    })
  })

  test('passes a proxy dispatcher to fetch when HTTPS_PROXY is set', async () => {
    process.env['HTTPS_PROXY'] = 'http://proxy.example.com:8080'
    try {
      fetchSpy.mockResolvedValue(jsonResponse({ tag_name: 'v0.10.2' }))

      await resolve('latest', '')

      const [, init] = fetchSpy.mock.calls[0]
      expect(init?.dispatcher).toBeDefined()
    } finally {
      delete process.env['HTTPS_PROXY']
    }
  })
})
