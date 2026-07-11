/**
 * Smart Labo Works — 環境変数設定
 * .env から読み込み、アプリ全体で使用する設定を提供する
 */

const path = require('path');

// .env を読み込む（dotenvがない場合は手動パース）
function loadEnv() {
  const fs = require('fs');
  const envPath = path.join(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.substring(0, idx).trim();
    const val = trimmed.substring(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const config = {
  // OpenAI
  openai: {
    apiKey:      process.env.OPENAI_API_KEY || '',
    model:       process.env.OPENAI_MODEL || 'gpt-4o',
    maxTokens:   parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },

  // Claude (将来)
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model:  process.env.CLAUDE_MODEL || 'claude-sonnet-5',
  },

  // Gemini (将来)
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model:  process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  },

  // Whisper (将来)
  whisper: {
    model: process.env.WHISPER_MODEL || 'whisper-1',
  },

  // アプリ設定
  app: {
    port:   parseInt(process.env.PORT || '3006'),
    aiMode: process.env.AI_MODE || 'openai', // 'openai' | 'claude' | 'gemini' | 'manual'
  },
};

// APIキーが設定されているか確認
config.openai.enabled  = config.openai.apiKey.length > 10;
config.claude.enabled  = config.claude.apiKey.length > 10;
config.gemini.enabled  = config.gemini.apiKey.length > 10;

module.exports = config;
