/**
 * Smart Labo Works — Smart AI Router: GeminiProvider（Sprint3 Task1）
 *
 * AIProvider（../interfaces/AIProvider.js）を実装する。
 * CEO指示：「Geminiは今回API接続確認だけで構いません」。
 * 実際のGemini API（generateContent）への疎通は本物の呼び出しで確認できるようにし、
 * chat/summarize/generate はその同じ仕組みを使って実用可能な形で実装した
 * （テキストの往復に限れば実際に動く。画像・PDFバイナリ入力の解析＝真のマルチモーダル対応は
 * このTaskの範囲外で、analyze()は現時点ではテキスト解析のみに対応する）。
 *
 * 既存の src/services/ai/providers/openaiProvider.js・claudeProvider.js と同じ流儀で、
 * npm依存を増やさず素のhttpsモジュールで呼び出す。
 */

const https  = require('https');
const config = require('../../../config/env');

/**
 * Gemini generateContent APIを呼び出す
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {import('../interfaces/AIProvider').AIRequestOptions} [options]
 */
async function callGemini(systemPrompt, userMessage, options = {}) {
  const apiKey = config.gemini.apiKey;
  if (!apiKey || apiKey.length < 10) {
    throw new Error('Gemini APIキーが設定されていません。.env の GEMINI_API_KEY を確認してください。');
  }

  const model = options.model || config.gemini.model;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: userMessage }] }],
    systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
    generationConfig: {
      maxOutputTokens: options.maxTokens || 1000,
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
    },
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path:     `/v1beta/models/${model}:generateContent?key=${apiKey}`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(`Gemini Error: ${json.error.message}`));
            return;
          }
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            reject(new Error('Gemini レスポンスにテキストが含まれていません'));
            return;
          }
          resolve({
            content: text,
            model,
            usage: json.usageMetadata ? {
              prompt_tokens:     json.usageMetadata.promptTokenCount,
              completion_tokens: json.usageMetadata.candidatesTokenCount,
              total_tokens:      json.usageMetadata.totalTokenCount,
            } : null,
          });
        } catch (e) {
          reject(new Error('Gemini レスポンスのパースに失敗しました'));
        }
      });
    });

    req.on('error', e => reject(new Error(`Gemini 接続エラー: ${e.message}`)));
    req.write(body);
    req.end();
  });
}

async function chat(input, options = {}) {
  return callGemini(input.systemPrompt, input.message, options);
}

async function summarize(text, options = {}) {
  return callGemini('あなたは優秀な要約アシスタントです。与えられた文章を簡潔に要約してください。', text, options);
}

async function generate(prompt, options = {}) {
  return callGemini('あなたは株式会社スマートラボの業務AIアシスタントです。指示に沿って実用的な文書を作成してください。', prompt, options);
}

/**
 * PDF・画像・図面等の解析。Sprint3 Task1時点ではテキスト入力の解析のみ対応
 * （画像・PDFバイナリの解析は将来のOCR/画像解析タスクで実装する）。
 */
async function analyze(text, options = {}) {
  return callGemini('あなたは与えられた内容を分析し、要点を整理するアシスタントです。', text, options);
}

/**
 * 接続テスト（CEO指示の「API接続確認」の本体）
 * @returns {Promise<{ok: boolean, model: string, message: string}>}
 */
async function testConnection() {
  try {
    const result = await callGemini(
      'あなたはテスト用AIです。',
      'Smart Labo Works Gemini接続テストです。「接続OK」とだけ返答してください。',
      { maxTokens: 20 }
    );
    return { ok: true, model: result.model, message: result.content.trim() };
  } catch (e) {
    return { ok: false, model: '', message: e.message };
  }
}

function isAvailable() {
  return config.gemini.enabled;
}

module.exports = { chat, summarize, generate, analyze, testConnection, isAvailable };
