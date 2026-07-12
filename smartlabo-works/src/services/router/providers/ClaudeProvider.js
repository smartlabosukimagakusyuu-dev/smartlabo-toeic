/**
 * Smart Labo Works — Smart AI Router: ClaudeProvider（Sprint3 Task2「Claude API正式実装」）
 *
 * AIProvider（../interfaces/AIProvider.js）を実装する。
 * 実際のClaude呼び出しは既存の src/services/ai/providers/claudeProvider.js を再利用する
 * （API呼び出しロジックの重複はさせない）。
 *
 * Task1では summarize/generate/analyze が汎用プロンプトへの単純な委譲だったが、
 * Task2でrouteTable.jsの実際の割り当て（契約書=chat、長文整理=summarize、提案書=generate）
 * に合わせて、Claudeの強み（長文の丁寧な読解・構造化された文書作成）を活かすプロンプトへ
 * 差し替えた。chat()自体は呼び出し元がsystemPromptを渡す設計のままなので変更していない
 * （契約書用の具体的なプロンプトは、契約書レビュー機能を実装するタスクで呼び出し元が用意する）。
 *
 * 【重要】この環境には ANTHROPIC_API_KEY が設定されていないため、実際にAPIが
 * 成功応答することは確認できていない（isAvailable()がfalseになることは確認済み）。
 * エラーハンドリングが正しく機能することはSprint3 Task1で確認済み。
 */

const legacyProvider = require('../../ai/providers/claudeProvider');

async function chat(input, options = {}) {
  return legacyProvider.chat(input.systemPrompt, input.message, options);
}

/**
 * 長文整理（routeTable.js: longTextSummary → claude/summarize）
 * 単なる短縮ではなく、元の意図・数字・固有名詞を保ったまま構造化する。
 */
async function summarize(text, options = {}) {
  return legacyProvider.chat(
    `あなたは株式会社スマートラボの文書整理アシスタントです。与えられた長文を、要点を保ったまま整理してください。

【ルール】
- 元の文章の意図・ニュアンスを損なわない
- 重要な数字・固有名詞・日付・金額は省略しない
- 決定事項やアクションがあれば、要約の冒頭に明示する
- 箇条書きや小見出しを使い、短時間で全体像を把握できる形にする`,
    text,
    options
  );
}

/**
 * 提案書作成（routeTable.js: proposal → claude/generate）
 */
async function generate(prompt, options = {}) {
  return legacyProvider.chat(
    `あなたは株式会社スマートラボの提案書作成アシスタントです。中小企業向けのAI・DX支援に関する提案書を作成してください。

【ルール】
- 「課題 → 解決策 → 期待効果」の順で論理的に構成する
- 誇張表現や実現できない約束はしない
- 専門用語は最小限にし、経営者にも分かりやすい言葉を使う
- 箇条書きと短い段落を組み合わせ、読みやすさを優先する
- 株式会社スマートラボとしての提案として作成する`,
    prompt,
    options
  );
}

/**
 * PDF・契約書等の解析。Sprint3 Task2時点でもテキスト入力の解析のみ対応
 * （画像・PDFバイナリの解析は別タスクで実装する。routeTable.js上は
 * pdfAnalysis/imageAnalysis/drawingはGeminiへ割り当て済みのため、
 * このメソッドは主にAIProviderインターフェースの完全性のために存在する）。
 */
async function analyze(text, options = {}) {
  return legacyProvider.chat(
    `あなたは株式会社スマートラボの文書分析アシスタントです。与えられた内容を分析し、重要なポイント・リスク・確認すべき事項を整理して提示してください。
断定的な法的判断は行わず、「確認を推奨する点」として提示してください。`,
    text,
    options
  );
}

async function testConnection() {
  return legacyProvider.testConnection();
}

function isAvailable() {
  return legacyProvider.isAvailable();
}

module.exports = { chat, summarize, generate, analyze, testConnection, isAvailable };
