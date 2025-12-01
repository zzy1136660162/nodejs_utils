import { Command } from 'commander'
import * as fs from 'node:fs'
import * as path from 'node:path'
import sharp from 'sharp'
import { ensureDirectoryForFile } from '../utils/fs'

function isImageFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase()
  return ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.avif'].includes(ext)
}

async function compressImage(
  inputPath: string,
  outputPath: string,
  quality: number,
  width?: number,
  height?: number
): Promise<void> {
  let pipeline = sharp(inputPath)

  // 调整尺寸（如果指定）
  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    })
  }

  const ext = path.extname(outputPath).toLowerCase()

  // 根据输出格式应用压缩
  if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true })
  } else if (ext === '.png') {
    pipeline = pipeline.png({ quality, compressionLevel: 9 })
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality })
  } else if (ext === '.avif') {
    pipeline = pipeline.avif({ quality })
  } else {
    // 默认输出为 JPEG
    pipeline = pipeline.jpeg({ quality, mozjpeg: true })
  }

  await ensureDirectoryForFile(outputPath)
  await pipeline.toFile(outputPath)
}

export function attachCompressCommand(program: Command): void {
  program
    .command('compress')
    .description('压缩图片（支持单文件或批量压缩目录）')
    .requiredOption('-i, --input <path>', '输入文件或文件夹路径')
    .option('-o, --output <path>', '输出文件或文件夹路径，默认为输入路径加 -compressed 后缀')
    .option('-q, --quality <number>', '压缩质量（1-100），默认 80', (v) => parseInt(v, 10), 80)
    .option('-w, --width <number>', '调整宽度（像素），保持宽高比', (v) => parseInt(v, 10))
    .option('-h, --height <number>', '调整高度（像素），保持宽高比', (v) => parseInt(v, 10))
    .option('-f, --format <type>', '输出格式：jpg/png/webp/avif，默认保持原格式')
    .action(async (opts: { 
      input: string
      output?: string
      quality: number
      width?: number
      height?: number
      format?: string
    }) => {
      const inputPath = path.resolve(process.cwd(), opts.input)
      
      if (!fs.existsSync(inputPath)) {
        console.error(`输入路径不存在: ${inputPath}`)
        process.exitCode = 1
        return
      }

      const quality = Math.max(1, Math.min(100, opts.quality))
      const stats = fs.statSync(inputPath)

      // 单文件模式
      if (stats.isFile()) {
        if (!isImageFile(inputPath)) {
          console.error('输入文件不是支持的图片格式（jpg/jpeg/png/webp/tiff/avif）')
          process.exitCode = 1
          return
        }

        const parsed = path.parse(inputPath)
        let outputPath: string

        if (opts.output) {
          outputPath = path.resolve(process.cwd(), opts.output)
        } else {
          const ext = opts.format ? `.${opts.format}` : parsed.ext
          outputPath = path.join(parsed.dir, `${parsed.name}-compressed${ext}`)
        }

        console.log(`开始压缩: ${path.basename(inputPath)}`)
        const startSize = fs.statSync(inputPath).size

        await compressImage(inputPath, outputPath, quality, opts.width, opts.height)

        const endSize = fs.statSync(outputPath).size
        const ratio = ((1 - endSize / startSize) * 100).toFixed(1)
        console.log(`✅ 完成: ${outputPath}`)
        console.log(`   原始大小: ${(startSize / 1024).toFixed(1)} KB`)
        console.log(`   压缩后: ${(endSize / 1024).toFixed(1)} KB`)
        console.log(`   压缩率: ${ratio}%`)
      }
      // 批量模式（目录）
      else if (stats.isDirectory()) {
        const files = await fs.promises.readdir(inputPath)
        const imageFiles = files.filter(isImageFile)

        if (imageFiles.length === 0) {
          console.error(`目录中未找到支持的图片文件: ${inputPath}`)
          process.exitCode = 1
          return
        }

        const outputDir = opts.output
          ? path.resolve(process.cwd(), opts.output)
          : path.join(inputPath, 'compressed')

        await fs.promises.mkdir(outputDir, { recursive: true })

        console.log(`找到 ${imageFiles.length} 张图片，开始批量压缩...`)
        let totalOriginal = 0
        let totalCompressed = 0

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i]
          const inputFilePath = path.join(inputPath, file)
          const parsed = path.parse(file)
          const ext = opts.format ? `.${opts.format}` : parsed.ext
          const outputFilePath = path.join(outputDir, `${parsed.name}${ext}`)

          process.stdout.write(`[${i + 1}/${imageFiles.length}] ${file}... `)

          const startSize = fs.statSync(inputFilePath).size
          totalOriginal += startSize

          await compressImage(inputFilePath, outputFilePath, quality, opts.width, opts.height)

          const endSize = fs.statSync(outputFilePath).size
          totalCompressed += endSize
          const ratio = ((1 - endSize / startSize) * 100).toFixed(1)

          console.log(`完成 (${ratio}% 压缩)`)
        }

        const overallRatio = ((1 - totalCompressed / totalOriginal) * 100).toFixed(1)
        console.log(`\n✅ 批量压缩完成: ${imageFiles.length} 张图片`)
        console.log(`   输出目录: ${outputDir}`)
        console.log(`   总原始大小: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`)
        console.log(`   总压缩后: ${(totalCompressed / 1024 / 1024).toFixed(2)} MB`)
        console.log(`   总压缩率: ${overallRatio}%`)
      }
    })
}
