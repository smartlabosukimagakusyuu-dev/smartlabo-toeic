/**
 * テンプレート: 物件紹介メール（不動産売買向け・営業テンプレート第一弾）
 * id・namespaceは templates/index.js（Template Loader）がファイルパスから自動付与する。
 *
 * 「営業テンプレート」ファミリーの第一弾。今後 followup.js（フォロー）・visit.js（内覧案内）・
 * thanks.js（お礼）・contract.js（契約案内）等を、同じ形の定義ファイルを1つ追加するだけで
 * 拡張できることを前提に設計している（このファイル自身にはその拡張ロジックは書かない）。
 *
 * realestate/listing.js（物件紹介文）には依存しない。「物件紹介文」フィールドは
 * listing.jsの出力を貼り付けても、手入力でも、空欄でも動作する単なるテキスト入力として扱う。
 * Company Brain・AI Router・Provider固有のロジックはここには書かない。
 */

module.exports = {
  label: '物件紹介メール',
  category: '不動産売買',
  description: '物件紹介文やおすすめポイントから、顧客へ送る営業メールを生成します',

  fields: [
    { key: 'customerName',  label: '顧客名',       type: 'text',     required: true,  placeholder: '例: 山田 太郎' },
    { key: 'propertyName',  label: '物件名',       type: 'text',     required: true,  placeholder: '例: サンシティ南1条' },
    { key: 'propertyIntro', label: '物件紹介文',   type: 'textarea', required: false, placeholder: '「物件紹介文」テンプレートの生成結果を貼り付け、または概要を入力（未入力でも作成できます）' },
    { key: 'highlights',    label: 'おすすめポイント', type: 'textarea', required: true,  placeholder: '例: 駅徒歩5分、南向きで陽当たり良好、リフォーム済み' },
    { key: 'staffName',     label: '担当者名',     type: 'text',     required: true,  placeholder: '例: 佐藤 一郎' },
    { key: 'companyName',   label: '会社名',       type: 'text',     required: false, placeholder: '例: 〇〇不動産株式会社' },
  ],

  systemPrompt: `あなたは不動産会社向けAIアシスタントです。
物件情報をもとに、顧客へ送る「物件紹介メール」を作成してください。

【ルール】
- 売り込み感の強い表現（「今すぐ」「絶対お得」等）は避け、自然で読みやすい文章にする
- 誇大広告・断定的な表現（「必ず」「絶対」等）は使わない（宅建業法上の不当表示に配慮する）
- 入力されていない情報を推測や創作で補わない
- 顧客が返信・行動しやすいよう、末尾に内覧予約や質問受付などへのやわらかい誘導を添える
- メール本文のみを出力する（件名を付ける場合は先頭に「件名：」と書く）
- 署名は入力された担当者名・会社名を使う（未入力の場合は無理に補わず、一般的な結びで締める）`,

  buildUserPrompt: (fields = {}) => {
    const {
      customerName = '', propertyName = '', propertyIntro = '',
      highlights = '', staffName = '', companyName = '',
    } = fields;

    return `以下の情報から、顧客へ送る物件紹介メールを作成してください。

【顧客名】${customerName || '(未入力)'}様
【物件名】${propertyName || '(未入力)'}
【物件紹介文】
${propertyIntro || '(未入力。おすすめポイントを中心に作成してください)'}

【おすすめポイント】
${highlights || '(未入力)'}

【担当者名】${staffName || '(未入力)'}
【会社名】${companyName || '(未入力)'}`;
  },
};
