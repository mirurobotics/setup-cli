import * as semver from 'semver'
import { CHECKSUMS } from './checksums.js'

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

const PARTIAL_VERSION = /^v(\d+)(\.\d+)?$/

/**
 * Resolve the input version to a specific version. Empty, "latest" and partial
 * versions (e.g. v0.12) resolve to the newest stable release in CHECKSUMS that
 * matches them, in the format vX.Y.Z. Any other version is returned as is.
 */
export const resolve = (version: string): string => {
  const range =
    version === '' || version === 'latest'
      ? '*'
      : PARTIAL_VERSION.test(version)
        ? `${version.slice(1)}.x`
        : undefined
  if (range === undefined) {
    return version
  }
  return semver.maxSatisfying(Object.keys(CHECKSUMS), range) ?? version
}
