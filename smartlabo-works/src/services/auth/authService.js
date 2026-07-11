/**
 * Smart Labo Works — Auth Service
 * 最小構成のサーバーサイド認証（Task3）。
 *
 * 将来 Workspace → Company → User → Role 構造へ拡張する前提のため、
 * セッションには companyId を必ず保持する（現時点は config.auth.companyId 固定の単一アカウントのみ）。
 */

const crypto = require('crypto');
const config = require('../../config/env');

// ==========================================
// セッションストア（インメモリ。将来DB化）
// ==========================================
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8時間
const sessions = new Map();

/**
 * セッションを発行する
 * @param {string} companyId
 * @param {string} email
 * @returns {string} セッショントークン
 */
function createSession(companyId, email) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { companyId, email, createdAt: Date.now() });
  return token;
}

/**
 * トークンからセッションを取得する（期限切れなら破棄してnullを返す）
 * @param {string} token
 * @returns {{companyId: string, email: string, createdAt: number} | null}
 */
function getSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }
  return session;
}

/**
 * セッションを破棄する
 * @param {string} token
 */
function destroySession(token) {
  if (token) sessions.delete(token);
}

// ==========================================
// パスワード検証
// ==========================================

/**
 * "salt:hash" 形式の文字列に対して平文パスワードを検証する（定数時間比較）
 * @param {string} password
 * @param {string} storedHash
 * @returns {boolean}
 */
function verifyPassword(password, storedHash) {
  const [salt, hash] = (storedHash || '').split(':');
  if (!salt || !hash || !password) return false;

  const candidate = crypto.scryptSync(password, salt, 64);
  const expected  = Buffer.from(hash, 'hex');
  if (candidate.length !== expected.length) return false;

  return crypto.timingSafeEqual(candidate, expected);
}

/**
 * CompanyID・Email・Passwordを検証する。
 * 現時点は config.auth の単一アカウントのみ対応
 * （将来: Company/Userテーブルを引いての検証に差し替える。呼び出し側のインターフェースは変えない想定）
 * @param {string} companyId
 * @param {string} email
 * @param {string} password
 * @returns {boolean}
 */
function verifyCredentials(companyId, email, password) {
  if (companyId !== config.auth.companyId) return false;
  if ((email || '').toLowerCase() !== config.auth.email.toLowerCase()) return false;
  return verifyPassword(password, config.auth.passwordHash);
}

module.exports = { createSession, getSession, destroySession, verifyCredentials };
