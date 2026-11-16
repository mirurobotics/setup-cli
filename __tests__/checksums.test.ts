/**
 * Unit tests for release tarball checksums
 */
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { expect, test, describe } from '@jest/globals'
import { CHECKSUMS, getExpected, verify } from '../src/checksums.js'
import { LATEST_VERSION, resolve } from '../src/versions.js'

const ARCHES = ['x86_64', 'arm64']

describe('CHECKSUMS', () => {
  test('holds a SHA-256 for both architectures of every version', () => {
    for (const byArch of Object.values(CHECKSUMS)) {
      expect(Object.keys(byArch).sort()).toEqual([...ARCHES].sort())
      for (const sha of Object.values(byArch)) {
        expect(sha).toMatch(/^[0-9a-f]{64}$/)
      }
    }
  })

  test('pins every version that resolve can return', () => {
    const inputs = ['latest', 'v0', 'v0.9', 'v0.10', 'v0.11', 'v0.12']
    const versions = [LATEST_VERSION, ...inputs.map(resolve)]
    for (const version of versions) {
      for (const arch of ARCHES) {
        expect(getExpected(version, arch)).toMatch(/^[0-9a-f]{64}$/)
      }
    }
  })
})

describe('getExpected', () => {
  test('returns the pinned SHA-256', () => {
    expect(getExpected('v0.12.4', 'x86_64')).toBe(
      '13b83dbbe467c01f3fb08a44404a28f9cd61f97d6dafd0bd9eec2612fc631488'
    )
  })

  test('throws on a version with no pinned checksum', () => {
    expect(() => getExpected('v9.9.9', 'x86_64')).toThrow(
      /No pinned checksum for Miru CLI v9.9.9 \(x86_64\)/
    )
  })

  test('throws on an architecture with no pinned checksum', () => {
    expect(() => getExpected('v0.12.4', 'ia32')).toThrow(/\(ia32\)/)
  })

  test('does not resolve inherited object keys as versions', () => {
    expect(() => getExpected('constructor', 'x86_64')).toThrow(
      /No pinned checksum/
    )
  })
})

describe('verify', () => {
  const writeTarball = (content: string): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'setup-cli-'))
    const file = path.join(dir, 'cli.tar.gz')
    fs.writeFileSync(file, content)
    return file
  }
  const sha256 = (content: string): string =>
    crypto.createHash('sha256').update(content).digest('hex')

  test('accepts a file with the expected SHA-256', async () => {
    const file = writeTarball('release')

    await expect(verify(file, sha256('release'))).resolves.toBeUndefined()
  })

  test('rejects a file with a different SHA-256', async () => {
    const file = writeTarball('tampered')

    await expect(verify(file, sha256('release'))).rejects.toThrow(
      `Checksum mismatch for ${file}: expected ${sha256('release')}, got ${sha256('tampered')}`
    )
  })
})
