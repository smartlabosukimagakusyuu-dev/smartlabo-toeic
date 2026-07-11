/**
 * Smart Labo Works — Company Brain Service
 * Company BrainのAI質問応答を担当する。
 * 将来: Embedding + Vector検索（RAG）対応予定
 */

const router  = require('./router');
const prompts = require('./promptManager');

/**
 * Company Brainへの質問に回答する
 * @param {string} question    - ユーザーの質問
 * @param {Array}  brainData   - Company Brainエントリー配列（localStorageから渡す）
 * @returns {Promise<{answer: string, relatedEntries: Array, provider: string, processingMs: number}>}
 */
async function query(question, brainData = []) {
  // ナレッジコンテキストを構築
  const knowledgeContext = buildKnowledgeContext(question, brainData);

  // プロンプト生成
  const userMessage = prompts.companyBrain.query(question, knowledgeContext);

  // AI Router 経由で回答生成
  const result = await router.route('companyBrain', userMessage);

  if (!result.success) {
    return {
      answer:           `AI接続エラー: ${result.error}`,
      evidence:         '',
      nextActions:      [],
      relatedMaterials: [],
      canCreate:        [],
      relatedEntries:   [],
      provider:         result.provider,
      processingMs:     result.processingMs,
      success:          false,
    };
  }

  // OpenAIのJSON応答をパース
  let structured = { answer: result.content, evidence: '', nextActions: [], relatedMaterials: [], canCreate: [] };
  try {
    const cleaned = result.content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    structured = JSON.parse(cleaned);
  } catch (e) {
    structured.answer = result.content;
  }

  // 関連エントリーを検索
  const relatedEntries = searchRelated(question, brainData);

  return {
    answer:           structured.answer           || result.content,
    evidence:         structured.evidence          || '',
    nextActions:      structured.nextActions       || [],
    relatedMaterials: structured.relatedMaterials  || [],
    canCreate:        structured.canCreate         || [],
    relatedEntries,
    provider:         result.provider,
    model:            result.model,
    usage:            result.usage,
    processingMs:     result.processingMs,
    success:          true,
  };
}

/**
 * 質問に関連するナレッジをテキスト形式に変換
 * 将来: Embeddingによるベクター検索に置き換える
 */
const IMPORTANCE_SCORE = { '最重要': 3, '重要': 2, '普通': 1 };

function buildKnowledgeContext(question, brainData) {
  if (!brainData || brainData.length === 0) return '';

  const ql = question.toLowerCase();
  const keywords = ql.split(/\s+/).filter(Boolean);

  // キーワードスコアリング + 重要度ボーナス
  const scored = brainData.map(entry => {
    let score = 0;
    const titleL = (entry.title || '').toLowerCase();
    const bodyL  = (entry.body  || '').toLowerCase();
    const catL   = (entry.cat   || '').toLowerCase();
    const tags   = (entry.tags  || []).map(t => t.toLowerCase());
    keywords.forEach(kw => {
      if (titleL.includes(kw)) score += 3;
      if (bodyL.includes(kw))  score += 2;
      if (tags.some(t => t.includes(kw))) score += 1;
      if (catL.includes(kw))   score += 1;
    });
    score += IMPORTANCE_SCORE[entry.importance] || 1;
    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const entries = scored.slice(0, 5).filter(s => s.score > 1).map(s => s.entry);
  const finalEntries = entries.length > 0 ? entries : brainData.slice(0, 3);

  return finalEntries.map(e => {
    const imp = e.importance ? ` [${e.importance}]` : '';
    return `【${e.cat || 'ナレッジ'}${imp}】${e.title}\n${e.body || ''}`;
  }).join('\n\n');
}

/**
 * 関連エントリーを返す（UI表示用）
 */
function searchRelated(question, brainData) {
  const ql = question.toLowerCase();
  return brainData
    .filter(e =>
      e.title?.toLowerCase().includes(ql) ||
      e.body?.toLowerCase().includes(ql)
    )
    .slice(0, 3);
}

module.exports = { query };
