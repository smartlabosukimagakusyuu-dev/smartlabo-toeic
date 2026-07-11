/**
 * Smart Labo Works — Claude Provider
 * Anthropic Messages API との通信を担当する。
 *
 * 直接呼び出し禁止。必ず router/router.js 経由で使用すること。
 * IProvider インターフェース（types/aiTypes.js）を実装している。
 *
 * APIキー: .env の ANTHROPIC_API_KEY
 * 対応モデル: claude-sonnet-5, claude-haiku-4-5, claude-opus-4-8 など
 */

const https  = require('https');
const config = require('../../../config/env');

/**
 * Anthropic Messages API を呼び出す
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {import('../types/aiTypes').AIRequestOptions} options
 * @returns {Promise<import('../types/aiTypes').ProviderResult>}
 */
async function chat(systemPrompt, userMessage, options = {}) {
  const apiKey = config.claude.apiKey;
  if (!apiKey || apiKey.length < 10) {
    throw new Error('Claude APIキーが設定されていません。.env の ANTHROPIC_API_KEY を確認してください。');
  }

  const model     = options.model     || config.claude.model;
  const maxTokens = options.maxTokens || 2000;

  const body = JSON.stringify({
    model,
    max_tokens: maxTokens,
    system:     systemPrompt,
    messages: [
      { role: 'user', content: userMessage },
    ],
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length':    Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(`Claude Error: ${json.error.message}`));
            return;
          }
          // Anthropic Messages API のレスポンス形式
          // content[0].text がテキスト応答
          // usage: { input_tokens, output_tokens }
          resolve({
            content: json.content[0].text,
            model:   json.model,
            usage: {
              prompt_tokens:     json.usage.input_tokens,
              completion_tokens: json.usage.output_tokens,
              total_tokens:      json.usage.input_tokens + json.usage.output_tokens,
            },
          });
        } catch (e) {
          reject(new Error('Claude レスポンスのパースに失敗しました'));
        }
      });
    });

    req.on('error', e => reject(new Error(`Claude 接続エラー: ${e.message}`)));
    req.write(body);
    req.end();
  });
}

/**
 * 接続テスト
 * @returns {Promise<{ok: boolean, model: string, message: string}>}
 */
async function testConnection() {
  try {
    const result = await chat(
      'あなたはテスト用AIです。',
      'Smart Labo Works Claude接続テストです。「接続OK」とだけ返答してください。',
      { maxTokens: 20 }
    );
    return { ok: true, model: result.model, message: result.content.trim() };
  } catch (e) {
    return { ok: false, model: '', message: e.message };
  }
}

/**
 * 利用可能なモデル一覧
 */
function getAvailableModels() {
  return [
    { id: 'claude-sonnet-5',          name: 'Claude Sonnet 5',    desc: '最高性能・バランス型（推奨）' },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5',  desc: '高速・低コスト' },
    { id: 'claude-opus-4-8',           name: 'Claude Opus 4.8',   desc: '最高精度・複雑タスク向け' },
  ];
}

/**
 * このProviderが現在呼び出し可能か（APIキー設定済みか）
 * @returns {boolean}
 */
function isAvailable() {
  return config.claude.enabled;
}

module.exports = { chat, testConnection, getAvailableModels, isAvailable };
