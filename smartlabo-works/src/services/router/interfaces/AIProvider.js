/**
 * Smart Labo Works — Smart AI Router: AIProvider Interface（Sprint3 Task1）
 *
 * OpenAI / Claude / Gemini（将来: Whisper / OCR / 画像生成AI / 検索AI）を
 * 同じ形で呼び出すための共通インターフェース。
 * routerService.js はこのインターフェースの4関数だけを呼び、
 * どのAI・どのAPI仕様かを一切知らない（Router→Provider→AIの一方向）。
 *
 * 既存の src/services/ai/providers/*（openaiProvider.js・claudeProvider.js）が
 * 持つ chat/testConnection/getAvailableModels/isAvailable のインターフェースとは別物。
 * 新Provider（本フォルダの OpenAIProvider 等）はこちらの4メソッドを実装し、
 * 内部で既存Providerを再利用してよい（実装の重複を避けるため。OpenAIProvider参照）。
 */

/**
 * @typedef {Object} ChatInput
 * @property {string} systemPrompt
 * @property {string} message
 */

/**
 * @typedef {Object} AIRequestOptions
 * @property {string} [model]
 * @property {number} [maxTokens]
 * @property {number} [temperature]
 */

/**
 * @typedef {Object} ProviderResult
 * @property {string} content  - AIの応答テキスト
 * @property {string} model    - 実際に使用したモデルID
 * @property {Object} [usage]  - トークン使用量（取得できる場合）
 */

/**
 * @typedef {Object} AIProvider
 * 全Providerが実装すべき共通インターフェース（4メソッド）。
 * @property {function(ChatInput, AIRequestOptions): Promise<ProviderResult>} chat
 *   - 対話形式の呼び出し（Company Brain・営業メール・契約書等、Task1で扱う全カテゴリの主用途）
 * @property {function(string, AIRequestOptions): Promise<ProviderResult>} summarize
 *   - 長文の要約（デフォルト実装はchatに要約用システムプロンプトを添えて委譲してよい）
 * @property {function(string, AIRequestOptions): Promise<ProviderResult>} generate
 *   - 文書生成（デフォルト実装はchatに生成用システムプロンプトを添えて委譲してよい）
 * @property {function(string, AIRequestOptions): Promise<ProviderResult>} analyze
 *   - PDF・画像・図面等の解析。Sprint3 Task1時点では実データ（画像バイナリ等）の解析は未実装で、
 *     テキストとして渡された内容の解析にのみ対応する（本格的な解析はOCR/画像解析タスクで別途実装）
 * @property {function(): Promise<{ok: boolean, model: string, message: string}>} testConnection
 *   - 疎通確認
 * @property {function(): boolean} isAvailable
 *   - 現在呼び出し可能か（APIキー設定済みか等）
 */

module.exports = {}; // 型定義のみ。実行時コードなし。
