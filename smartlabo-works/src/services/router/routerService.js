/**
 * Smart Labo Works — Smart AI Router（Sprint3 Task1）
 *
 * Smart Labo Works独自技術「Smart AI Router」の本体。
 * ユーザーはAIを選択しない。仕事内容からRouterが最適なAIを自動選択する。
 *
 *   呼び出し元
 *       ↓  routerService.dispatch({ jobType, input, options })
 *   ①入力解析・仕事分類（jobClassifier.js）
 *       ↓
 *   ②Provider選択（routeTable.js）
 *       ↓
 *   ③AI呼び出し（providers/*、AIProviderインターフェース経由）
 *       ↓
 *   ④レスポンス統合・ログ記録（routerMonitor.js）
 *
 * 新しいAIを追加する方法（このファイル本体を書き換える必要はない）:
 *   1. providers/ に XxxProvider.js を作成し、AIProvider（interfaces/AIProvider.js）の
 *      chat/summarize/generate/analyze/testConnection/isAvailable を実装
 *   2. PROVIDERS に登録
 *   3. routeTable.js の ROUTE_TABLE に対象jobTypeを割り当て（新しいjobTypeも同ファイルに追加）
 *   以上。PROVIDERSとROUTE_TABLEは単純な設定オブジェクトのため、
 *   将来ここを設定画面から編集可能にすることも想定している（今回は固定）。
 */

const { classify } = require('./jobClassifier');
const { ROUTE_TABLE, DEFAULT_ROUTE, JOB_TYPES } = require('./routeTable');
const monitor = require('./routerMonitor');

// ==========================================
// Provider レジストリ
// 追加: ここに新しいProviderをimportして登録する
// ==========================================
const PROVIDERS = {
  openai: require('./providers/OpenAIProvider'),
  claude: require('./providers/ClaudeProvider'),
  gemini: require('./providers/GeminiProvider'),
  // whisper: require('./providers/WhisperProvider'), // 将来: 音声→テキスト
  // ocr:     require('./providers/OCRProvider'),     // 将来: 画像OCR
};

/**
 * @typedef {Object} DispatchParams
 * @property {string} [jobType]  - routeTable.JOB_TYPES のいずれか（分かっていれば指定）
 * @property {import('./interfaces/AIProvider').ChatInput|string} input
 *   - chatを使うjobTypeは {systemPrompt, message}、summarize/generate/analyzeは文字列
 * @property {import('./interfaces/AIProvider').AIRequestOptions} [options]
 */

/**
 * 仕事内容に応じて最適なAI Providerへルーティングし、呼び出す。
 * @param {DispatchParams} params
 * @returns {Promise<{success: boolean, jobType: string, provider: string, method?: string, content?: string, model?: string, usage?: Object, processingMs: number, error?: string}>}
 */
async function dispatch(params) {
  const { jobType: explicitJobType, input, options = {} } = params || {};
  const startTime = Date.now();
  const questionSummary = typeof input === 'string' ? input : (input && input.message) || '';

  // ①入力解析・仕事分類
  const jobType = classify(explicitJobType, questionSummary);

  // ②Provider選択
  const route = ROUTE_TABLE[jobType] || DEFAULT_ROUTE;
  const provider = PROVIDERS[route.provider];

  if (!provider) {
    const processingMs = Date.now() - startTime;
    const error = `Provider "${route.provider}" は未登録です。providers/ に追加してください。`;
    monitor.log({ question: questionSummary, jobType, provider: route.provider, processingMs, success: false, error });
    return { success: false, jobType, provider: route.provider, error, processingMs };
  }

  // ③AI呼び出し
  try {
    const method = provider[route.method];
    if (typeof method !== 'function') {
      throw new Error(`Provider "${route.provider}" は method "${route.method}" を実装していません`);
    }
    const result = await method.call(provider, input, options);

    // ④レスポンス統合・ログ記録
    const processingMs = Date.now() - startTime;
    monitor.log({ question: questionSummary, jobType, provider: route.provider, processingMs, success: true });
    return {
      success: true,
      jobType,
      provider: route.provider,
      method: route.method,
      content: result.content,
      model: result.model,
      usage: result.usage,
      processingMs,
    };
  } catch (e) {
    const processingMs = Date.now() - startTime;
    monitor.log({ question: questionSummary, jobType, provider: route.provider, processingMs, success: false, error: e.message });
    return { success: false, jobType, provider: route.provider, error: e.message, processingMs };
  }
}

/**
 * 現在のルーティング設定と各Providerの可用性を返す（将来の設定画面・監視用）
 * @returns {Array<{jobType: string, provider: string, method: string, available: boolean}>}
 */
function getRouterStatus() {
  return Object.entries(ROUTE_TABLE).map(([jobType, route]) => ({
    jobType,
    provider:  route.provider,
    method:    route.method,
    available: PROVIDERS[route.provider] ? PROVIDERS[route.provider].isAvailable() : false,
  }));
}

/**
 * Router Monitorのログを返す（画面は今回実装しない。内部確認用）
 */
function getMonitorLogs() {
  return monitor.getLogs();
}

/**
 * 登録済みの全Providerを返す
 */
function getRegisteredProviders() {
  return Object.keys(PROVIDERS);
}

module.exports = { dispatch, getRouterStatus, getMonitorLogs, getRegisteredProviders, JOB_TYPES };
