import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import * as fs from 'node:fs'

function pathExists(p?: string | null): p is string {
  return !!p && fs.existsSync(p)
}

// Set ffmpeg binary path if available from ffmpeg-static
export function configureFfmpegBinary(): void {
  // Priority 1: user-defined env var
  const envPath = process.env.FFMPEG_PATH
  if (pathExists(envPath)) {
    ffmpeg.setFfmpegPath(envPath)
    return
  }

  // Priority 2: ffmpeg-static package binary
  if (pathExists(ffmpegStatic as unknown as string)) {
    ffmpeg.setFfmpegPath(ffmpegStatic as unknown as string)
    return
  }

  // Otherwise, rely on system PATH. Leave unset and let fluent-ffmpeg resolve.
}

export { ffmpeg }


