#!/usr/bin/env node
import { Command } from 'commander'
import { configureFfmpegBinary } from './utils/ffmpeg'
import { attachGrid9Command } from './commands/grid9'
import { attachWordImagesCommand } from './commands/word-images'
import { attachQRCodeCommand } from './commands/qrcode'
import { attachConvertCommand } from './commands/convert'
import { attachCompressCommand } from './commands/compress'

configureFfmpegBinary()

const program = new Command()

program
  .name('node-utils')
  .description('Node.js 实用命令集合')
  .version('1.0.0')

attachQRCodeCommand(program)
attachConvertCommand(program)
attachCompressCommand(program)
attachGrid9Command(program)
attachWordImagesCommand(program)

program.parseAsync(process.argv)
