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

  test('normalizes uppercase V prefix to lowercase', () => {
    expect(sanitize('V1.2.3')).toBe('v1.2.3')
  })

  test('trims whitespace and normalizes uppercase V prefix', () => {
    expect(sanitize('  V0.9.0  ')).toBe('v0.9.0')
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

  test('resolves v0.9 to v0.9.2 (pinned)', () => {
    expect(resolve('v0.9')).toBe('v0.9.2')
  })

  test('resolves v0.10 to LATEST_VERSION', () => {
    expect(resolve('v0.10')).toBe(LATEST_VERSION)
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

  test('does not resolve inherited prototype key "toString"', () => {
    expect(resolve('toString')).toBe('toString')
  })

  test('does not resolve inherited prototype key "constructor"', () => {
    expect(resolve('constructor')).toBe('constructor')
  })

  test('does not resolve inherited prototype key "hasOwnProperty"', () => {
    expect(resolve('hasOwnProperty')).toBe('hasOwnProperty')
  })
})
