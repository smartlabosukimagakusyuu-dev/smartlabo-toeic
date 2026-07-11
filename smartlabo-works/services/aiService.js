/**
 * Smart Labo Works — AI Service Layer
 * Version: 1.0.0 (自社運用版 / 半自動モード)
 *
 * 現時点ではAPIを呼ばず、テンプレート生成・固定レスポンスで動作します。
 * 各関数には将来のAPI接続ポイントをコメントで明記しています。
 *
 * 将来API化する場合:
 *   1. 以下の AI_CONFIG を設定
 *   2. 各関数内の「API接続ポイント」コメント箇所を実装
 *   3. UI側の呼び出しコードは変更不要（インターフェースを維持）
 */

// ============================================================
//  CONFIG — 将来API化時にここを設定する
// ============================================================
const AI_CONFIG = {
  mode: 'manual',          // 'manual' | 'openai' | 'claude' | 'gemini'
  // apiKey: '',           // 将来: process.env.OPENAI_API_KEY 等
  // model: 'gpt-4o',      // 将来: 使用するモデル名
  // endpoint: '',         // 将来: APIエンドポイント
};

// ============================================================
//  1. generateSummary
//  会話・議事録・商談メモを要約する
// ============================================================
/**
 * @param {string} text - 入力テキスト（会話・議事録等）
 * @param {string} type - 'meeting' | 'sales' | 'chatgpt' | 'voice'
 * @returns {Object} { summary3lines, minutes, decisions, todos, nextActions, brainCandidates, claudeCandidates, chatgptPrompt }
 */
function generateSummary(text, type = 'meeting') {
  // ============================================================
  // 将来ここでOpenAI API / Claude API等へ接続
  // 例: const response = await openai.chat.completions.create({
  //   model: AI_CONFIG.model,
  //   messages: [{ role: 'user', content: buildSummaryPrompt(text, type) }]
  // });
  // ============================================================

  if (AI_CONFIG.mode !== 'manual') {
    throw new Error('API mode not implemented yet. Set AI_CONFIG.mode to "manual".');
  }

  const lines = text.split('\n').filter(l => l.trim());
  const wordCount = text.length;
  const shortText = text.substring(0, 120).replace(/\n/g, ' ');

  // テンプレートベース生成
  const typeLabel = { meeting: '会議', sales: '商談', chatgpt: 'ChatGPT会話', voice: '音声メモ' }[type] || '会話';

  return {
    summary3lines: [
      `${typeLabel}にて、以下の内容について議論・決定が行われました。`,
      shortText + (wordCount > 120 ? '…' : ''),
      `上記内容をもとに、TODO・次回アクションを整理しました。`
    ].join('\n'),
    minutes: `【${typeLabel}詳細議事録】\n\n${text}\n\n（上記は入力内容をそのまま記録したものです。ChatGPTによる整形版は下の「ChatGPT用プロンプト」をご利用ください）`,
    decisions: extractDecisions(text),
    todos: extractTodos(text),
    nextActions: generateNextActions(text, type),
    brainCandidates: suggestBrainCategories(text),
    claudeCandidates: suggestClaudeTasks(text),
    chatgptPrompt: buildChatGPTSummaryPrompt(text, type),
  };
}

// ============================================================
//  2. generateWorkOrder
//  会話・打ち合わせ内容からWork Orderを生成する
// ============================================================
/**
 * @param {string} text - 入力テキスト
 * @param {string} source - 入力ソース種別
 * @returns {Object} Work Orderオブジェクト
 */
function generateWorkOrder(text, source = 'ChatGPT会話') {
  // ============================================================
  // 将来ここでClaude API等へ接続
  // 例: const response = await anthropic.messages.create({
  //   model: 'claude-opus-4-8',
  //   messages: [{ role: 'user', content: buildWorkOrderPrompt(text) }]
  // });
  // ============================================================

  if (AI_CONFIG.mode !== 'manual') {
    throw new Error('API mode not implemented yet.');
  }

  const title = extractTitle(text);
  const priority = detectPriority(text);
  const todos = extractTodos(text);
  const decisions = extractDecisions(text);
  const pbUpdate = /Project Bible|仕様|設計|ルール/.test(text);
  const brandUpdate = /Brand|ブランド|デザイン|色|コピー|ロゴ/.test(text);
  const designUpdate = /Design|UI|ボタン|レイアウト|画面|フォント/.test(text);
  const versionChange = /新機能|追加|実装/.test(text) ? 'minor (+0.1)' : 'patch (+0.0.1)';
  const relatedFiles = buildRelatedFiles(text);

  return {
    id: 'wo_' + Date.now(),
    title,
    summary: text.substring(0, 150).replace(/\n/g, ' ') + (text.length > 150 ? '...' : ''),
    source,
    date: new Date().toLocaleDateString('ja-JP'),
    status: '承認待ち',
    input: text,
    priority,
    priorityColor: priority === '高' ? '#EF4444' : priority === '中' ? '#F59E0B' : '#64748B',
    todos,
    decisions,
    pbUpdate,
    brandUpdate,
    designUpdate,
    versionChange,
    relatedFiles,
    claudePrompt: generateClaudePrompt(title, text, { todos, versionChange, brandUpdate, designUpdate }),
    tags: [source, priority + '優先度'],
  };
}

// ============================================================
//  3. generateCompanyBrainAnswer
//  Company BrainのナレッジベースからAI回答を生成する
// ============================================================
/**
 * @param {string} query - 検索クエリ
 * @param {Array}  brainData - Company Brainエントリー配列
 * @returns {Object} { answer, relatedEntries, nextActions }
 */
function generateCompanyBrainAnswer(query, brainData = []) {
  // ============================================================
  // 将来ここでEmbedding + Vector検索 + LLM APIへ接続
  // 例: const embeddings = await openai.embeddings.create({ input: query, model: 'text-embedding-3-small' });
  //     const similar = vectorSearch(embeddings, brainVectors);
  //     const answer = await generateAnswer(query, similar);
  // ============================================================

  if (AI_CONFIG.mode !== 'manual') {
    throw new Error('API mode not implemented yet.');
  }

  const ql = query.toLowerCase();
  const matched = brainData.filter(b =>
    b.title.toLowerCase().includes(ql) ||
    b.body.toLowerCase().includes(ql) ||
    (b.tags || []).some(t => t.toLowerCase().includes(ql))
  );

  if (matched.length === 0) {
    return {
      answer: `「${query}」に一致するナレッジが見つかりませんでした。Company Brainに情報を追加してください。`,
      relatedEntries: [],
      nextActions: ['Company Brainに関連情報を追加する'],
    };
  }

  const top = matched[0];
  return {
    answer: `【${top.cat}】${top.title}\n\n${top.body}`,
    relatedEntries: matched.slice(0, 3),
    nextActions: [`「${top.title}」の内容を確認・更新する`],
  };
}

// ============================================================
//  4. generateClaudePrompt
//  Claude Code用の作業指示プロンプトを生成する
// ============================================================
/**
 * @param {string} taskTitle - タスクタイトル
 * @param {string} context   - 背景・詳細テキスト
 * @param {Object} options   - { todos, versionChange, brandUpdate, designUpdate }
 * @returns {string} プロンプト文字列
 */
function generateClaudePrompt(taskTitle, context, options = {}) {
  // ============================================================
  // 将来ここでLLMによるプロンプト最適化を実施
  // 例: context -> LLM -> より精緻な作業指示プロンプトへ変換
  // ============================================================

  const { todos = [], versionChange = 'patch', brandUpdate = false, designUpdate = false } = options;
  const short = context.substring(0, 200).replace(/\n/g, ' ');

  return `PROJECT_BIBLE / CURRENT_STATUS 最新版を確認してください。

=========================================================
タスク: ${taskTitle}
=========================================================

【背景・目的】
${short}${context.length > 200 ? '...' : ''}

【実装要件】
${todos.filter((_, i) => i > 0 && i < todos.length - 3).map(t => '- ' + t).join('\n') || '- 上記目的を実装してください'}

【制約・ルール】
- Brand Bible 遵守（#0A1B3D / #2563EB / #60A5FA / #00D4FF）
- Design Bible 遵守（余白重視・Enterprise SaaS品質）${brandUpdate ? '\n- Brand Bible の更新も検討してください' : ''}${designUpdate ? '\n- Design Bible の更新も検討してください' : ''}
- 「社長の時間を増やせるか」を必ず確認してからYESの場合のみ実装
- 独自判断でブランド・デザイン・仕様を変更しない

【Version更新】
${versionChange}

【完了後の作業】
- CURRENT_STATUS.md を更新
- CHANGELOG.md にエントリーを追加（feat: ${taskTitle}）
- GitHub にコミット・プッシュ`;
}

// ============================================================
//  5. generateMeetingMinutes
//  会議・商談・電話内容から議事録を生成する
// ============================================================
/**
 * @param {string} text - 入力テキスト
 * @param {Object} meta - { title, date, attendees, type }
 * @returns {Object} 議事録オブジェクト
 */
function generateMeetingMinutes(text, meta = {}) {
  // ============================================================
  // 将来ここでWhisper(音声→テキスト) + LLM APIへ接続
  // 例: const transcript = await openai.audio.transcriptions.create({ file, model: 'whisper-1' });
  //     const minutes = await summarizeWithLLM(transcript);
  // ============================================================

  if (AI_CONFIG.mode !== 'manual') {
    throw new Error('API mode not implemented yet.');
  }

  const { title = '打ち合わせ', date = new Date().toLocaleDateString('ja-JP'), attendees = '小川 昌利', type = 'meeting' } = meta;

  return {
    title,
    date,
    attendees,
    type,
    summary3lines: [
      `${date}の${title}にて議論が行われました。`,
      text.substring(0, 100).replace(/\n/g, ' ') + (text.length > 100 ? '...' : ''),
      `決定事項・TODOは下記の通りです。`
    ].join('\n'),
    decisions: extractDecisions(text),
    todos: extractTodos(text),
    nextActions: generateNextActions(text, type),
    brainCandidates: suggestBrainCategories(text),
    claudeTaskCandidates: suggestClaudeTasks(text),
    chatgptPrompt: buildChatGPTSummaryPrompt(text, type),
    rawText: text,
  };
}

// ============================================================
//  6. generateSalesReply
//  問い合わせ・営業メール・提案書の文章を生成する
// ============================================================
/**
 * @param {Object} context - { type, to, subject, body, tone }
 * @param {string} templateType - 'inquiry_reply' | 'sales_email' | 'proposal' | 'followup' | 'subsidy'
 * @returns {string} 生成されたテキスト
 */
function generateSalesReply(context = {}, templateType = 'inquiry_reply') {
  // ============================================================
  // 将来ここでOpenAI / Claude API等へ接続
  // 例: const text = await callLLM(buildSalesPrompt(context, templateType));
  // ============================================================

  if (AI_CONFIG.mode !== 'manual') {
    throw new Error('API mode not implemented yet.');
  }

  const { to = '○○様', subject = '', body = '' } = context;
  const templates = getSalesTemplates();
  const tpl = templates[templateType] || templates['inquiry_reply'];

  return tpl
    .replace(/\{\{to\}\}/g, to)
    .replace(/\{\{subject\}\}/g, subject)
    .replace(/\{\{body\}\}/g, body)
    .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('ja-JP'));
}

// ============================================================
//  INTERNAL HELPERS（将来LLMに置き換える処理群）
// ============================================================

function extractTitle(text) {
  const keywords = ['ホームページ','CTA','ボタン','DX','AI','Company Brain','Work Order','料金','デザイン','機能','修正','追加','改善','開発','実装','システム','自動化'];
  const actions = text.includes('追加') ? '追加' : text.includes('修正') ? '修正' : text.includes('改善') ? '改善' : text.includes('実装') ? '実装' : '更新';
  const found = keywords.find(k => text.includes(k));
  return found ? `${found}の${actions}` : '開発タスク';
}

function detectPriority(text) {
  if (/急ぎ|緊急|最優先|今すぐ|ASAP/.test(text)) return '高';
  if (/後で|余裕|いつか|後回し/.test(text)) return '低';
  return '中';
}

function extractDecisions(text) {
  const decisions = [];
  const decisionPatterns = [/決定[：:：](.+)/g, /することに(した|なった)(.+)/g, /とする[。\n]/g];
  decisions.push('・入力内容の内容を実施することを決定');
  if (/Brand|Design/.test(text)) decisions.push('・Brand Bible / Design Bibleに従って実装する');
  if (/Version|バージョン/.test(text)) decisions.push('・バージョン更新を実施する');
  return decisions.join('\n');
}

function extractTodos(text) {
  const todos = ['PROJECT_BIBLE / CURRENT_STATUS 最新版を確認'];
  if (/Brand|ブランド/.test(text)) todos.push('Brand Bible 遵守を確認');
  if (/Design|UI|デザイン/.test(text)) todos.push('Design Bible 遵守を確認');
  todos.push('実装・変更作業を実行');
  todos.push('ブラウザでの動作確認');
  todos.push('CURRENT_STATUS.md を更新');
  if (/新機能|追加|実装/.test(text)) todos.push('CHANGELOG.md にエントリー追加');
  todos.push('GitHub にコミット・プッシュ');
  return todos;
}

function generateNextActions(text, type) {
  const actions = [];
  if (type === 'sales') {
    actions.push('商談フォローアップメールを送付');
    actions.push('案件管理に登録・ステータス更新');
    if (/提案|見積/.test(text)) actions.push('提案書・見積書を作成');
  } else {
    actions.push('決定事項をCompany Brainに登録');
    actions.push('TODOをWork Orderとして作成');
    if (/ホームページ|HP/.test(text)) actions.push('ホームページ更新タスクを作成');
  }
  return actions;
}

function suggestBrainCategories(text) {
  const map = {
    'AI利用ルール': /AI|GPT|Claude|自動/,
    '料金プラン': /料金|費用|価格|見積/,
    '営業資料': /営業|提案|商談|クライアント/,
    'Git運用ルール': /Git|GitHub|コミット|push/,
    'Project Bible': /仕様|設計|アーキテクチャ/,
    '補助金資料': /補助金|助成金|IT導入/,
    'FAQ': /よくある|質問|Q&A/,
    '議事録': /会議|打ち合わせ|MTG/,
  };
  return Object.entries(map).filter(([, re]) => re.test(text)).map(([cat]) => cat);
}

function suggestClaudeTasks(text) {
  const tasks = [];
  if (/ホームページ|HP|サイト/.test(text)) tasks.push('ホームページの修正・更新');
  if (/機能|実装|開発/.test(text)) tasks.push('新機能の実装');
  if (/デザイン|UI|画面/.test(text)) tasks.push('UIデザインの改善');
  if (/Project Bible|設計|仕様/.test(text)) tasks.push('PROJECT_BIBLEの更新');
  return tasks;
}

function buildChatGPTSummaryPrompt(text, type) {
  const typeInstruction = {
    meeting: '以下の会議内容を整理してください。',
    sales: '以下の商談内容を整理してください。',
    chatgpt: '以下の会話内容を整理してください。',
    voice: '以下の音声メモを整理してください。',
  }[type] || '以下の内容を整理してください。';

  return `${typeInstruction}

【出力形式】
## 3行要約
（3行以内で要約）

## 決定事項
（箇条書きで）

## TODO
（担当者・期限付きで箇条書き）

## 次回アクション
（いつ・誰が・何をするか）

## Company Brain登録候補
（ナレッジ化すべき内容があれば）

---
【入力内容】
${text}`;
}

function buildRelatedFiles(text) {
  const files = ['smartlabo-works/app.html', 'PROJECT_BIBLE/CURRENT_STATUS.md'];
  if (/ホームページ|Homepage|index/.test(text)) files.push('WEBSITE/index.html');
  if (/Project Bible/.test(text)) files.push('PROJECT_BIBLE/README.md');
  if (/Brand/.test(text)) files.push('PROJECT_BIBLE/00_Foundation/07_Brand_Identity.md');
  if (/Design/.test(text)) files.push('PROJECT_BIBLE/20_UI_UX_Rules.md');
  return files;
}

// ============================================================
//  SALES TEMPLATES
// ============================================================
function getSalesTemplates() {
  return {
    inquiry_reply: `{{to}}

お問い合わせいただきありがとうございます。
株式会社スマートラボの小川でございます。

このたびは弊社サービスにご興味をお持ちいただき、誠にありがとうございます。

ご質問の件につきまして、以下の通りご回答いたします。

{{body}}

ご不明な点がございましたら、お気軽にご連絡ください。
デモのご要望も随時承っております。

今後ともよろしくお願いいたします。

━━━━━━━━━━━━━━━━━━━━
株式会社スマートラボ
代表取締役 小川 昌利
━━━━━━━━━━━━━━━━━━━━`,

    sales_email: `{{to}}

お世話になっております。
株式会社スマートラボの小川でございます。

突然のご連絡、失礼いたします。

弊社では、中小企業向けのAI・DX支援サービス「Smart Labo Works」を提供しております。

■ 主なサービス内容
・AI導入・活用コンサルティング
・業務自動化・DX推進支援
・社内業務管理システムの構築

貴社の課題解決に貢献できると考え、ご連絡させていただきました。
一度、15〜30分のオンラインでのご説明の機会をいただけますでしょうか。

ご検討のほど、よろしくお願いいたします。

株式会社スマートラボ 小川 昌利`,

    proposal: `【提案書】AI・DX推進コンサルティングのご提案

{{to}}

この度は貴重なお時間をいただき、誠にありがとうございます。
株式会社スマートラボより、貴社のAI・DX推進に関するご提案をさせていただきます。

■ 現状の課題認識
{{body}}

■ 弊社のご提案
・フェーズ1: 現状分析・課題整理（1ヶ月）
・フェーズ2: ツール選定・導入設計（1ヶ月）
・フェーズ3: 導入・運用支援（継続）

■ 期待される効果
・業務時間の削減（目標: 20〜40%）
・情報共有の効率化
・意思決定スピードの向上

ご不明点・ご要望がございましたら、お気軽にお申し付けください。`,

    followup: `{{to}}

先日はお時間をいただき、誠にありがとうございました。
株式会社スマートラボの小川でございます。

ご提案させていただいた内容につきまして、ご検討の状況はいかがでしょうか。

何かご不明な点やご質問がございましたら、いつでもご連絡ください。
追加資料のご要望にも対応いたします。

引き続きよろしくお願いいたします。

株式会社スマートラボ 小川 昌利`,

    subsidy: `【補助金活用のご提案】IT導入補助金を使ったDX推進

{{to}}

お世話になっております。株式会社スマートラボの小川です。

貴社のIT・DX推進に関して、補助金を活用した導入支援のご提案がございます。

■ 活用可能な補助金
・IT導入補助金（補助率1/2〜3/4、上限450万円）
・ものづくり補助金（補助率1/2、上限1,250万円）

■ 弊社サービスとの組み合わせ
弊社のAI・DX支援サービスはIT導入補助金の対象になるケースが多く、
実質的な導入コストを大幅に削減できます。

まずは無料相談にてご状況をお聞かせください。

株式会社スマートラボ 小川 昌利`,

    claude_instruction: `PROJECT_BIBLE / CURRENT_STATUS 最新版を確認してください。

=========================================================
タスク: [タスク名をここに記入]
=========================================================

【目的】
[何を実現したいかを記入]

【実装要件】
- [要件1]
- [要件2]

【制約・ルール】
- Brand Bible 遵守（#0A1B3D / #2563EB / #60A5FA / #00D4FF）
- Design Bible 遵守（余白重視・Enterprise SaaS品質）
- 「社長の時間を増やせるか」を必ず確認

【完了後の作業】
- CURRENT_STATUS.md を更新
- CHANGELOG.md にエントリーを追加
- GitHub にコミット・プッシュ`,
  };
}

// ============================================================
//  PUBLIC API — UI側はこのオブジェクトを使う
// ============================================================
const AIService = {
  mode: AI_CONFIG.mode,
  generateSummary,
  generateWorkOrder,
  generateCompanyBrainAnswer,
  generateClaudePrompt,
  generateMeetingMinutes,
  generateSalesReply,
  getSalesTemplates,
  // 将来追加予定
  // transcribeAudio: async (audioBlob) => { /* Whisper API */ },
  // searchBrainVector: async (query, vectors) => { /* Embedding + Vector DB */ },
  // classifyPriority: async (text) => { /* LLM分類 */ },
};
