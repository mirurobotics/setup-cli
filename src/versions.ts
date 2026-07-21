import * as semver from 'semver'

const API_BASE = 'https://api.github.com/repos/mirurobotics/cli'

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
    response = await fetch(url, { headers })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`GitHub API request failed: GET ${url} (${reason})`, {
      cause: error
    })
  }
  if (!response.ok) {
    throw new Error(
      `GitHub API request failed: GET ${url} returned HTTP ${response.status}`
    )
  }
  return response.json()
}

const resolveLatest = async (token: string): Promise<string> => {
  const release = (await fetchJson(
    `${API_BASE}/releases/latest`,
    token
  )) as Release
  return release.tag_name
}

const resolvePartial = async (
  version: string,
  token: string
): Promise<string> => {
  const tags: string[] = []
  for (let page = 1; page <= 10; page++) {
    const releases = (await fetchJson(
      `${API_BASE}/releases?per_page=100&page=${page}`,
      token
    )) as Release[]
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
 * "latest" resolves to the newest stable release of mirurobotics/cli, and
 * partial versions (vX or vX.Y) resolve to the newest stable release matching
 * that range. Unrecognized strings are returned as is.
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
