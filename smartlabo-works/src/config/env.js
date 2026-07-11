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

  // 認証（最小構成。将来 Workspace → Company → User → Role 構造へ拡張予定。
  // 現時点は単一企業・単一ユーザーのみサポートし、companyIdは固定値で運用する）
  auth: {
    companyId: process.env.AUTH_COMPANY_ID || 'default',
    email:     process.env.AUTH_EMAIL || 'ogawa@smartlabo-works.local',
    // "salt:hash" 形式（node crypto.scryptSync）。開発用デフォルトは既存パスワード「smartlabo2024」と同一のハッシュ。
    // 本番運用前に必ず .env の AUTH_EMAIL / AUTH_PASSWORD_HASH を差し替えること（生成方法は .env.example 参照）。
    passwordHash: process.env.AUTH_PASSWORD_HASH ||
      '4bb7826c9c2633274a82b0795ce9f42e:fb011508f4c55c342e3fed9bda34c22afa1a07969f227169a854516886a467da9c6bbeecc03ccb9ec007a3208971f16bfb35e0dbd54bd5589729d7b61af0cf1c',
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
