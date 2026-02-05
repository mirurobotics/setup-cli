/**
 * Unit tests for version handling functions
 */
import { sanitize, resolve, LATEST_VERSION } from '../src/versions.js'
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
})

describe('resolve', () => {
  test('resolves empty string to LATEST_VERSION', () => {
    expect(resolve('')).toBe(LATEST_VERSION)
  })

  test('resolves latest to LATEST_VERSION', () => {
    expect(resolve('latest')).toBe(LATEST_VERSION)
  })

  test('resolves v0 to LATEST_VERSION', () => {
    expect(resolve('v0')).toBe(LATEST_VERSION)
  })

  test('resolves v0.9 to LATEST_VERSION', () => {
    expect(resolve('v0.9')).toBe(LATEST_VERSION)
  })

  test('passes through exact version', () => {
    expect(resolve('v0.9.1')).toBe('v0.9.1')
  })

  test('passes through unknown version as-is', () => {
    expect(resolve('v1.0.0')).toBe('v1.0.0')
  })

  test('passes through unknown partial version as-is', () => {
    expect(resolve('v1.2')).toBe('v1.2')
  })
})
