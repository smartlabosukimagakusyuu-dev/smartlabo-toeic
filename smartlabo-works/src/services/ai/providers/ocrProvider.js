/**
 * Smart Labo Works — OCR Provider（構造スタブ）
 *
 * IProvider（types/aiTypes.js）のインターフェースのみを実装した構造上のプレースホルダー。
 * 実際の画像・PDFからのテキスト抽出はREFACTOR_PLAN.md Phase3（Task4の範囲外）で実装する。
 * ここでは「Routerが新Providerを書き換えなしで受け入れられること」を示すために登録する。
 *
 * 直接呼び出し禁止。必ず router/router.js 経由で使用すること。
 */

/**
 * @returns {Promise<import('../types/aiTypes').ProviderResult>}
 */
async function chat() {
  throw new Error('OCR Providerは未実装です（Phase3で実装予定）。');
}

/**
 * 接続テスト
 * @returns {Promise<{ok: boolean, model: string, message: string}>}
 */
async function testConnection() {
  return { ok: false, model: '', message: 'OCR Providerは未実装です（Phase3で実装予定）' };
}

/**
 * 利用可能なモデル一覧（未実装のため空）
 */
function getAvailableModels() {
  return [];
}

/**
 * このProviderが現在呼び出し可能か（Phase3実装まで常にfalse）
 * @returns {boolean}
 */
function isAvailable() {
  return false;
}

module.exports = { chat, testConnection, getAvailableModels, isAvailable };
