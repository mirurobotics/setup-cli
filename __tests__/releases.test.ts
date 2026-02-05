/**
 * Unit tests for release URL functions
 */
import { expect, test, describe, jest, beforeEach } from '@jest/globals'

// Mock os module before importing releases
jest.unstable_mockModule('os', () => ({
  default: {
    platform: jest.fn(),
    arch: jest.fn()
  },
  platform: jest.fn(),
  arch: jest.fn()
}))

// Import after mocking
const os = await import('os')
const { formatDownloadUrl, getDownloadUrl, mapPlatform, mapArch } = await import('../src/releases.js')

describe('formatDownloadUrl', () => {
  test('formats URL with version, platform, and arch', () => {
    const url = formatDownloadUrl({
      version: 'v0.9.0',
      platform: 'Linux',
      arch: 'x86_64'
    })
    expect(url).toBe(
      'https://github.com/mirurobotics/cli/releases/download/v0.9.0/cli_Linux_x86_64.tar.gz'
    )
  })

  test('formats URL with different version', () => {
    const url = formatDownloadUrl({
      version: 'v1.0.0',
      platform: 'Linux',
      arch: 'arm64'
    })
    expect(url).toBe(
      'https://github.com/mirurobotics/cli/releases/download/v1.0.0/cli_Linux_arm64.tar.gz'
    )
  })
})

describe('getDownloadUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('gets download URL for Linux x64', () => {
    ;(os.platform as jest.Mock).mockReturnValue('linux')
    ;(os.arch as jest.Mock).mockReturnValue('x64')

    const url = getDownloadUrl('v0.9.0')
    expect(url).toBe(
      'https://github.com/mirurobotics/cli/releases/download/v0.9.0/cli_Linux_x86_64.tar.gz'
    )
  })

  test('gets download URL for Linux arm64', () => {
    ;(os.platform as jest.Mock).mockReturnValue('linux')
    ;(os.arch as jest.Mock).mockReturnValue('arm64')

    const url = getDownloadUrl('v0.9.0')
    expect(url).toBe(
      'https://github.com/mirurobotics/cli/releases/download/v0.9.0/cli_Linux_arm64.tar.gz'
    )
  })
})

describe('mapPlatform', () => {
  test('maps linux to Linux', () => {
    expect(mapPlatform('linux')).toBe('Linux')
  })

  test('passes through unknown platform', () => {
    expect(mapPlatform('darwin')).toBe('darwin')
  })

  test('passes through win32', () => {
    expect(mapPlatform('win32')).toBe('win32')
  })
})

describe('mapArch', () => {
  test('maps x64 to x86_64', () => {
    expect(mapArch('x64')).toBe('x86_64')
  })

  test('passes through arm64', () => {
    expect(mapArch('arm64')).toBe('arm64')
  })

  test('passes through unknown arch', () => {
    expect(mapArch('ia32')).toBe('ia32')
  })
})

