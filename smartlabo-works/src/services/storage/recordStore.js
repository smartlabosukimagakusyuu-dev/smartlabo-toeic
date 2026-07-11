/**
 * Smart Labo Works — Record Store（Task7）
 *
 * company_id + JSONの1レコード保存パターンを、テーブル名だけ変えて使い回すための
 * 汎用CRUDヘルパー。CRM・案件・契約で共通利用する（対象データが増えてもこのまま使える）。
 *
 * 呼び出し元（server.js）は必ずCompanyIDを渡すこと。Router/Provider同様、
 * このストアを経由せずにdb.jsを直接触らないこと。
 */

const crypto = require('crypto');
const db = require('./db');

/**
 * @param {string} tableName - crm | deals | contracts のいずれか（db.jsで定義済みのテーブル）
 */
function createStore(tableName) {
  const stmts = {
    selectAll: db.prepare(`SELECT data FROM ${tableName} WHERE company_id = ? ORDER BY created_at ASC`),
    selectOne: db.prepare(`SELECT data FROM ${tableName} WHERE company_id = ? AND id = ?`),
    insert:    db.prepare(`INSERT INTO ${tableName} (id, company_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`),
    update:    db.prepare(`UPDATE ${tableName} SET data = ?, updated_at = ? WHERE company_id = ? AND id = ?`),
    remove:    db.prepare(`DELETE FROM ${tableName} WHERE company_id = ? AND id = ?`),
  };

  /**
   * 指定企業の全レコードを返す
   * @param {string} companyId
   * @returns {Array<Object>}
   */
  function list(companyId) {
    return stmts.selectAll.all(companyId).map(row => JSON.parse(row.data));
  }

  /**
   * 指定企業・IDの1件を返す（なければnull）
   * @param {string} companyId
   * @param {string} id
   * @returns {Object|null}
   */
  function get(companyId, id) {
    const row = stmts.selectOne.get(companyId, id);
    return row ? JSON.parse(row.data) : null;
  }

  /**
   * 新規レコードを作成する。record.idがあればそれを使い、なければ生成する
   * （既存フロントエンドが独自形式のID、例 'c'+Date.now() を発行するのに合わせている）
   * @param {string} companyId
   * @param {Object} record
   * @returns {Object} 保存されたレコード（idを含む）
   */
  function create(companyId, record) {
    const id = record.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const full = { ...record, id };
    stmts.insert.run(id, companyId, JSON.stringify(full), now, now);
    return full;
  }

  /**
   * 既存レコードを置き換える。存在しなければnullを返す
   * @param {string} companyId
   * @param {string} id
   * @param {Object} record
   * @returns {Object|null}
   */
  function replace(companyId, id, record) {
    const existing = get(companyId, id);
    if (!existing) return null;
    const full = { ...record, id };
    stmts.update.run(JSON.stringify(full), new Date().toISOString(), companyId, id);
    return full;
  }

  /**
   * レコードを削除する
   * @param {string} companyId
   * @param {string} id
   * @returns {boolean} 削除できたか
   */
  function remove(companyId, id) {
    const result = stmts.remove.run(companyId, id);
    return result.changes > 0;
  }

  return { list, get, create, replace, remove };
}

module.exports = { createStore };
