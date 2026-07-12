/**
 * Smart Labo Works — Smart AI Router: ルーティングテーブル（Sprint3 Task1 ④Router判定）
 *
 * 仕事の種類（jobType）ごとに「どのProviderの、どのメソッドを呼ぶか」を定義する。
 * ユーザーはAIを選択しない。ここでの対応関係だけがAI選択を決める。
 *
 * 今回は固定（ハードコード）。CEO指示どおり、将来は設定画面から変更可能にする
 * 想定のため、ロジックに埋め込まず単純な設定オブジェクトとしてここに集約している。
 */

const JOB_TYPES = {
  companyBrain:      'companyBrain',      // Company Brain
  salesEmail:        'salesEmail',        // 営業メール
  assessmentComment: 'assessmentComment', // 査定コメント
  contract:          'contract',          // 契約書
  longTextSummary:   'longTextSummary',   // 長文整理
  proposal:          'proposal',          // 提案書
  pdfAnalysis:        'pdfAnalysis',        // PDF解析
  imageAnalysis:      'imageAnalysis',      // 画像解析
  drawing:            'drawing',            // 図面
};

// jobType → { provider, method }
const ROUTE_TABLE = {
  [JOB_TYPES.companyBrain]:      { provider: 'openai', method: 'chat' },
  [JOB_TYPES.salesEmail]:        { provider: 'openai', method: 'chat' },
  [JOB_TYPES.assessmentComment]: { provider: 'openai', method: 'chat' },
  [JOB_TYPES.contract]:          { provider: 'claude', method: 'chat' },
  [JOB_TYPES.longTextSummary]:   { provider: 'claude', method: 'summarize' },
  [JOB_TYPES.proposal]:          { provider: 'claude', method: 'generate' },
  [JOB_TYPES.pdfAnalysis]:        { provider: 'gemini', method: 'analyze' },
  [JOB_TYPES.imageAnalysis]:      { provider: 'gemini', method: 'analyze' },
  [JOB_TYPES.drawing]:            { provider: 'gemini', method: 'analyze' },
};

// jobTypeが未指定・未知の場合のフォールバック
const DEFAULT_ROUTE = { provider: 'openai', method: 'chat' };

module.exports = { JOB_TYPES, ROUTE_TABLE, DEFAULT_ROUTE };
