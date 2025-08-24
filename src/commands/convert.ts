import { Command } from 'commander'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { ffmpeg } from '../utils/ffmpeg'
import { ensureDirectoryForFile } from '../utils/fs'

export function attachConvertCommand(program: Command): void {
  program
    .command('convert')
    .description('将 mov 转换为 mp4（H.264 + AAC）')
    .requiredOption('-i, --input <file>', '输入 mov 文件路径')
    .option('-o, --output <file>', '输出 mp4 文件路径，默认与输入同名 .mp4')
    .option(
      '-p, --preset <name>',
      '编码预设：ultrafast/superfast/veryfast/faster/fast/medium/slow/slower/veryslow，默认 medium',
      'medium'
    )
    .option('-F, --ffmpeg <path>', '自定义 ffmpeg 可执行文件路径（优先于环境变量 FFMPEG_PATH）')
    .action(async (opts: { input: string; output?: string; preset: string; ffmpeg?: string }) => {
      if (opts.ffmpeg) {
        if (!fs.existsSync(opts.ffmpeg)) {
          console.error(`ffmpeg 不存在: ${opts.ffmpeg}`)
          process.exitCode = 1
          return
        }
        ffmpeg.setFfmpegPath(opts.ffmpeg)
      }
      const inputPath = path.resolve(process.cwd(), opts.input)
      if (!fs.existsSync(inputPath)) {
        console.error(`输入文件不存在: ${inputPath}`)
        process.exitCode = 1
        return
      }
      const outputPath = path.resolve(
        process.cwd(),
        opts.output || path.join(path.dirname(inputPath), `${path.parse(inputPath).name}.mp4`)
      )
      await ensureDirectoryForFile(outputPath)

      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            '-preset', opts.preset,
            '-movflags', 'faststart',
            '-pix_fmt', 'yuv420p'
          ])
          .on('start', (cmd) => {
            console.log(`开始转换...\n${cmd}`)
          })
          .on('progress', (p) => {
            if (typeof p.percent === 'number') {
              process.stdout.write(`进度: ${p.percent.toFixed(1)}%\r`)
            }
          })
          .on('error', (err) => {
            console.error('转换失败:', err.message)
            reject(err)
          })
          .on('end', () => {
            console.log(`\n完成: ${outputPath}`)
            resolve()
          })
          .save(outputPath)
      })
    })
}


