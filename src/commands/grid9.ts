import { Command } from 'commander'
import * as fs from 'node:fs'
import * as path from 'node:path'
// 不再使用 ffmpeg，改为 Jimp 实现
import { Jimp } from 'jimp'
import { ensureDirectoryForFile } from '../utils/fs'

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function isImageFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase()
  return ['.jpg', '.jpeg', '.png', '.webp', '.bmp'].includes(ext)
}

export function attachGrid9Command(program: Command): void {
  program
    .command('grid9')
    .description('从文件夹随机选取9张图片并拼接成九宫格')
    .requiredOption('-d, --dir <folder>', '输入图片所在文件夹路径')
    .option('-o, --output <file>', '输出图片路径，默认 <dir>/grid9.jpg')
    .option('-s, --size <number>', '单格边长（像素），默认 512', (v) => parseInt(v, 10), 512)
    .option('-m, --multi', '批量输出：对目录内所有图片按9张一组生成多张九宫格')
    .action(async (opts: { dir: string; output?: string; size: number; multi?: boolean }) => {

      const dirPath = path.resolve(process.cwd(), opts.dir)
      if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
        console.error(`输入文件夹不存在或非目录: ${dirPath}`)
        process.exitCode = 1
        return
      }

      const allFiles = await fs.promises.readdir(dirPath)
      const imageFiles = allFiles.filter(isImageFile)
      if (imageFiles.length < 9) {
        console.error(`图片数量不足（找到 ${imageFiles.length} 张），需要至少 9 张`)
        process.exitCode = 1
        return
      }

      const shuffled = shuffleInPlace(imageFiles.slice())
      const totalGroups = Math.floor(shuffled.length / 9)
      const groups = opts.multi ? totalGroups : Math.min(1, totalGroups)

      if (groups <= 0) {
        console.error('可用图片不足 9 张，无法生成九宫格')
        process.exitCode = 1
        return
      }

      const cell = opts.size
      const width = cell * 3
      const height = cell * 3

      const placements: Array<{ x: number; y: number }> = []
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          placements.push({ x: c * cell, y: r * cell })
        }
      }

      for (let g = 0; g < groups; g++) {
        const slice = shuffled.slice(g * 9, g * 9 + 9)
        const absoluteSelected = slice.map((f) => path.join(dirPath, f))

        const outputPathBase = path.resolve(
          process.cwd(),
          opts.output || path.join(dirPath, groups > 1 ? `grid9-${g + 1}.jpg` : 'grid9.jpg')
        )
        // 如果用户指定了输出文件且是多图模式，则在扩展名前插入 -{序号}
        const parsed = path.parse(outputPathBase)
        const outPath = opts.output && groups > 1
          ? path.join(parsed.dir, `${parsed.name}-${g + 1}${parsed.ext || '.jpg'}`)
          : outputPathBase
        await ensureDirectoryForFile(outPath)

        console.log(`开始拼接九宫格(${g + 1}/${groups})...`)
        const background = new Jimp({ width, height, color: 0xffffffff })

        // 加载并处理 9 张图片
        const images = await Promise.all(
          absoluteSelected.map(async (p) => Jimp.read(p))
        )
        for (let i = 0; i < 9; i++) {
          const img = images[i]
          img.cover({ w: cell, h: cell })
          const { x, y } = placements[i]
          background.composite(img, x, y)
        }

        // 输出
        const ext = path.extname(outPath).toLowerCase()
        let finalOutPath = outPath
        if (!(ext === '.png' || ext === '.webp' || ext === '.bmp' || ext === '.jpg' || ext === '.jpeg')) {
          finalOutPath = outPath + '.jpg'
        }
        await background.write(finalOutPath as `${string}.${string}`)
        console.log(`完成: ${finalOutPath}`)
      }
    })
}


