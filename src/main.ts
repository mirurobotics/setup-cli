import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as versions from './versions.js'
import * as releases from './releases.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const version = getInputVersion()
    const pathToCLI = await downloadMiruCLI(version)

    // expose the tool by adding it to the PATH
    core.addPath(pathToCLI)

    // expose installed tool version
    core.setOutput('version', version)
    core.info(`Miru CLI ${version} installed successfully`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

const getInputVersion = (): string => {
  const inputVersion = core.getInput('version')
  const sanitizedVersion = versions.sanitize(inputVersion)
  return versions.resolve(sanitizedVersion)
}

const downloadMiruCLI = async (version: string): Promise<string> => {
  const downloadUrl = await releases.getDownloadUrl(version)
  core.info(`Downloading Miru CLI from ${downloadUrl}`)
  const pathToTarball = await tc.downloadTool(downloadUrl)
  const pathToCLI = await tc.extractTar(pathToTarball)
  return pathToCLI
}
