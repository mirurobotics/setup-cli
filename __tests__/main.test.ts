/**
 * Unit tests for the main action entry point
 */
import * as path from 'path'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as url from 'url'
import { expect, test, describe, jest, beforeEach } from '@jest/globals'

// Mock @actions/core
const mockGetInput = jest.fn()
const mockSetOutput = jest.fn()
const mockAddPath = jest.fn()
const mockInfo = jest.fn()
const mockSetFailed = jest.fn()

jest.unstable_mockModule('@actions/core', () => ({
  getInput: mockGetInput,
  setOutput: mockSetOutput,
  addPath: mockAddPath,
  info: mockInfo,
  setFailed: mockSetFailed
}))

// Mock @actions/tool-cache
const mockDownloadTool = jest.fn()
const mockExtractTar = jest.fn()

jest.unstable_mockModule('@actions/tool-cache', () => ({
  downloadTool: mockDownloadTool,
  extractTar: mockExtractTar
}))

// Mock versions module
const MOCK_LATEST_VERSION = 'v0.9.1'
jest.unstable_mockModule('../src/versions.js', () => ({
  LATEST_VERSION: MOCK_LATEST_VERSION,
  sanitize: jest.fn((v: string) => v || 'latest'),
  resolve: jest.fn((v: string) => (v === 'latest' ? MOCK_LATEST_VERSION : v))
}))

// Mock releases module
jest.unstable_mockModule('../src/releases.js', () => ({
  getDownloadUrl: jest.fn(() => 'https://example.com/cli.tar.gz')
}))

// Import after mocking
const { run } = await import('../src/main.js')

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDownloadTool.mockResolvedValue('/tmp/cli.tar.gz')
    mockExtractTar.mockResolvedValue('/tmp/cli')
  })

  test('installs CLI with default version', async () => {
    mockGetInput.mockReturnValue('')

    await run()

    expect(mockGetInput).toHaveBeenCalledWith('version')
    expect(mockDownloadTool).toHaveBeenCalled()
    expect(mockExtractTar).toHaveBeenCalledWith('/tmp/cli.tar.gz')
    expect(mockAddPath).toHaveBeenCalledWith('/tmp/cli')
    expect(mockSetOutput).toHaveBeenCalledWith('version', MOCK_LATEST_VERSION)
    expect(mockInfo).toHaveBeenCalledWith(
      `Miru CLI ${MOCK_LATEST_VERSION} installed successfully`
    )
  })

  test('installs CLI with specific version', async () => {
    mockGetInput.mockReturnValue('v1.0.0')

    await run()

    expect(mockGetInput).toHaveBeenCalledWith('version')
    expect(mockSetOutput).toHaveBeenCalledWith('version', 'v1.0.0')
    expect(mockInfo).toHaveBeenCalledWith(
      'Miru CLI v1.0.0 installed successfully'
    )
  })

  test('handles download error', async () => {
    mockGetInput.mockReturnValue('v0.9.0')
    mockDownloadTool.mockRejectedValue(new Error('Download failed'))

    await run()

    expect(mockSetFailed).toHaveBeenCalledWith('Download failed')
  })

  test('handles extraction error', async () => {
    mockGetInput.mockReturnValue('v0.9.0')
    mockExtractTar.mockRejectedValue(new Error('Extraction failed'))

    await run()

    expect(mockSetFailed).toHaveBeenCalledWith('Extraction failed')
  })
})

describe('action.yml', () => {
  test('has correct structure', () => {
    const repo = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)))
    const configPath = path.join(repo, 'action.yml')
    const config = yaml.load(fs.readFileSync(configPath, 'utf8')) as {
      name: string
      inputs: {
        version: { default: string; required: boolean }
        token: { required: boolean }
      }
      outputs: { version: { description: string } }
      runs: { using: string; main: string }
    }

    expect(config.name).toBe('Setup Miru CLI')
    expect(config.inputs.version.default).toBe('latest')
    expect(config.inputs.version.required).toBe(false)
    expect(config.inputs.token.required).toBe(false)
    expect(config.outputs.version).toBeDefined()
    expect(config.runs.using).toBe('node24')
    expect(config.runs.main).toBe('dist/index.js')
  })
})
