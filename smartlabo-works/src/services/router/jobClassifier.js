/**
 * Smart Labo Works — Smart AI Router: 仕事分類（Sprint3 Task1 ①入力解析・仕事分類）
 *
 * 呼び出し元が明示的にjobTypeを指定した場合はそれを最優先で使う（最も確実な分類）。
 * jobTypeが未指定の場合のみ、入力テキストを簡易キーワード判定で分類する
 * （今回は固定ルールで十分。CEO指示どおり、高度な分類は将来の課題とする）。
 */

const { JOB_TYPES } = require('./routeTable');

// テキスト中に含まれていたら該当jobTypeとみなすキーワード（判定は上から順、最初に一致したもの優先）
const KEYWORD_RULES = [
  { jobType: JOB_TYPES.contract,          keywords: ['契約書', '重要事項説明', '重説'] },
  { jobType: JOB_TYPES.assessmentComment, keywords: ['査定', '価格コメント'] },
  { jobType: JOB_TYPES.proposal,          keywords: ['提案書', '企画書'] },
  { jobType: JOB_TYPES.salesEmail,        keywords: ['営業メール', '返信メール', '問い合わせ返信'] },
  { jobType: JOB_TYPES.longTextSummary,   keywords: ['要約して', 'まとめて', '長文'] },
  { jobType: JOB_TYPES.pdfAnalysis,        keywords: ['PDF'] },
  { jobType: JOB_TYPES.imageAnalysis,      keywords: ['画像', '写真'] },
  { jobType: JOB_TYPES.drawing,            keywords: ['図面'] },
  { jobType: JOB_TYPES.companyBrain,      keywords: ['Company Brain', '社内ナレッジ', '社内規程'] },
];

/**
 * 仕事の種類を判定する。
 * @param {string} [explicitJobType] - 呼び出し元が既に分かっている場合のjobType（routeTable.JOB_TYPESのいずれか）
 * @param {string} [text] - explicitJobTypeが無い場合に判定に使う入力テキスト
 * @returns {string} jobType（未判定の場合は 'default'）
 */
function classify(explicitJobType, text) {
  if (explicitJobType && Object.values(JOB_TYPES).includes(explicitJobType)) {
    return explicitJobType;
  }
  if (text) {
    for (const rule of KEYWORD_RULES) {
      if (rule.keywords.some(kw => text.includes(kw))) return rule.jobType;
    }
  }
  return 'default';
}

module.exports = { classify };
