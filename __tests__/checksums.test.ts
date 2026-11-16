/**
 * Unit tests for release tarball checksums
 */
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { expect, test, describe } from '@jest/globals'
import { CHECKSUMS, getExpected, verify } from '../src/checksums.js'
import { ALIASES } from '../src/versions.js'

const ASSETS = ['cli_Linux_x86_64.tar.gz', 'cli_Linux_arm64.tar.gz']

describe('CHECKSUMS', () => {
  test('holds a SHA-256 for both assets of every version', () => {
    for (const byAsset of Object.values(CHECKSUMS)) {
      expect(Object.keys(byAsset).sort()).toEqual([...ASSETS].sort())
      for (const sha of Object.values(byAsset)) {
        expect(sha).toMatch(/^[0-9a-f]{64}$/)
      }
    }
  })

  test('pins every version an alias resolves to', () => {
    for (const version of Object.values(ALIASES)) {
      for (const asset of ASSETS) {
        expect(getExpected(version, asset)).toMatch(/^[0-9a-f]{64}$/)
      }
    }
  })
})

describe('getExpected', () => {
  test('returns the pinned SHA-256', () => {
    expect(getExpected('v0.12.4', 'cli_Linux_x86_64.tar.gz')).toBe(
      '13b83dbbe467c01f3fb08a44404a28f9cd61f97d6dafd0bd9eec2612fc631488'
    )
  })

  test('throws on a version with no pinned checksum', () => {
    expect(() => getExpected('v9.9.9', 'cli_Linux_x86_64.tar.gz')).toThrow(
      /No pinned checksum for Miru CLI v9.9.9 \(cli_Linux_x86_64.tar.gz\)/
    )
  })

  test('throws on an asset with no pinned checksum', () => {
    expect(() => getExpected('v0.12.4', 'cli_Darwin_arm64.tar.gz')).toThrow(
      /\(cli_Darwin_arm64.tar.gz\)/
    )
  })

  test('does not resolve inherited object keys', () => {
    // Without the own-key checks, CHECKSUMS.constructor.name is 'Object'.
    expect(() => getExpected('constructor', 'name')).toThrow(
      /No pinned checksum/
    )
    expect(() => getExpected('v0.12.4', 'constructor')).toThrow(
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
