/**
 * Unit tests for version handling functions
 */
import { sanitize, resolve } from '../src/versions.js'
import { expect, test, describe } from '@jest/globals'

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
  test.each([
    ['', 'v0.12.5'],
    ['latest', 'v0.12.5'],
    ['v0', 'v0.12.5'],
    ['v0.12', 'v0.12.5'],
    ['v0.11', 'v0.11.1'],
    ['v0.10', 'v0.10.3'],
    ['v0.9', 'v0.9.2'],
    ['v0.1', 'v0.1.2']
  ])('resolves %p to the newest pinned stable release, %s', (input, want) => {
    expect(resolve(input)).toBe(want)
  })

  test('skips prereleases', () => {
    // v0.12.5-beta.5 is pinned, but v0.12.5 is the newest stable release.
    expect(resolve('v0.12')).not.toMatch(/-/)
  })

  test('returns an exact version as is', () => {
    expect(resolve('v0.7.0')).toBe('v0.7.0')
    expect(resolve('v0.12.5-beta.5')).toBe('v0.12.5-beta.5')
  })

  test('returns a partial version with no pinned release as is', () => {
    expect(resolve('v9.9')).toBe('v9.9')
  })

  test('returns other input as is', () => {
    expect(resolve('main')).toBe('main')
  })
})
