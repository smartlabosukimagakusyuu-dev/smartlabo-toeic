/**
 * Smart Labo Works — Smart AI Router: Router Monitor（Sprint3 Task1 ⑤）
 *
 * 内部ログのみ。画面は今回実装しない（CEO指示）。
 * インメモリ配列で保持する（server.jsのAIログ〈Task6でcompanyId分離済み〉と同様、将来DB化）。
 * 記録内容：質問・分類結果・使用AI・処理時間・成功/失敗。
 */

const logs = [];
const MAX_LOGS = 200;

/**
 * @param {Object} entry
 * @param {string} entry.question    - 入力（質問・依頼文の要約でよい）
 * @param {string} entry.jobType     - 分類結果
 * @param {string} entry.provider    - 使用したAI Provider名
 * @param {number} entry.processingMs
 * @param {boolean} entry.success
 * @param {string} [entry.error]
 */
function log(entry) {
  logs.unshift({
    id:       Date.now(),
    datetime: new Date().toISOString(),
    ...entry,
  });
  if (logs.length > MAX_LOGS) logs.pop();
}

/**
 * @returns {Array<Object>}
 */
function getLogs() {
  return logs;
}

module.exports = { log, getLogs };
