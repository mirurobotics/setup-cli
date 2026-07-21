import { HttpClient } from '@actions/http-client'
import * as semver from 'semver'

const API_BASE = 'https://api.github.com/repos/mirurobotics/cli'

const REQUEST_TIMEOUT_MS = 30_000

// Used only to derive a proxy dispatcher from the runner's
// HTTPS_PROXY/HTTP_PROXY/NO_PROXY env vars, so version resolution honors
// the same proxy configuration as tc.downloadTool.
const httpClient = new HttpClient()

/**
 * Sanitize version to strip whitespace and ensure it has a 'v' prefix
 */
export const sanitize = (version: string): string => {
  version = version.trim()
  if (!version || version.toLowerCase() === 'latest') {
    return 'latest'
  }
  return `v${version.replace(/^v/i, '')}`
}

interface Release {
  tag_name: string
  draft: boolean
  prerelease: boolean
}

const isRelease = (value: unknown): value is Release =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>).tag_name === 'string'

const fetchJson = async (url: string, token: string): Promise<unknown> => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  let response: Response
  try {
    // The cast bridges undici's ProxyAgent type (from @actions/http-client)
    // and the undici-types Dispatcher type used by @types/node's fetch.
    response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      dispatcher: httpClient.getAgentDispatcher(
        url
      ) as RequestInit['dispatcher']
    })
  } catch (error) {
    let reason = error instanceof Error ? error.message : String(error)
    // Node's fetch wraps network failures as TypeError('fetch failed') and
    // hides the root cause (ENOTFOUND, ECONNREFUSED, ...) in error.cause.
    if (
      error instanceof Error &&
      error.cause instanceof Error &&
      error.cause.message
    ) {
      reason += `: ${error.cause.message}`
    }
    throw new Error(`GitHub API request failed: GET ${url} (${reason})`, {
      cause: error
    })
  }
  if (!response.ok) {
    throw new Error(
      `GitHub API request failed: GET ${url} returned HTTP ${response.status}`
    )
  }
  try {
    return await response.json()
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(
      `GitHub API request failed: GET ${url} (invalid response body: ${reason})`,
      { cause: error }
    )
  }
}

const resolveLatest = async (token: string): Promise<string> => {
  const url = `${API_BASE}/releases/latest`
  const release = await fetchJson(url, token)
  if (!isRelease(release)) {
    throw new Error(
      `GitHub API request failed: GET ${url} (invalid response body: expected a release object)`
    )
  }
  return release.tag_name
}

const resolvePartial = async (
  version: string,
  token: string
): Promise<string> => {
  const tags: string[] = []
  for (let page = 1; page <= 10; page++) {
    const url = `${API_BASE}/releases?per_page=100&page=${page}`
    const body = await fetchJson(url, token)
    if (!Array.isArray(body) || !body.every(isRelease)) {
      throw new Error(
        `GitHub API request failed: GET ${url} (invalid response body: expected an array of releases)`
      )
    }
    const releases: Release[] = body
    for (const release of releases) {
      if (!release.draft && !release.prerelease) {
        tags.push(release.tag_name)
      }
    }
    if (releases.length < 100) {
      break
    }
  }
  const range = version.replace(/^v/, '')
  const match = semver.maxSatisfying(tags, range)
  if (!match) {
    throw new Error(`No stable release of mirurobotics/cli matches ${version}`)
  }
  return match
}

/**
 * Resolve the input version to a specific version. Exact versions (vX.Y.Z,
 * including prerelease suffixes) pass through without any API call. Empty or
 * "latest" resolves to the most recently published stable release of
 * mirurobotics/cli, and partial versions (vX or vX.Y) resolve to the highest
 * stable release matching that range. Unrecognized strings are returned as is.
 */
export const resolve = async (
  version: string,
  token: string
): Promise<string> => {
  if (/^v\d+\.\d+\.\d+/.test(version)) {
    return version
  }
  if (version === '' || version === 'latest') {
    return resolveLatest(token)
  }
  if (/^v\d+(\.\d+)?$/.test(version)) {
    return resolvePartial(version, token)
  }
  return version
}
