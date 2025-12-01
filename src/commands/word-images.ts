import { Command } from 'commander'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import JSZip from 'jszip'
import { ensureDirectoryForFile } from '../utils/fs'

export function attachWordImagesCommand(program: Command): void {
  program
    .command('word-images')
    .description('从 Word 文档（.docx）中导出所有图片')
    .requiredOption('-i, --input <file>', '输入 .docx 文件路径')
    .requiredOption('-o, --output <dir>', '输出目录路径')
    .action(async (opts: { input: string; output: string }) => {
      const inputPath = path.resolve(process.cwd(), opts.input)
      const outDir = path.resolve(process.cwd(), opts.output)

      try {
        // 检查输入文件是否存在
        const stat = await fs.stat(inputPath)
        if (!stat.isFile()) {
          console.error(`输入路径不是文件: ${inputPath}`)
          process.exitCode = 1
          return
        }

        // 读取文件内容
        const buf = await fs.readFile(inputPath)

        // 粗略判断是否是 docx（zip 以 PK 开头）
        if (buf[0] !== 0x50 || buf[1] !== 0x4B) {
          console.error('该文件看起来不是 .docx（zip 格式）。如为 .doc，请先转为 .docx 再试。')
          process.exitCode = 2
          return
        }

        console.log(`正在解析 Word 文档: ${inputPath}`)
        const zip = await JSZip.loadAsync(buf)
        const mediaFiles = Object.keys(zip.files).filter(n => n.startsWith('word/media/'))

        if (!mediaFiles.length) {
          console.log('未在 word/media/ 下发现图片。')
          return
        }

        // 确保输出目录存在
        await fs.mkdir(outDir, { recursive: true })

        let count = 0
        for (const name of mediaFiles) {
          const file = zip.files[name]
          const content = await file.async('nodebuffer')
          const base = path.basename(name) // 如 image1.png
          const outputPath = path.join(outDir, base)
          
          await fs.writeFile(outputPath, content)
          count++
          console.log(`导出: ${base}`)
        }

        console.log(`✅ 导出完成：${count} 张图片 -> ${outDir}`)
      } catch (error) {
        console.error('导出失败:', error instanceof Error ? error.message : error)
        process.exitCode = 1
      }
    })
}

