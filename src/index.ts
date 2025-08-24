#!/usr/bin/env node
import { Command } from 'commander'
import { configureFfmpegBinary } from './utils/ffmpeg'
import { attachGrid9Command } from './commands/grid9'
import { attachQRCodeCommand } from './commands/qrcode'
import { attachConvertCommand } from './commands/convert'

configureFfmpegBinary()

const program = new Command()

program
  .name('node-utils')
  .description('Node.js 实用命令集合')
  .version('1.0.0')

attachQRCodeCommand(program)
attachConvertCommand(program)
attachGrid9Command(program)

program.parseAsync(process.argv)
