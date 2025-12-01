## node-utils

基于 Node.js/TypeScript 的命令行小工具集合。

- 生成二维码 PNG：`node-utils qrcode`
- 将 `.mov` 转为 `.mp4`：`node-utils convert`
- 压缩图片：`node-utils compress`
- 拼接九宫格图片：`node-utils grid9`
- 从 Word 导出图片：`node-utils word-images`

### 目录结构

```
nodejs_utils/
  ├─ src/
  │  ├─ index.ts                 # CLI 入口：注册命令与初始化
  │  ├─ commands/
  │  │  ├─ qrcode.ts             # qrcode 子命令
  │  │  ├─ convert.ts            # convert 子命令
  │  │  ├─ compress.ts           # compress 子命令（图片压缩，使用 Sharp）
  │  │  ├─ grid9.ts              # grid9 子命令（九宫格拼图，使用 Jimp 合成）
  │  │  └─ word-images.ts        # word-images 子命令（从 Word 导出图片）
  │  └─ utils/
  │     ├─ ffmpeg.ts             # ffmpeg 静态二进制配置与导出
  │     └─ fs.ts                 # 文件系统公共方法
  ├─ dist/                       # 构建产物（build 后生成）
  ├─ package.json
  └─ tsconfig.json
```

### 开发

- 要求：Node.js ≥ 18，pnpm ≥ 8
- 安装依赖：

```bash
pnpm install
```

- 构建 TypeScript：

```bash
pnpm run build
```

- 开发监听（可选）：

```bash
pnpm run dev
```

- 本地运行（不全局安装时）：

```bash
node dist/index.js --help
```

### 安装与使用

- 全局安装：

```bash
pnpm add -g .

# 若提示缺少全局 bin 目录
pnpm setup
# Windows PowerShell 也可：
# $env:PNPM_HOME = "$env:LOCALAPPDATA\\pnpm"
# 将 $env:PNPM_HOME 或 $env:PNPM_HOME\\global\\5\\node_modules\\.bin 加入 PATH
```

- 验证：

```bash
node-utils --help
```

#### 使用示例

- 生成二维码：

```bash
node-utils qrcode -t "https://example.com" -o ./tmp/qrcode.png -s 512
```

- mov 转 mp4（H.264 + AAC）：

```bash
node-utils convert -i ./input.mov -o ./output.mp4 -p medium
```

- 压缩图片（单文件或批量）：

```bash
# 压缩单个图片，质量 80%
node-utils compress -i ./photo.jpg -q 80

# 压缩并调整尺寸
node-utils compress -i ./photo.jpg -o ./small.jpg -q 70 -w 1920

# 批量压缩目录内所有图片
node-utils compress -i ./images -o ./compressed -q 75

# 转换格式为 WebP
node-utils compress -i ./photo.jpg -f webp -q 85
```

参数：
- `-t, --text`：二维码内容（文本或 URL）
- `-o, --output`：输出文件路径
- `-s, --size`：二维码尺寸（像素），默认 512
- `-i, --input`：输入 `.mov` 文件
- `-p, --preset`：x264 预设（`ultrafast`…`veryslow`），默认 `medium`

- 九宫格拼图：

```bash
# 从目录随机取 9 张，生成 ./grid9.jpg（或使用 -o 指定）
node-utils grid9 -d ./images
node-utils grid9 -d ./images -o ./out/grid9.jpg -s 512

# 批量模式：对目录内所有图片打乱后，每 9 张一组生成多张
# 导出 floor(n/9) 张，默认命名 grid9-1.jpg / grid9-2.jpg ...
node-utils grid9 -d ./images --multi

# 批量模式 + 指定输出名：会在指定名的扩展名前插入 -序号
node-utils grid9 -d ./images --multi -o ./out/grid9.jpg
```

参数（compress）：
- `-i, --input`：输入文件或文件夹路径。
- `-o, --output`：输出文件或文件夹路径，默认添加 `-compressed` 后缀。
- `-q, --quality`：压缩质量（1-100），默认 80。
- `-w, --width`：调整宽度（像素），保持宽高比。
- `-h, --height`：调整高度（像素），保持宽高比。
- `-f, --format`：输出格式（jpg/png/webp/avif），默认保持原格式。
- 支持格式：`.jpg/.jpeg/.png/.webp/.tiff/.avif`。

参数（grid9）：
- `-d, --dir`：输入图片目录（至少 9 张）。
- `-o, --output`：输出文件路径（单张模式默认 `<dir>/grid9.jpg`；多张模式默认 `grid9-1.jpg ~ grid9-x.jpg`，若指定文件名则在其扩展名前插入 `-1`、`-2` 等）。
- `-s, --size`：单格边长（像素），默认 512，最终成品为 `3x3`，尺寸 `size*3`。
- `-m, --multi`：批量输出，多于 9 张时生成 `floor(n/9)` 张九宫格。
- 兼容格式：`.jpg/.jpeg/.png/.webp/.bmp`，背景为白色，按中心裁剪覆盖（cover）。

### 部署

- 作为 CLI 分发：
  - `pnpm run build` 生成 `dist/`
  - 发布 npm 包或在目标机器 `pnpm add -g <包>`

- CI/CD 安装 `ffmpeg-static`：

```bash
pnpm config set allow-scripts.ffmpeg-static true
pnpm rebuild ffmpeg-static
```

### 扩展指南

- 新增命令：在 `src/commands/` 新建 `xxx.ts`，导出 `attachXxxCommand(program)`，并在 `src/index.ts` 里注册。
- 公共能力：抽取到 `src/utils/`（如 FS、参数校验、转码配置等）。
- 代码风格：明确命名、提前返回、避免深层嵌套。

### 常见问题

- 找不到全局命令：确保 PATH 含 `PNPM_HOME` 或其下 `.bin` 目录。
- `ffmpeg` 下载被阻止：执行

```bash
pnpm config set allow-scripts.ffmpeg-static true && pnpm rebuild ffmpeg-static
```


