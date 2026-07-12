/**
 * Smart Labo Works — Smart AI Router: ClaudeProvider（Sprint3 Task1）
 *
 * AIProvider（../interfaces/AIProvider.js）を実装する。
 * 実際のClaude呼び出しは既存の src/services/ai/providers/claudeProvider.js を再利用する。
 * 正式な本格実装（プロンプト最適化・専用の要約/生成フロー等）はSprint3 Task2
 * 「Claude API正式実装」で行う。今回は共通インターフェースへの接続のみ。
 */

const legacyProvider = require('../../ai/providers/claudeProvider');

async function chat(input, options = {}) {
  return legacyProvider.chat(input.systemPrompt, input.message, options);
}

async function summarize(text, options = {}) {
  return legacyProvider.chat(
    'あなたは優秀な要約アシスタントです。与えられた文章を簡潔に要約してください。',
    text,
    options
  );
}

async function generate(prompt, options = {}) {
  return legacyProvider.chat(
    'あなたは株式会社スマートラボの業務AIアシスタントです。指示に沿って実用的な文書を作成してください。',
    prompt,
    options
  );
}

/**
 * PDF・画像等の解析。Sprint3 Task1時点ではテキスト入力の解析のみ対応。
 */
async function analyze(text, options = {}) {
  return legacyProvider.chat(
    'あなたは与えられた内容を分析し、要点を整理するアシスタントです。',
    text,
    options
  );
}

async function testConnection() {
  return legacyProvider.testConnection();
}

function isAvailable() {
  return legacyProvider.isAvailable();
}

module.exports = { chat, summarize, generate, analyze, testConnection, isAvailable };
