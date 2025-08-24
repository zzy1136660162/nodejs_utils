#!/usr/bin/env node
import { Command } from 'commander'
import { configureFfmpegBinary } from './utils/ffmpeg'
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

program.parseAsync(process.argv)
