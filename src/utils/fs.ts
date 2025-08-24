import * as fs from 'node:fs'
import * as path from 'node:path'

export async function ensureDirectoryForFile(filePath: string): Promise<void> {
  const dirPath = path.dirname(filePath)
  await fs.promises.mkdir(dirPath, { recursive: true })
}


