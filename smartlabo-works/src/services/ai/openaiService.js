/**
 * Smart Labo Works — OpenAI Service
 * OpenAI APIとの通信を担当する。直接画面から呼ばない。
 * 必ず router.js 経由で使用すること。
 */

const https = require('https');
const config = require('../../config/env');

/**
 * OpenAI Chat Completions API を呼び出す
 * @param {string} systemPrompt - システムプロンプト
 * @param {string} userMessage  - ユーザーメッセージ
 * @param {Object} options      - { model, maxTokens, temperature }
 * @returns {Promise<{content: string, usage: Object, model: string}>}
 */
async function chat(systemPrompt, userMessage, options = {}) {
  const apiKey = config.openai.apiKey;
  if (!apiKey || apiKey.length < 10) {
    throw new Error('OpenAI APIキーが設定されていません。.env ファイルを確認してください。');
  }

  const model       = options.model       || config.openai.model;
  const maxTokens   = options.maxTokens   || config.openai.maxTokens;
  const temperature = options.temperature !== undefined ? options.temperature : config.openai.temperature;

  const body = JSON.stringify({
    model,
    messages: [
      { role: 'system',  content: systemPrompt },
      { role: 'user',    content: userMessage  },
    ],
    max_tokens:  maxTokens,
    temperature,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path:     '/v1/chat/completions',
      method:   'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(`OpenAI Error: ${json.error.message}`));
            return;
          }
          resolve({
            content: json.choices[0].message.content,
            usage:   json.usage,
            model:   json.model,
          });
        } catch (e) {
          reject(new Error('OpenAI レスポンスのパースに失敗しました'));
        }
      });
    });

    req.on('error', (e) => reject(new Error(`OpenAI 接続エラー: ${e.message}`)));
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
      'Smart Labo Worksの接続テストです。「接続OK」とだけ返答してください。',
      { maxTokens: 20, temperature: 0 }
    );
    return { ok: true, model: result.model, message: result.content.trim() };
  } catch (e) {
    return { ok: false, model: '', message: e.message };
  }
}

/**
 * 利用可能なモデル一覧（固定リスト）
 */
function getAvailableModels() {
  return [
    { id: 'gpt-4o',        name: 'GPT-4o',         desc: '最高性能・バランス型' },
    { id: 'gpt-4o-mini',   name: 'GPT-4o mini',    desc: '高速・低コスト' },
    { id: 'gpt-4-turbo',   name: 'GPT-4 Turbo',    desc: '大容量コンテキスト' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo',  desc: '超高速・最低コスト' },
  ];
}

module.exports = { chat, testConnection, getAvailableModels };
