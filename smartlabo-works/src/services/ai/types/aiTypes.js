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
 * @typedef {Object} ModelInfo
 * @property {string} id    - モデルID
 * @property {string} name  - 表示名
 * @property {string} desc  - 簡単な説明
 */

/**
 * @typedef {Object} IProvider
 * 全Providerが実装すべきインターフェース（Task4で正式化）。
 * 新Provider追加時はこの4関数をこの形に合わせて実装すること。
 * Routerはこのインターフェースのみを介してProviderを呼び出し、
 * Provider固有の設定・APIキー名などを一切知らない（Router→Provider→AIの一方向）。
 * @property {function(string, string, AIRequestOptions): Promise<ProviderResult>} chat
 *   - システムプロンプト・ユーザーメッセージ・オプションを受け取り、AI応答を返す。
 *     利用不可（APIキー未設定・未実装等）の場合はthrowする
 * @property {function(): Promise<{ok: boolean, model: string, message: string}>} testConnection
 *   - 疎通確認。例外を投げず、必ず{ok, model, message}を返すこと
 * @property {function(): ModelInfo[]} getAvailableModels
 *   - 選択可能なモデル一覧（未実装Providerは空配列を返す）
 * @property {function(): boolean} isAvailable
 *   - このProviderが現在呼び出し可能か（APIキー設定済み・実装済み等）。
 *     Router側は個別のconfig項目を直接参照せず、必ずこの関数経由で判定する
 */

module.exports = {}; // 型定義のみ。実行時コードなし。
