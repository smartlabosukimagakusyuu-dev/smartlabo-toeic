/**
 * Smart Labo Works — AI Router v1.0
 *
 * Smart Labo Works の全AIを管理するマスタールーター。
 * AIを直接呼び出してはいけない。必ずこのRouterを経由すること。
 *
 *   呼び出し元（server.js / サービス層）
 *       ↓  router.route(feature, message, options)
 *   Router（このファイル）  — featureをProviderNameにマッピング
 *       ↓  provider.chat(system, message, options)
 *   Provider（openaiProvider / claudeProvider / ...）
 *       ↓  https request
 *   外部AI API（OpenAI / Anthropic / Gemini / ...）
 *
 * 新しいProviderを追加する方法（このRouter本体を書き換える必要はない）:
 *   1. providers/ に xxxProvider.js を作成し、IProvider（../types/aiTypes.js）の
 *      4関数 chat / testConnection / getAvailableModels / isAvailable を実装
 *   2. PROVIDERS に登録
 *   3. ROUTE_TABLE の対象featureに割り当て
 *   以上。可用性判定（isProviderAvailable）はProvider自身のisAvailable()を呼ぶだけなので、
 *   Provider固有のconfig項目をRouterが知る必要はない。
 */

const config  = require('../../../config/env');
const prompts = require('../promptManager');

// ==========================================
// Provider レジストリ
// 追加: ここに新しいProviderをimportして登録する
// ==========================================
const PROVIDERS = {
  openai: require('../providers/openaiProvider'),
  claude: require('../providers/claudeProvider'),
  // gemini:  require('../providers/geminiProvider'),   // 将来: Gemini Vision
  // whisper: require('../providers/whisperProvider'),  // 将来: 音声→テキスト
  // ocr:     require('../providers/ocrProvider'),      // 将来: 画像OCR
};

// ==========================================
// ルーティングテーブル
// feature → ProviderName のマッピング
// 変更することでfeatureごとにAIを切り替えられる
// ==========================================
const ROUTE_TABLE = {
  companyBrain:  'openai',
  assistant:     'openai',
  meeting:       'openai',
  sales:         'openai',
  projectBible:  'openai',
  claudePrompt:  'claude',  // Claude Prompt生成はClaudeが担当
  innovation:    'openai',
  imageAnalysis: 'gemini',  // 将来: Gemini Vision
  voiceToText:   'whisper', // 将来: Whisper
  ocr:           'ocr',     // 将来: OCR
};

// ==========================================
// システムプロンプト解決
// ==========================================
function resolveSystemPrompt(feature, options = {}) {
  if (options.systemPrompt) return options.systemPrompt;
  switch (feature) {
    case 'companyBrain':  return prompts.companyBrain.system;
    case 'assistant':     return prompts.assistant.system;
    case 'meeting':       return prompts.meeting.system;
    case 'sales':         return prompts.sales.system;
    case 'projectBible':  return prompts.projectBible.system;
    case 'claudePrompt':  return prompts.claudePrompt.system;
    case 'innovation':    return prompts.innovationReview.system;
    default:              return 'あなたは株式会社スマートラボのAIアシスタントです。';
  }
}

// ==========================================
// メインルーティング関数
// ==========================================

/**
 * featureに応じた適切なProviderへルーティングし、AIを呼び出す。
 *
 * @param {string} feature  - 機能名（ROUTE_TABLE のキー）
 * @param {string} userMessage
 * @param {import('../types/aiTypes').AIRequestOptions} options
 * @returns {Promise<import('../types/aiTypes').RouterResult>}
 */
async function route(feature, userMessage, options = {}) {
  const providerName = ROUTE_TABLE[feature] || config.app.aiMode || 'openai';
  const startTime    = Date.now();

  const provider = PROVIDERS[providerName];
  if (!provider) {
    return {
      content:      null,
      provider:     providerName,
      model:        '',
      usage:        null,
      processingMs: Date.now() - startTime,
      success:      false,
      error:        `Provider "${providerName}" は未実装です。providers/ に追加してください。`,
    };
  }

  try {
    const systemPrompt = resolveSystemPrompt(feature, options);
    const result       = await provider.chat(systemPrompt, userMessage, options);

    return {
      content:      result.content,
      provider:     providerName,
      model:        result.model,
      usage:        result.usage,
      processingMs: Date.now() - startTime,
      success:      true,
    };

  } catch (e) {
    return {
      content:      null,
      provider:     providerName,
      model:        '',
      usage:        null,
      processingMs: Date.now() - startTime,
      success:      false,
      error:        e.message,
    };
  }
}

// ==========================================
// ステータス・ユーティリティ
// ==========================================

/**
 * 現在のルーティング設定と各Providerの状態を返す（設定画面・ログ表示用）
 * @returns {Array<{feature: string, provider: string, available: boolean}>}
 */
function getRouterStatus() {
  return Object.entries(ROUTE_TABLE).map(([feature, providerName]) => ({
    feature,
    provider:  providerName,
    available: isProviderAvailable(providerName),
  }));
}

/**
 * 指定Providerが利用可能かチェックする。
 * Provider固有の判定（APIキー有無・実装状況など）はProvider自身のisAvailable()に委譲し、
 * Router側は個別のconfig項目を一切参照しない（新Provider追加時にこの関数を変更しなくてよい）。
 * @param {string} providerName
 * @returns {boolean}
 */
function isProviderAvailable(providerName) {
  const provider = PROVIDERS[providerName];
  return provider ? provider.isAvailable() : false;
}

/**
 * 登録済みの全Providerを返す
 * @returns {string[]}
 */
function getRegisteredProviders() {
  return Object.keys(PROVIDERS);
}

module.exports = { route, getRouterStatus, isProviderAvailable, getRegisteredProviders, ROUTE_TABLE };
