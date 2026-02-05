import * as os from 'os'

export type DownloadUrlArgs = {
  version: string
  platform: string
  arch: string
}

/**
 * Format the download URL for the Miru CLI. URL pattern:
 * https://github.com/mirurobotics/cli/releases/download/{version}/cli_Linux_x86_64.tar.gz
 */
export const formatDownloadUrl = (args: DownloadUrlArgs): string => {
  const { version, platform, arch } = args
  const filename = `cli_${platform}_${arch}.tar.gz`
  return `https://github.com/mirurobotics/cli/releases/download/${version}/${filename}`
}

/**
 * Get the download URL for the release corresponding to the given version
 */
export const getDownloadUrl = (version: string): string => {
  return formatDownloadUrl({
    version: version,
    platform: mapPlatform(os.platform()),
    arch: mapArch(os.arch())
  })
}

/**
 * Map os.platform() (https://nodejs.org/docs/latest-v16.x/api/os.html#osplatform) to
 * the appropriate Miru CLI platform (https://github.com/mirurobotics/cli/releases)
 */
export const mapPlatform = (platform: string): string => {
  const mappings: Record<string, string> = {
    linux: 'Linux'
  }
  return mappings[platform] || platform
}

/**
 * Map os.arch() (https://nodejs.org/docs/latest-v16.x/api/os.html#osarch) to
 * the appropriate Miru CLI architecture (https://github.com/mirurobotics/cli/releases)
 */
export const mapArch = (arch: string): string => {
  const mappings: Record<string, string> = {
    x64: 'x86_64'
  }
  return mappings[arch] || arch
}
