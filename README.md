## node-utils

基于 Node.js/TypeScript 的命令行小工具集合。

- 生成二维码 PNG：`node-utils qrcode`
- 将 `.mov` 转为 `.mp4`：`node-utils convert`

### 目录结构

```
nodejs_utils/
  ├─ src/
  │  ├─ index.ts                 # CLI 入口：注册命令与初始化
  │  ├─ commands/
  │  │  ├─ qrcode.ts             # qrcode 子命令
  │  │  └─ convert.ts            # convert 子命令
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

参数：
- `-t, --text`：二维码内容（文本或 URL）
- `-o, --output`：输出文件路径
- `-s, --size`：二维码尺寸（像素），默认 512
- `-i, --input`：输入 `.mov` 文件
- `-p, --preset`：x264 预设（`ultrafast`…`veryslow`），默认 `medium`

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


