/**
 * The latest stable version of the Miru CLI.
 * Update this when releasing a new version.
 */
export const LATEST_VERSION = 'v0.9.1'

/**
 * Sanitize version to strip whitespace and ensure it has a 'v' prefix
 */
export const sanitize = (version: string): string => {
  version = version.trim()
  if (!version || version.toLowerCase() === 'latest') {
    return 'latest'
  }
  return `v${version.replace(/^v/, '')}`
}

/**
 * Resolve the input version to a specific version. If the version is empty or latest,
 * the specific version is returned in the format of vX.Y.Z. If the version is not
 * found, it is returned as is.
 */
export const resolve = (version: string): string => {
  const mappings: Record<string, string> = {
    '': LATEST_VERSION,
    latest: LATEST_VERSION,
    v0: LATEST_VERSION,
    'v0.9': LATEST_VERSION
  }
  return mappings[version] || version
}
