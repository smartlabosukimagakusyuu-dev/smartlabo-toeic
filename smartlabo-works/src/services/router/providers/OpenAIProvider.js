/**
 * Smart Labo Works — Smart AI Router: OpenAIProvider（Sprint3 Task1）
 *
 * AIProvider（../interfaces/AIProvider.js）を実装する。
 * 実際のOpenAI呼び出しは既存の src/services/ai/providers/openaiProvider.js を
 * そのまま再利用する（CEO指示：「OpenAIは既存実装を活用」）。
 * ここでは新しい共通インターフェース（chat/summarize/generate/analyze）への
 * 薄いアダプターだけを提供する。
 */

const legacyProvider = require('../../ai/providers/openaiProvider');

/**
 * @param {import('../interfaces/AIProvider').ChatInput} input
 * @param {import('../interfaces/AIProvider').AIRequestOptions} [options]
 */
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
 * PDF・画像等の解析。Sprint3 Task1時点ではテキスト入力の解析のみ対応
 * （画像・PDFバイナリの解析は未実装。将来のOCR/画像解析タスクで拡張する）。
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
