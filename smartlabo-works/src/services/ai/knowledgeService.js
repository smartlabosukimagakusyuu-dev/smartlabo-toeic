/**
 * Smart Labo Works — Knowledge Service
 * Company BrainのRAG（検索拡張生成）を担当する
 * Version 1.0: キーワード検索
 * 将来: Embedding + Vector DB（Pinecone / pgvector等）
 */

/**
 * ナレッジベースからキーワード検索
 * @param {string} query     - 検索クエリ
 * @param {Array}  knowledge - ナレッジエントリー配列
 * @param {number} topK      - 返す件数
 * @returns {Array} マッチしたエントリー
 */
function search(query, knowledge, topK = 5) {
  // 将来: Embedding → コサイン類似度検索に置き換える
  const ql = query.toLowerCase();
  const scored = knowledge.map(entry => {
    let score = 0;
    if (entry.title?.toLowerCase().includes(ql))  score += 3;
    if (entry.body?.toLowerCase().includes(ql))   score += 2;
    if ((entry.tags || []).some(t => t.toLowerCase().includes(ql))) score += 1;
    if (entry.cat?.toLowerCase().includes(ql))    score += 1;
    return { ...entry, _score: score };
  });

  return scored
    .filter(e => e._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, topK);
}

/**
 * ナレッジをテキストコンテキストに変換（プロンプトへの埋め込み用）
 * @param {Array} entries - ナレッジエントリー配列
 * @returns {string}
 */
function toContext(entries) {
  if (!entries || entries.length === 0) return '（登録ナレッジなし）';
  return entries
    .map(e => `---\nカテゴリ: ${e.cat || '未分類'}\nタイトル: ${e.title}\n内容: ${e.body || ''}`)
    .join('\n');
}

module.exports = { search, toContext };
