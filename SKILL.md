---
title: "社交卡片生成器"
summary: "将长文案排版为 3:4 比例精美图片，自动裁切多张，适合小红书和公众号贴图"
author: "qianjin"
tags: ["social-card", "xiaohongshu", "image", "typography", "排版"]
read_when:
  - 用户需要将文章/文案转为小红书图片
  - 用户需要生成公众号配图
  - 用户提到"社交卡片"、"小红书图"、"排版图片"、"文案转图片"
  - 用户想将长文拆分为多张精美卡片
---

# 社交卡片生成器 | Social Card Generator

将长文案排版为 3:4 比例的精美图片，自动裁切为多张，适合小红书、公众号贴图发布。支持 6 种排版风格、智能分页、Markdown 语法、关键句高亮等。

**跨平台兼容**：适用于 WorkBuddy、OpenClaw、Codex、Hermes 等任意 AI agent 平台。仅需 Node.js 18+ 和 Chrome/Edge 浏览器。

## 触发场景

- 用户说"帮我做成小红书图片"
- 用户说"这段文案排版成卡片"
- 用户说"生成公众号贴图"
- 用户提到"社交卡片"、"文案转图片"、"排版卡片"
- 用户有一段长文案，想要图文形式发布

## 支持的排版风格

| 风格 ID | 名称 | 描述 | 适用场景 |
|---------|------|------|---------|
| `minimal-white` | 极简白纸 | 纯白背景，黑色文字，简约线条 | 通用、知识分享、科技 |
| `cream-magazine` | 奶油杂志 | 暖色奶油底，杂志排版，金色点缀 | 读书笔记、生活方式、文艺 |
| `aurora-gradient` | 渐变极光 | 梦幻渐变背景，白色文字，玻璃拟态 | 时尚、美妆、潮流话题 |
| `dark-night` | 暗夜墨色 | 深色背景，柔和灯光感 | 深度思考、情感、夜读 |
| `journal-note` | 手账笔记 | 纸张质感，手写风格，暖色装饰 | 日常记录、旅行、美食 |
| `chinese-ink` | 新国风 | 宣纸底色，水墨韵味，大量留白 | 传统文化、诗词、茶道 |

## 核心功能

1. **智能分页** - 自动在段落/句子/分句边界拆分，不会断句
2. **封面页** - 大标题 + 副标题 + 话题标签 + 阅读时长
3. **尾页** - "完"字标记 + 互动引导（关注/点赞/收藏）
4. **页码** - 每页底部显示 "01 / 06" 格式页码
5. **Markdown 支持** - 解析 `##`标题、`**粗体**`、`*斜体*`、`>引用`、`-列表`、`` `代码` ``、`==高亮==`
6. **关键句高亮** - 自动检测并高亮关键句子
7. **文字密度** - 三档可选：紧凑/舒适/宽松
8. **自定义强调色** - 覆盖默认配色
9. **2x 高清输出** - 默认输出 2 倍清晰度 PNG

## 使用方法

### 基本用法

```bash
# 从文件读取
node scripts/generate-cards.js --input article.txt --style cream-magazine --output ./cards

# 直接传入文本
node scripts/generate-cards.js --input "这是一段长文案..." --style aurora-gradient

# 从标准输入
echo "文案内容" | node scripts/generate-cards.js --style dark-night
```

### 完整参数

```bash
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

### 参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--style` | `minimal-white` | 排版风格 |
| `--output` | `./output` | 输出目录 |
| `--chars-per-card` | 根据密度自动 | 每张卡片最大字符数 |
| `--title` | 自动提取 | 封面大标题 |
| `--subtitle` | 无 | 封面副标题 |
| `--tag` | 无 | 封面话题标签（如 `#读书笔记`） |
| `--author` | 无 | 作者名，显示在封面和尾页 |
| `--density` | `comfortable` | 文字密度 |
| `--highlight` | 关闭 | 自动高亮关键句 |
| `--accent-color` | 风格默认 | 自定义强调色 |
| `--no-cover` | 生成封面 | 跳过封面页 |
| `--no-end` | 生成尾页 | 跳过尾页 |
| `--preview` | 渲染PNG | 仅生成HTML预览 |
| `--width` | `1080` | 图片宽度（高度自动 4/3） |
| `--scale` | `2` | 渲染倍率 |

## 工作流程

### Agent 使用此技能时的步骤：

1. **准备文本**
   - 从用户获取文案内容
   - 可适当整理：分段、添加标题、标注重点

2. **选择风格**
   - 根据内容类型推荐风格：
     - 知识干货 -> `minimal-white`
     - 读书笔记 -> `cream-magazine`
     - 时尚美妆 -> `aurora-gradient`
     - 深度思考 -> `dark-night`
     - 日常分享 -> `journal-note`
     - 传统文化 -> `chinese-ink`

3. **执行生成**
   ```bash
   # 脚本会自动检测浏览器和安装 puppeteer-core
   node <skill-dir>/scripts/generate-cards.js \
     --input <text-file> \
     --style <style> \
     --output <output-dir> \
     --tag "#标签" \
     --highlight
   ```

4. **验证结果**
   - 检查输出目录中的 PNG 文件
   - 打开 `preview.html` 查看全部卡片效果

5. **展示给用户**
   - 展示生成的图片
   - 告知用户图片路径和数量

### Markdown 输入支持

文案中可使用以下 Markdown 语法，会自动渲染为对应样式：

```markdown
## 二级标题（大标题）
### 三级标题（小标题）

正文段落，支持 **粗体** 和 *斜体*。

> 引用块，用于强调重要观点

- 列表项一
- 列表项二
- 列表项三

正文中的 ==高亮文字== 会自动加底色。
```

## 技术依赖

- **Node.js** 18+
- **puppeteer-core** - 用于 HTML 渲染为 PNG（首次运行自动安装）
- **Chrome 或 Edge 浏览器** - 系统已安装的浏览器作为渲染引擎

## 文字密度对照

| 密度 | 每卡字数 | 行高 | 段距 | 适用 |
|------|---------|------|------|------|
| compact | ~300 | 1.6 | 14px | 信息量大，干货长文 |
| comfortable | ~220 | 1.85 | 22px | 通用，阅读舒适 |
| spacious | ~150 | 2.1 | 32px | 短句金句，留白美学 |

## 注意事项

1. **中文字体** - 依赖系统字体（微软雅黑/宋体/楷体等），确保系统已安装
2. **渲染速度** - 每张卡片约 1-2 秒，10 张卡片约 15 秒
3. **输出尺寸** - 默认 1080x1440 (2x = 2160x2880)，适合小红书高清发布
4. **preview.html** - 生成在输出目录中，可在浏览器中预览所有卡片
5. **跨平台** - 支持 Windows / macOS / Linux，自动检测系统浏览器
