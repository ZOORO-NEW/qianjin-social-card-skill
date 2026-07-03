# Social Card Skill | 社交卡片生成器

将长文案排版为 3:4 比例的精美图片，自动裁切为多张，适合小红书、公众号贴图发布。

**跨平台 AI Agent 技能** — 适用于 WorkBuddy、OpenClaw、Codex、Hermes 等任意 AI agent 平台。

## ✨ 特性

- **6 种排版风格** — 极简白纸 / 奶油杂志 / 渐变极光 / 暗夜墨色 / 手账笔记 / 新国风
- **智能分页** — 自动在段落/句子/分句边界拆分，不断句
- **封面 + 尾页** — 自动生成带标题/标签/阅读时长的封面页和"完"字尾页
- **Markdown 支持** — 解析 `##`标题、`**粗体**`、`*斜体*`、`>引用`、`-列表`、`==高亮==`
- **关键句高亮** — 自动检测并高亮重要句子
- **三档文字密度** — 紧凑 / 舒适 / 宽松
- **2x 高清输出** — 默认 2160×2880px，直接发布不糊
- **跨平台** — Windows / macOS / Linux 全支持，自动检测系统浏览器
- **零配置** — 首次运行自动安装 puppeteer-core

## 📸 风格预览

| 风格 | ID | 适用场景 |
|------|-----|---------|
| 极简白纸 | `minimal-white` | 知识干货、科技、通用 |
| 奶油杂志 | `cream-magazine` | 读书笔记、生活方式、文艺 |
| 渐变极光 | `aurora-gradient` | 时尚、美妆、潮流话题 |
| 暗夜墨色 | `dark-night` | 深度思考、情感、夜读 |
| 手账笔记 | `journal-note` | 日常记录、旅行、美食 |
| 新国风 | `chinese-ink` | 传统文化、诗词、茶道 |

## 🚀 快速开始

### 前置要求

- **Node.js** 18+
- **Chrome 或 Edge 浏览器**（系统已安装即可，无需额外配置）

### 安装

```bash
# 克隆仓库
git clone https://github.com/qianjin/social-card-skill.git
cd social-card-skill

# 安装依赖（或首次运行时自动安装）
npm install puppeteer-core
```

### 使用

```bash
# 从文件生成
node scripts/generate-cards.js --input article.txt --style cream-magazine --output ./cards

# 直接传入文本
node scripts/generate-cards.js --input "这是一段长文案..." --style aurora-gradient --highlight

# 从标准输入
echo "文案内容" | node scripts/generate-cards.js --style dark-night

# 仅生成 HTML 预览（不渲染 PNG）
node scripts/generate-cards.js --input article.txt --style minimal-white --preview
```

### 完整参数

```
node scripts/generate-cards.js \
  --input <文本或文件路径> \
  --style <minimal-white|cream-magazine|aurora-gradient|dark-night|journal-note|chinese-ink> \
  --output <输出目录> \
  --title <自定义标题> \
  --subtitle <副标题> \
  --tag <话题标签> \
  --author <作者名> \
  --density <compact|comfortable|spacious> \
  --chars-per-card <每卡字数> \
  --highlight \
  --accent-color <#hex> \
  --no-cover \
  --no-end \
  --preview \
  --width <1080> \
  --scale <2>
```

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--style` | `minimal-white` | 排版风格 |
| `--output` | `./output` | 输出目录 |
| `--title` | 自动提取 | 封面大标题 |
| `--subtitle` | 无 | 封面副标题 |
| `--tag` | 无 | 封面话题标签 |
| `--author` | 无 | 作者名 |
| `--density` | `comfortable` | 文字密度 |
| `--highlight` | 关闭 | 自动高亮关键句 |
| `--accent-color` | 风格默认 | 自定义强调色 |
| `--no-cover` | 生成封面 | 跳过封面页 |
| `--no-end` | 生成尾页 | 跳过尾页 |
| `--preview` | 渲染PNG | 仅生成HTML预览 |
| `--width` | `1080` | 图片宽度（高度自动 4/3） |
| `--scale` | `2` | 渲染倍率 |

## 📝 Markdown 支持

文案中可使用以下 Markdown 语法：

```markdown
## 二级标题

### 三级标题

正文段落，支持 **粗体** 和 *斜体*。

> 引用块，用于强调重要观点

- 列表项一
- 列表项二

正文中的 ==高亮文字== 会自动加底色。
```

## 🎨 文字密度

| 密度 | 每卡字数 | 行高 | 段距 | 适用 |
|------|---------|------|------|------|
| compact | ~300 | 1.6 | 14px | 信息量大，干货长文 |
| comfortable | ~220 | 1.85 | 22px | 通用，阅读舒适 |
| spacious | ~150 | 2.1 | 32px | 短句金句，留白美学 |

## 🔧 在 AI Agent 中使用

### WorkBuddy

将 `SKILL.md` 和 `scripts/` 目录放在 `~/.workbuddy/skills/qianjin-social-card-skill/` 下即可。

### OpenClaw / Codex / Hermes

将本仓库作为技能目录加载，确保 `scripts/generate-cards.js` 可执行。脚本会自动检测系统浏览器和安装 `puppeteer-core`。

### 环境变量

| 变量 | 说明 |
|------|------|
| `PUPPETEER_EXECUTABLE_PATH` | 手动指定浏览器路径（可选） |
| `NODE_PATH` | Node.js 模块搜索路径（如需指定 puppeteer-core 位置） |

## 📁 项目结构

```
social-card-skill/
├── scripts/
│   └── generate-cards.js    # 核心生成脚本
├── SKILL.md                  # AI Agent 技能描述文件
├── package.json
├── README.md
├── LICENSE
└── .gitignore
```

## 📄 License

MIT

## 🤝 贡献

欢迎提交 Issue 和 PR！
