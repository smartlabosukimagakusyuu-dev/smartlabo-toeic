/**
 * Smart Labo Works — AI Router 型定義
 * TypeScript移行時はこのファイルを aiTypes.ts に置き換える。
 * 全Providerは ProviderResult を、Routerは RouterResult を返す。
 */

/**
 * @typedef {'openai' | 'claude' | 'gemini' | 'whisper' | 'ocr'} ProviderName
 * 追加方法: ここに新しいプロバイダー名を追加 → providers/ に実装 → ROUTE_TABLE に登録
 */

/**
 * @typedef {Object} AIRequestOptions
 * @property {string}  [systemPrompt]  - システムプロンプト（上書き用）
 * @property {string}  [model]         - 使用モデル（省略時はプロバイダーデフォルト）
 * @property {number}  [maxTokens]     - 最大トークン数
 * @property {number}  [temperature]   - 温度（0.0〜1.0）
 */

/**
 * @typedef {Object} ProviderResult
 * 全Providerが返す共通フォーマット。Routerはこれを RouterResult にラップする。
 * @property {string} content  - AIの応答テキスト
 * @property {string} model    - 実際に使用したモデルID
 * @property {Object} usage    - トークン使用量 { prompt_tokens, completion_tokens, total_tokens }
 */

/**
 * @typedef {Object} RouterResult
 * router.route() が返す最終レスポンス。呼び出し元（server.js・サービス層）はこれを使う。
 * @property {string|null} content      - AIの応答テキスト（失敗時はnull）
 * @property {ProviderName} provider    - 実際に使用したプロバイダー
 * @property {string}       model       - 実際に使用したモデルID
 * @property {Object|null}  usage       - トークン使用量
 * @property {number}       processingMs - 処理時間（ミリ秒）
 * @property {boolean}      success     - 成功フラグ
 * @property {string}       [error]     - エラーメッセージ（失敗時のみ）
 */

/**
 * @typedef {Object} IProvider
 * 全Providerが実装すべきインターフェース。
 * 新Provider追加時はこの形に合わせること。
 * @property {function(string, string, AIRequestOptions): Promise<ProviderResult>} chat
 * @property {function(): Promise<{ok: boolean, model: string, message: string}>} testConnection
 */

module.exports = {}; // 型定義のみ。実行時コードなし。
