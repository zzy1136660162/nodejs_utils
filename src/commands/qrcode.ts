import { Command } from 'commander'
import * as path from 'node:path'
import QRCode from 'qrcode'
import { ensureDirectoryForFile } from '../utils/fs'

export function attachQRCodeCommand(program: Command): void {
  program
    .command('qrcode')
    .description('生成二维码 PNG 图片')
    .requiredOption('-t, --text <text>', '二维码内容（文本或URL）')
    .option('-o, --output <file>', '输出文件路径，默认 qrcode.png', 'qrcode.png')
    .option('-s, --size <number>', '图片大小（像素），默认 512', (v) => parseInt(v, 10), 512)
    .action(async (opts: { text: string; output: string; size: number }) => {
      const outputPath = path.resolve(process.cwd(), opts.output)
      await ensureDirectoryForFile(outputPath)
      const options: QRCode.QRCodeToFileOptions = {
        type: 'png',
        width: opts.size,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      }
      await QRCode.toFile(outputPath, opts.text, options)
      console.log(`二维码已生成: ${outputPath}`)
    })
}


