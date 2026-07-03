#!/usr/bin/env node
/**
 * Social Card Generator | 社交卡片生成器
 * Convert long-form text into beautifully typeset 3:4 social card images.
 * Auto-splits into multiple cards. Perfect for Xiaohongshu / WeChat / Instagram.
 *
 * Platform-agnostic — works with any AI agent platform (WorkBuddy, OpenClaw, Codex, Hermes, etc.)
 * Requires: Node.js 18+ and a Chromium-based browser (Chrome or Edge).
 *
 * Usage:
 *   node generate-cards.js --input <text|file> [options]
 *
 * Options:
 *   --style <name>        Layout style (default: minimal-white)
 *                         minimal-white | cream-magazine | aurora-gradient
 *                         dark-night | journal-note | chinese-ink
 *   --output <dir>        Output directory (default: ./output)
 *   --chars-per-card <n>  Max characters per card (default: 220)
 *   --title <text>        Override cover title
 *   --subtitle <text>     Cover subtitle
 *   --tag <text>          Topic tag on cover (e.g. #干货分享)
 *   --author <text>       Author name on cover/end
 *   --no-cover            Skip cover page
 *   --no-end              Skip end page
 *   --preview             Generate HTML preview file only (no PNG)
 *   --density <type>      compact | comfortable | spacious (default: comfortable)
 *   --highlight           Auto-highlight key sentences
 *   --accent-color <hex>  Override accent color
 *   --width <n>           Image width in pixels (default: 1080)
 *   --scale <n>           Render scale factor (default: 2)
 *
 * License: MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// ============================================================
// Constants
// ============================================================

const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1440; // 3:4 ratio
const SCRIPT_DIR = __dirname;
const PACKAGE_DIR = path.join(SCRIPT_DIR, '..');

// Density presets
const DENSITY = {
  compact:    { charsPerCard: 300, lineHeight: 1.6, paraSpacing: 14, fontSize: 30, headingSize: 44 },
  comfortable:{ charsPerCard: 220, lineHeight: 1.85, paraSpacing: 22, fontSize: 34, headingSize: 48 },
  spacious:   { charsPerCard: 150, lineHeight: 2.1, paraSpacing: 32, fontSize: 36, headingSize: 52 },
};

// ============================================================
// Style Definitions
// ============================================================

const STYLES = {
  'minimal-white': {
    name: '极简白纸',
    desc: '纯白背景，黑色文字，简约线条装饰',
    bg: '#FFFFFF',
    bgGradient: null,
    text: '#1A1A1A',
    heading: '#000000',
    subheading: '#444444',
    accent: '#999999',
    accentBg: '#F5F5F5',
    highlight: '#FFF8E1',
    highlightText: '#1A1A1A',
    pageNum: '#CCCCCC',
    quoteColor: '#666666',
    quoteBg: '#FAFAFA',
    codeBg: '#F5F5F5',
    font: '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", "Hiragino Sans GB", sans-serif',
    headingFont: '"Microsoft YaHei", "PingFang SC", sans-serif',
    serifFont: '"SimSun", "Songti SC", "Noto Serif CJK SC", serif',
    decor: 'top-line',
    cardPadding: '90px 80px',
    borderRadius: '0px',
  },

  'cream-magazine': {
    name: '奶油杂志',
    desc: '暖色奶油底，杂志排版风，金色点缀',
    bg: '#FAF6F0',
    bgGradient: null,
    text: '#3D3128',
    heading: '#2C2416',
    subheading: '#6B5D4F',
    accent: '#C4A882',
    accentBg: '#F0E8DC',
    highlight: '#F5E6CA',
    highlightText: '#3D3128',
    pageNum: '#C4A882',
    quoteColor: '#6B5D4F',
    quoteBg: '#F0E8DC',
    codeBg: '#F0E8DC',
    font: '"SimSun", "Songti SC", "Noto Serif CJK SC", serif',
    headingFont: '"Microsoft YaHei", "PingFang SC", sans-serif',
    serifFont: '"SimSun", "Songti SC", serif',
    decor: 'magazine',
    cardPadding: '90px 85px',
    borderRadius: '0px',
  },

  'aurora-gradient': {
    name: '渐变极光',
    desc: '梦幻渐变背景，白色文字，玻璃拟态卡片',
    bg: '#6366F1',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 65%, #4facfe 100%)',
    text: '#FFFFFF',
    heading: '#FFFFFF',
    subheading: 'rgba(255,255,255,0.85)',
    accent: 'rgba(255,255,255,0.5)',
    accentBg: 'rgba(255,255,255,0.15)',
    highlight: 'rgba(255,255,255,0.25)',
    highlightText: '#FFFFFF',
    pageNum: 'rgba(255,255,255,0.4)',
    quoteColor: 'rgba(255,255,255,0.8)',
    quoteBg: 'rgba(255,255,255,0.1)',
    codeBg: 'rgba(0,0,0,0.3)',
    font: '"Microsoft YaHei", "PingFang SC", sans-serif',
    headingFont: '"Microsoft YaHei", "PingFang SC", sans-serif',
    serifFont: '"SimSun", serif',
    decor: 'glass',
    cardPadding: '90px 80px',
    borderRadius: '0px',
  },

  'dark-night': {
    name: '暗夜墨色',
    desc: '深色背景，柔和灯光感，专注阅读体验',
    bg: '#1A1A2E',
    bgGradient: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
    text: '#D4D4D4',
    heading: '#FFFFFF',
    subheading: '#A0A0B8',
    accent: '#8B7FD4',
    accentBg: 'rgba(139,127,212,0.15)',
    highlight: 'rgba(139,127,212,0.3)',
    highlightText: '#FFFFFF',
    pageNum: 'rgba(139,127,212,0.5)',
    quoteColor: '#A0A0B8',
    quoteBg: 'rgba(255,255,255,0.05)',
    codeBg: 'rgba(255,255,255,0.08)',
    font: '"Microsoft YaHei", "PingFang SC", sans-serif',
    headingFont: '"Microsoft YaHei", "PingFang SC", sans-serif',
    serifFont: '"SimSun", serif',
    decor: 'glow',
    cardPadding: '90px 80px',
    borderRadius: '0px',
  },

  'journal-note': {
    name: '手账笔记',
    desc: '纸张质感，手写风格，暖色装饰元素',
    bg: '#FFF9F0',
    bgGradient: null,
    text: '#5C4A3A',
    heading: '#4A3728',
    subheading: '#8B7355',
    accent: '#D4A574',
    accentBg: '#FDF0E0',
    highlight: '#FFF0C4',
    highlightText: '#5C4A3A',
    pageNum: '#D4A574',
    quoteColor: '#8B7355',
    quoteBg: '#FDF5EA',
    codeBg: '#FDF5EA',
    font: '"Microsoft YaHei", "PingFang SC", sans-serif',
    headingFont: '"KaiTi", "STKaiti", "Kaiti SC", cursive',
    serifFont: '"KaiTi", "STKaiti", cursive',
    decor: 'washi',
    cardPadding: '95px 85px',
    borderRadius: '0px',
  },

  'chinese-ink': {
    name: '新国风',
    desc: '宣纸底色，水墨韵味，大量留白，东方美学',
    bg: '#F5F0E8',
    bgGradient: null,
    text: '#3C3C3C',
    heading: '#1A1A1A',
    subheading: '#6B5D4F',
    accent: '#8B4513',
    accentBg: '#EDE6D8',
    highlight: '#F0E0C8',
    highlightText: '#3C3C3C',
    pageNum: '#A0927A',
    quoteColor: '#6B5D4F',
    quoteBg: '#EDE6D8',
    codeBg: '#EDE6D8',
    font: '"SimSun", "Songti SC", "Noto Serif CJK SC", serif',
    headingFont: '"SimSun", "Songti SC", "STSong", serif',
    serifFont: '"SimSun", "Songti SC", serif',
    decor: 'ink',
    cardPadding: '100px 95px',
    borderRadius: '0px',
  },
};

// ============================================================
// Dependency Resolution (platform-agnostic)
// ============================================================

/**
 * Try to require a module from multiple candidate paths.
 * Searches: standard require, local node_modules, parent dirs, global, common platform paths.
 */
function resolveModule(moduleName) {
  // 1. Standard require (checks local node_modules, parent dirs, global)
  try { return require(moduleName); } catch (e) { /* continue */ }

  // 2. Check local node_modules in script and package directories
  const localPaths = [
    path.join(SCRIPT_DIR, 'node_modules', moduleName),
    path.join(PACKAGE_DIR, 'node_modules', moduleName),
  ];
  for (const p of localPaths) {
    try { return require(p); } catch (e) { /* continue */ }
  }

  // 3. Check common platform-specific locations
  const platformPaths = [
    // WorkBuddy managed node workspace
    path.join(os.homedir(), '.workbuddy', 'binaries', 'node', 'workspace', 'node_modules', moduleName),
    // nvm global
    path.join(os.homedir(), '.nvm', 'versions', 'node'),
    // Homebrew (macOS)
    '/usr/local/lib/node_modules',
    '/opt/homebrew/lib/node_modules',
    // Linux global
    '/usr/lib/node_modules',
    '/usr/local/lib/node_modules',
  ];

  for (const p of platformPaths) {
    try {
      if (fs.existsSync(p)) {
        const stat = fs.statSync(p);
        if (stat.isDirectory()) {
          const modulePath = path.join(p, moduleName);
          if (fs.existsSync(modulePath)) {
            return require(modulePath);
          }
        }
      }
    } catch (e) { /* continue */ }
  }

  // 4. Try npm root -g
  try {
    const globalRoot = execSync('npm root -g', { encoding: 'utf-8', stdio: 'pipe' }).trim();
    const globalPath = path.join(globalRoot, moduleName);
    if (fs.existsSync(globalPath)) {
      return require(globalPath);
    }
  } catch (e) { /* continue */ }

  return null;
}

/**
 * Auto-install puppeteer-core if not found.
 */
function ensurePuppeteer() {
  let puppeteer = resolveModule('puppeteer-core');
  if (puppeteer) return puppeteer;

  console.log('  puppeteer-core not found, installing...');
  try {
    execSync('npm install puppeteer-core --no-save --prefix "' + PACKAGE_DIR + '"', {
      stdio: 'pipe',
      timeout: 60000,
    });
    puppeteer = resolveModule('puppeteer-core');
    if (puppeteer) {
      console.log('  puppeteer-core installed successfully.');
      return puppeteer;
    }
  } catch (e) {
    console.error('  Auto-install failed:', e.message);
  }

  throw new Error(
    'puppeteer-core is required but could not be loaded.\n' +
    'Please install it manually:\n' +
    '  npm install puppeteer-core'
  );
}

// ============================================================
// Browser Detection (cross-platform)
// ============================================================

/**
 * Find a usable Chrome/Edge/Chromium executable across platforms.
 * Supports Windows, macOS, and Linux.
 */
function findBrowser() {
  const platform = os.platform();
  const candidates = [];

  if (platform === 'win32') {
    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const localAppData = process.env['LOCALAPPDATA'] || '';

    candidates.push(
      path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(programFiles, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
      path.join(programFilesX86, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
    );
  } else if (platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    );
  } else {
    // Linux
    candidates.push(
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/microsoft-edge',
      '/usr/bin/brave-browser',
      '/snap/bin/chromium',
      '/snap/bin/google-chrome',
    );
  }

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  // Try which/where command
  const cmds = platform === 'win32'
    ? ['where chrome', 'where msedge']
    : ['which google-chrome', 'which chromium', 'which chromium-browser', 'which microsoft-edge'];

  for (const cmd of cmds) {
    try {
      const result = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }).trim().split('\n')[0];
      if (result && fs.existsSync(result)) return result;
    } catch (e) { /* continue */ }
  }

  // Check PUPPETEER_EXECUTABLE_PATH env var
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  return null;
}

// ============================================================
// Text Processing
// ============================================================

function isCJK(ch) {
  const code = ch.charCodeAt(0);
  return (code >= 0x4e00 && code <= 0x9fff)
      || (code >= 0x3400 && code <= 0x4dbf)
      || (code >= 0x3000 && code <= 0x303f)
      || (code >= 0xff00 && code <= 0xffef);
}

function charWidth(ch) {
  if (isCJK(ch)) return 1.0;
  if (ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z') return 0.55;
  if (ch >= '0' && ch <= '9') return 0.55;
  return 0.6;
}

function textWidth(str) {
  let w = 0;
  for (const ch of str) w += charWidth(ch);
  return w;
}

function splitParagraphs(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

function splitSentences(para) {
  const sentences = para.split(/(?<=[。！？!?…\n])/g).filter(s => s.trim());
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

function splitClauses(sentence) {
  const clauses = sentence.split(/(?<=[，,；;、])/g).filter(s => s.trim());
  return clauses.map(s => s.trim()).filter(s => s.length > 0);
}

function extractTitle(paragraphs, maxLen = 24) {
  if (paragraphs.length === 0) return '无题';

  let first = paragraphs[0];
  first = first.replace(/^#{1,6}\s+/, '');
  if (first.length <= maxLen && !first.includes('\n')) {
    return first;
  }

  const firstLine = first.split('\n')[0];
  if (firstLine.length <= maxLen) return firstLine;

  const firstSentence = first.split(/[。！？!?…]/)[0];
  if (firstSentence.length <= maxLen) return firstSentence;

  const truncated = firstSentence.slice(0, maxLen);
  const lastBreak = Math.max(
    truncated.lastIndexOf('，'),
    truncated.lastIndexOf(','),
    truncated.lastIndexOf(' '),
    truncated.lastIndexOf('、')
  );
  if (lastBreak > maxLen * 0.5) {
    return truncated.slice(0, lastBreak) + '…';
  }
  return truncated + '…';
}

function estimateReadingTime(text) {
  const cjkCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const minutes = Math.ceil(cjkCount / 400);
  return Math.max(1, minutes);
}

function detectKeySentences(text, maxHighlights = 3) {
  const sentences = text.split(/[。！？\n]/).filter(s => {
    const t = s.trim();
    return t.length >= 15 && t.length <= 60;
  });

  const keywords = ['关键', '重要', '核心', '本质', '秘诀', '方法', '原则', '规律', '总结', '注意', '记住', '首先', '最重要'];
  const scored = sentences.map(s => {
    let score = s.length;
    for (const kw of keywords) {
      if (s.includes(kw)) score += 20;
    }
    return { text: s.trim(), score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxHighlights).map(s => s.text);
}

function splitIntoCards(text, opts = {}) {
  const density = DENSITY[opts.density] || DENSITY.comfortable;
  const charsPerCard = opts.charsPerCard || density.charsPerCard;
  const hasCover = opts.hasCover !== false;
  const hasEnd = opts.hasEnd !== false;
  const doHighlight = opts.highlight || false;

  const paragraphs = splitParagraphs(text);
  const title = opts.title || extractTitle(paragraphs);
  const readingTime = estimateReadingTime(text);

  let bodyParas = [...paragraphs];
  if (hasCover && !opts.title) {
    const firstClean = paragraphs[0].replace(/^#{1,6}\s+/, '').trim();
    if (firstClean === title) {
      bodyParas = paragraphs.slice(1);
    }
  }
  if (bodyParas.length === 0) bodyParas = [text];

  const keySentences = doHighlight ? detectKeySentences(text) : [];

  const cardContents = [];
  let currentChunks = [];
  let currentLen = 0;

  function flushCard() {
    if (currentChunks.length > 0) {
      cardContents.push(currentChunks.join('\n\n'));
      currentChunks = [];
      currentLen = 0;
    }
  }

  for (const para of bodyParas) {
    const isHeading = /^#{1,4}\s+/.test(para);
    const paraLen = para.length;

    if (currentLen + paraLen > charsPerCard && currentChunks.length > 0) {
      flushCard();
    }

    if (paraLen > charsPerCard) {
      const sentences = splitSentences(para);
      for (const sent of sentences) {
        if (sent.length > charsPerCard) {
          const clauses = splitClauses(sent);
          for (const clause of clauses) {
            if (currentLen + clause.length > charsPerCard && currentChunks.length > 0) {
              flushCard();
            }
            currentChunks.push(clause);
            currentLen += clause.length + 2;
          }
        } else {
          if (currentLen + sent.length > charsPerCard && currentChunks.length > 0) {
            flushCard();
          }
          currentChunks.push(sent);
          currentLen += sent.length + 2;
        }
      }
    } else {
      currentChunks.push(para);
      currentLen += paraLen + 2;
    }
  }
  flushCard();

  const cards = [];
  let pageNum = 0;

  if (hasCover) {
    cards.push({
      type: 'cover',
      content: null,
      title: title,
      subtitle: opts.subtitle || '',
      tag: opts.tag || '',
      author: opts.author || '',
      readingTime: readingTime,
      pageNum: 0,
    });
  }

  const totalContentCards = cardContents.length;
  for (let i = 0; i < cardContents.length; i++) {
    pageNum++;
    cards.push({
      type: 'content',
      content: cardContents[i],
      pageNum: pageNum,
      totalContentCards: totalContentCards,
      keySentences: keySentences,
    });
  }

  if (hasEnd) {
    cards.push({
      type: 'end',
      content: null,
      title: title,
      author: opts.author || '',
      pageNum: 0,
      totalContentCards: totalContentCards,
    });
  }

  return { title, cards, totalContentCards, readingTime };
}

// ============================================================
// Markdown Parsing
// ============================================================

function parseMarkdown(text) {
  const lines = text.split('\n');
  const htmlParts = [];
  let inList = false;
  let inQuote = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (inList && !trimmed.startsWith('- ') && !trimmed.startsWith('* ')) {
      htmlParts.push('</ul>');
      inList = false;
    }
    if (inQuote && !trimmed.startsWith('> ')) {
      htmlParts.push('</blockquote>');
      inQuote = false;
    }

    const h3Match = trimmed.match(/^###\s+(.+)/);
    const h2Match = trimmed.match(/^##\s+(.+)/);
    if (h2Match) {
      htmlParts.push(`<h2 class="md-heading">${escapeHtml(h2Match[1])}</h2>`);
      continue;
    }
    if (h3Match) {
      htmlParts.push(`<h3 class="md-heading">${escapeHtml(h3Match[1])}</h3>`);
      continue;
    }

    const quoteMatch = trimmed.match(/^>\s*(.*)/);
    if (quoteMatch) {
      if (!inQuote) {
        htmlParts.push('<blockquote>');
        inQuote = true;
      }
      htmlParts.push(`<p>${formatInline(quoteMatch[1])}</p>`);
      continue;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (listMatch) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li>${formatInline(listMatch[1])}</li>`);
      continue;
    }

    if (trimmed === '') {
      continue;
    }

    htmlParts.push(`<p>${formatInline(trimmed)}</p>`);
  }

  if (inList) htmlParts.push('</ul>');
  if (inQuote) htmlParts.push('</blockquote>');

  return htmlParts.join('\n');
}

function formatInline(text) {
  let result = escapeHtml(text);
  result = result.replace(/==(.+?)==/g, '<span class="md-highlight">$1</span>');
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  result = result.replace(/`(.+?)`/g, '<code>$1</code>');
  return result;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// HTML Generation
// ============================================================

function generateCardHTML(card, style, opts = {}) {
  const density = DENSITY[opts.density] || DENSITY.comfortable;
  const width = opts.width || DEFAULT_WIDTH;
  const height = Math.round(width * 4 / 3);
  const accentColor = opts.accentColor || style.accent;

  const css = generateCSS(style, density, width, height, accentColor);

  let bodyContent = '';
  if (card.type === 'cover') {
    bodyContent = generateCoverBody(card, style, density, accentColor);
  } else if (card.type === 'content') {
    bodyContent = generateContentBody(card, style, density, accentColor);
  } else if (card.type === 'end') {
    bodyContent = generateEndBody(card, style, density, accentColor);
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
${css}
</style>
</head>
<body>
<div class="card" style="width:${width}px; height:${height}px;">
${bodyContent}
</div>
</body>
</html>`;
}

function generateCSS(style, density, width, height, accentColor) {
  const bg = style.bgGradient || style.bg;

  return `
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  margin: 0;
  padding: 0;
  background: #f0f0f0;
  font-family: ${style.font};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.card {
  background: ${bg};
  color: ${style.text};
  padding: ${style.cardPadding};
  position: relative;
  overflow: hidden;
  font-size: ${density.fontSize}px;
  line-height: ${density.lineHeight};
  letter-spacing: 0.02em;
  display: flex;
  flex-direction: column;
  ${style.borderRadius !== '0px' ? `border-radius: ${style.borderRadius};` : ''}
}

.card::before, .card::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.decor-top-line::before {
  top: 0; left: 0; right: 0; height: 6px;
  background: ${accentColor};
}

.decor-magazine::before {
  top: 40px; left: 80px; width: 60px; height: 4px;
  background: ${accentColor};
}

.decor-glass .card-inner {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 24px;
  padding: 60px 50px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.decor-glow::before {
  top: -100px; right: -100px; width: 400px; height: 400px;
  background: radial-gradient(circle, ${accentColor}33 0%, transparent 70%);
  border-radius: 50%;
}

.decor-glow::after {
  bottom: -80px; left: -80px; width: 300px; height: 300px;
  background: radial-gradient(circle, ${accentColor}22 0%, transparent 70%);
  border-radius: 50%;
}

.decor-washi::before {
  top: 30px; right: 60px; width: 100px; height: 24px;
  background: ${accentColor};
  opacity: 0.6;
  transform: rotate(3deg);
  border-radius: 2px;
}

.decor-washi::after {
  top: 30px; right: 140px; width: 60px; height: 24px;
  background: ${accentColor}88;
  opacity: 0.5;
  transform: rotate(-2deg);
  border-radius: 2px;
}

.decor-ink::before {
  top: 50px; right: 50px; width: 50px; height: 50px;
  border: 2px solid ${accentColor};
  border-radius: 50%;
  opacity: 0.3;
}

.decor-ink::after {
  bottom: 60px; left: 60px; width: 80px; height: 2px;
  background: ${accentColor};
  opacity: 0.4;
}

.card h1, .card h2, .card h3 {
  font-family: ${style.headingFont};
  color: ${style.heading};
  line-height: 1.3;
}

.card h2.md-heading {
  font-size: ${density.headingSize}px;
  margin-bottom: 20px;
  margin-top: 10px;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.card h2.md-heading:first-child { margin-top: 0; }

.card h3.md-heading {
  font-size: ${Math.round(density.headingSize * 0.8)}px;
  margin-bottom: 14px;
  margin-top: 8px;
  font-weight: 600;
  color: ${style.subheading};
}

.card h3.md-heading:first-child { margin-top: 0; }

.card p {
  margin-bottom: ${density.paraSpacing}px;
  text-align: justify;
}

.card p:last-child { margin-bottom: 0; }

.card ul {
  margin-bottom: ${density.paraSpacing}px;
  padding-left: 32px;
}

.card ul li {
  margin-bottom: 8px;
  list-style: none;
  position: relative;
  padding-left: 8px;
}

.card ul li::before {
  content: '';
  position: absolute;
  left: -18px;
  top: 15px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${accentColor};
}

.card blockquote {
  border-left: 4px solid ${accentColor};
  padding: 16px 24px;
  margin-bottom: ${density.paraSpacing}px;
  background: ${style.quoteBg};
  border-radius: 0 8px 8px 0;
}

.card blockquote p {
  margin-bottom: 0;
  color: ${style.quoteColor};
  font-style: italic;
}

.card strong { font-weight: 700; color: ${style.heading}; }
.card em { font-style: italic; }

.card code {
  background: ${style.codeBg};
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: "Consolas", "Courier New", monospace;
}

.card .md-highlight {
  background: ${style.highlight};
  color: ${style.highlightText};
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.cover {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.cover-tag {
  display: inline-block;
  padding: 8px 20px;
  background: ${accentColor}22;
  color: ${accentColor};
  border: 1px solid ${accentColor}44;
  border-radius: 100px;
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 36px;
  font-family: ${style.font};
}

.cover-title {
  font-family: ${style.headingFont};
  font-size: 72px;
  font-weight: 800;
  line-height: 1.25;
  color: ${style.heading};
  margin-bottom: 28px;
  letter-spacing: 0.04em;
  word-break: break-word;
}

.cover-subtitle {
  font-size: 32px;
  line-height: 1.6;
  color: ${style.subheading};
  margin-bottom: 48px;
  font-weight: 400;
  max-width: 85%;
}

.cover-meta {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: auto;
  padding-top: 40px;
  border-top: 1px solid ${accentColor}33;
  width: 100%;
}

.cover-author { font-size: 28px; color: ${style.subheading}; font-weight: 500; }

.cover-reading {
  font-size: 26px;
  color: ${style.pageNum};
  display: flex;
  align-items: center;
  gap: 8px;
}

.cover-reading::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${accentColor};
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.content-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 20px;
}

.content-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid ${accentColor}22;
}

.page-num { font-size: 24px; color: ${style.pageNum}; letter-spacing: 0.05em; }
.page-brand { font-size: 22px; color: ${style.pageNum}; opacity: 0.7; }

.end-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 1;
}

.end-mark {
  font-size: 80px;
  font-weight: 800;
  color: ${style.heading};
  margin-bottom: 40px;
  font-family: ${style.headingFont};
  letter-spacing: 0.1em;
}

.end-divider {
  width: 60px; height: 3px;
  background: ${accentColor};
  margin-bottom: 36px;
  border-radius: 2px;
}

.end-title {
  font-size: 36px;
  color: ${style.subheading};
  margin-bottom: 50px;
  font-weight: 400;
  max-width: 80%;
  line-height: 1.5;
}

.end-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
}

.end-cta-text { font-size: 30px; color: ${style.text}; font-weight: 600; }
.end-cta-sub { font-size: 26px; color: ${style.pageNum}; }
.end-author { font-size: 28px; color: ${style.subheading}; margin-top: 20px; }

.decor-glass .content-body,
.decor-glass .cover,
.decor-glass .end-page { padding: 0; }

.decor-glass .card { padding: 40px; }
`;
}

function generateCoverBody(card, style, density, accentColor) {
  const decorClass = `decor-${style.decor}`;
  const hasGlass = style.decor === 'glass';
  const wrapperOpen = hasGlass ? `<div class="card-inner">` : '';
  const wrapperClose = hasGlass ? `</div>` : '';

  let tagHtml = card.tag ? `<div class="cover-tag">${escapeHtml(card.tag)}</div>` : '';
  let subtitleHtml = card.subtitle ? `<div class="cover-subtitle">${escapeHtml(card.subtitle)}</div>` : '';

  const metaParts = [];
  if (card.author) metaParts.push(`<span class="cover-author">@ ${escapeHtml(card.author)}</span>`);
  metaParts.push(`<span class="cover-reading">约 ${card.readingTime} 分钟阅读</span>`);
  const metaHtml = `<div class="cover-meta">${metaParts.join('')}</div>`;

  return `
<div class="${decorClass} card-wrapper" style="flex:1; display:flex; flex-direction:column;">
${wrapperOpen}
<div class="cover">
  ${tagHtml}
  <h1 class="cover-title">${escapeHtml(card.title)}</h1>
  ${subtitleHtml}
  ${metaHtml}
</div>
${wrapperClose}
</div>`;
}

function generateContentBody(card, style, density, accentColor) {
  const decorClass = `decor-${style.decor}`;
  const hasGlass = style.decor === 'glass';
  const wrapperOpen = hasGlass ? `<div class="card-inner">` : '';
  const wrapperClose = hasGlass ? `</div>` : '';

  let contentHtml = parseMarkdown(card.content);

  if (card.keySentences && card.keySentences.length > 0) {
    for (const ks of card.keySentences) {
      const escaped = escapeHtml(ks);
      if (contentHtml.includes(escaped)) {
        contentHtml = contentHtml.replace(escaped, `<span class="md-highlight">${escaped}</span>`);
      }
    }
  }

  const pageNumText = card.totalContentCards
    ? `${String(card.pageNum).padStart(2, '0')} / ${String(card.totalContentCards).padStart(2, '0')}`
    : String(card.pageNum);

  return `
<div class="${decorClass} card-wrapper" style="flex:1; display:flex; flex-direction:column;">
${wrapperOpen}
<div class="content">
  <div class="content-body">
${contentHtml}
  </div>
  <div class="content-footer">
    <span class="page-num">${pageNumText}</span>
    <span class="page-brand">· · ·</span>
  </div>
</div>
${wrapperClose}
</div>`;
}

function generateEndBody(card, style, density, accentColor) {
  const decorClass = `decor-${style.decor}`;
  const hasGlass = style.decor === 'glass';
  const wrapperOpen = hasGlass ? `<div class="card-inner">` : '';
  const wrapperClose = hasGlass ? `</div>` : '';

  let authorHtml = card.author ? `<div class="end-author">@ ${escapeHtml(card.author)}</div>` : '';

  return `
<div class="${decorClass} card-wrapper" style="flex:1; display:flex; flex-direction:column;">
${wrapperOpen}
<div class="end-page">
  <div class="end-mark">完</div>
  <div class="end-divider"></div>
  <div class="end-title">「${escapeHtml(card.title)}」</div>
  <div class="end-cta">
    <div class="end-cta-text">关注我，获取更多干货</div>
    <div class="end-cta-sub">点赞 · 收藏 · 转发</div>
  </div>
  ${authorHtml}
</div>
${wrapperClose}
</div>`;
}

// ============================================================
// Browser Rendering
// ============================================================

/**
 * Convert a file path to a file:// URL, cross-platform.
 */
function pathToFileURL(filePath) {
  // Normalize to forward slashes
  const normalized = filePath.replace(/\\/g, '/');
  // Windows needs leading slash before drive letter
  if (os.platform() === 'win32') {
    return 'file:///' + normalized;
  }
  return 'file://' + normalized;
}

async function renderToPNG(htmlContents, outputDir, width, opts = {}) {
  const puppeteer = ensurePuppeteer();

  const browserPath = findBrowser();
  if (!browserPath) {
    throw new Error(
      'No Chrome/Edge/Chromium browser found.\n' +
      'Please install Google Chrome or Microsoft Edge, or set PUPPETEER_EXECUTABLE_PATH env var.'
    );
  }

  console.log(`  Browser: ${browserPath}`);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      `--force-device-scale-factor=${opts.scale || 2}`,
    ],
  });

  const images = [];
  const scale = opts.scale || 2;

  for (let i = 0; i < htmlContents.length; i++) {
    const page = await browser.newPage();
    await page.setViewport({
      width: width,
      height: Math.round(width * 4 / 3),
      deviceScaleFactor: scale,
    });

    const tmpHtml = path.join(outputDir, `_temp_card_${i}.html`);
    fs.writeFileSync(tmpHtml, htmlContents[i], 'utf-8');

    await page.goto(pathToFileURL(tmpHtml), {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    const imageName = `card_${String(i + 1).padStart(2, '0')}.png`;
    const imagePath = path.join(outputDir, imageName);

    await page.screenshot({
      path: imagePath,
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: width,
        height: Math.round(width * 4 / 3),
      },
    });

    images.push(imagePath);

    try { fs.unlinkSync(tmpHtml); } catch (e) { /* ignore */ }

    await page.close();
    console.log(`  \u2713 ${imageName}`);
  }

  await browser.close();
  return images;
}

// ============================================================
// CLI
// ============================================================

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const val = argv[i + 1];
      if (val && !val.startsWith('--')) {
        args[key] = val;
        i++;
      } else {
        args[key] = true;
      }
    } else {
      args._.push(arg);
    }
  }
  return args;
}

function printHelp() {
  console.log(`
Social Card Generator | 社交卡片生成器
Convert long-form text into beautifully typeset 3:4 social card images.

Usage:
  node generate-cards.js --input <text|file> [options]

Options:
  --style <name>        Layout style (default: minimal-white)
                        minimal-white | cream-magazine | aurora-gradient
                        dark-night | journal-note | chinese-ink
  --output <dir>        Output directory (default: ./output)
  --chars-per-card <n>  Max characters per card (default: 220)
  --title <text>        Override cover title
  --subtitle <text>     Cover subtitle
  --tag <text>          Topic tag on cover (e.g. #干货分享)
  --author <text>       Author name on cover/end
  --no-cover            Skip cover page
  --no-end              Skip end page
  --preview             Generate HTML preview file only (no PNG)
  --density <type>      compact | comfortable | spacious (default: comfortable)
  --highlight           Auto-highlight key sentences
  --accent-color <hex>  Override accent color
  --width <n>           Image width in pixels (default: 1080)
  --scale <n>           Render scale factor (default: 2)

Examples:
  node generate-cards.js --input article.txt --style cream-magazine --tag #读书笔记
  node generate-cards.js --input "这是一段长文案..." --style aurora-gradient --highlight
  echo "文案内容" | node generate-cards.js --style dark-night --output ./cards
`);
}

function generatePreviewHTML(htmlContents, cardCount) {
  const cards = htmlContents.map((html, i) => {
    const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
    const styleMatch = html.match(/<style>([\s\S]*)<\/style>/);
    const body = bodyMatch ? bodyMatch[1] : '';
    const style = styleMatch ? styleMatch[1] : '';
    return `
<div class="preview-card-wrapper">
  <div class="preview-label">Card ${i + 1} / ${cardCount}</div>
  <div class="preview-card">
    <style scoped>${style}</style>
    ${body}
  </div>
</div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>卡片预览 - ${cardCount} 张</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #2a2a2a; padding: 40px 20px; font-family: sans-serif; }
.preview-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 40px; }
.preview-card-wrapper { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.preview-label { color: #888; font-size: 14px; font-weight: 600; }
.preview-card { box-shadow: 0 8px 32px rgba(0,0,0,0.4); overflow: hidden; }
.preview-card .card { box-shadow: none; }
</style>
</head>
<body>
<div class="preview-container">
${cards}
</div>
</body>
</html>`;
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help || args.h) {
    printHelp();
    return;
  }

  let text = '';
  if (args.input) {
    if (fs.existsSync(args.input)) {
      text = fs.readFileSync(args.input, 'utf-8');
    } else {
      text = args.input;
    }
  } else if (args._.length > 0) {
    const first = args._[0];
    if (fs.existsSync(first)) {
      text = fs.readFileSync(first, 'utf-8');
    } else {
      text = first;
    }
  } else {
    text = fs.readFileSync(0, 'utf-8');
  }

  text = text.trim();
  if (!text) {
    console.error('Error: no text provided');
    process.exit(1);
  }

  const styleName = args.style || 'minimal-white';
  const style = STYLES[styleName];
  if (!style) {
    console.error(`Error: unknown style "${styleName}"\nAvailable: ${Object.keys(STYLES).join(', ')}`);
    process.exit(1);
  }

  const opts = {
    density: args.density || 'comfortable',
    charsPerCard: args['chars-per-card'] ? parseInt(args['chars-per-card']) : null,
    hasCover: args['no-cover'] !== true,
    hasEnd: args['no-end'] !== true,
    highlight: args.highlight === true,
    title: args.title || null,
    subtitle: args.subtitle || null,
    tag: args.tag || null,
    author: args.author || null,
    accentColor: args['accent-color'] || null,
    width: args.width ? parseInt(args.width) : DEFAULT_WIDTH,
  };

  console.log(`\nProcessing...`);
  console.log(`   Style: ${style.name} (${styleName})`);
  console.log(`   Density: ${opts.density}`);
  console.log(`   Total chars: ${text.length}`);

  const result = splitIntoCards(text, opts);

  console.log(`   Title: ${result.title}`);
  console.log(`   Reading time: ~${result.readingTime} min`);
  console.log(`   Cards: ${result.cards.length}`);
  console.log('');

  const outputDir = args.output ? path.resolve(args.output) : path.resolve(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const htmlContents = [];
  for (let i = 0; i < result.cards.length; i++) {
    const card = result.cards[i];
    const html = generateCardHTML(card, style, opts);
    htmlContents.push(html);

    const htmlPath = path.join(outputDir, `card_${String(i + 1).padStart(2, '0')}.html`);
    fs.writeFileSync(htmlPath, html, 'utf-8');
  }

  const previewPath = path.join(outputDir, 'preview.html');
  const previewHtml = generatePreviewHTML(htmlContents, result.cards.length);
  fs.writeFileSync(previewPath, previewHtml, 'utf-8');
  console.log(`HTML preview: ${previewPath}\n`);

  if (args.preview) {
    console.log('Preview mode: HTML only, skipping PNG rendering.');
    console.log(`\nDone! ${htmlContents.length} card HTML files generated.`);
    console.log(`   Preview: ${previewPath}`);
    return;
  }

  console.log('Rendering PNG images...');
  try {
    const scale = args.scale ? parseInt(args.scale) : 2;
    const images = await renderToPNG(htmlContents, outputDir, opts.width, { scale });

    for (let i = 0; i < htmlContents.length; i++) {
      const htmlPath = path.join(outputDir, `card_${String(i + 1).padStart(2, '0')}.html`);
      try { fs.unlinkSync(htmlPath); } catch (e) { /* ignore */ }
    }

    console.log(`\nDone! ${images.length} card images generated.`);
    console.log(`   Output: ${outputDir}`);
    console.log(`   Size: ${opts.width * scale} x ${Math.round(opts.width * 4 / 3) * scale} px (${scale}x)`);
    console.log(`   Preview: ${previewPath}`);
  } catch (err) {
    console.error(`\nPNG rendering failed: ${err.message}`);
    console.error('   HTML preview files are still available:');
    console.error(`   ${previewPath}`);
    process.exit(1);
  }
}

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
