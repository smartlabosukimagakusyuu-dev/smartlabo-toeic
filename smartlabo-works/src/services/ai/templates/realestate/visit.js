/**
 * テンプレート: 内覧・来店予約案内（不動産売買向け・Appointment Template第一弾）
 * id・namespaceは templates/index.js（Template Loader）がファイルパスから自動付与する。
 *
 * 「Appointment Template」ファミリーの第一弾。visit.js専用の日程調整ロジックは
 * ここに閉じ込め、今後の来店予約・オンライン商談・現地案内・契約日時・鍵渡し・引渡し等は
 * 同じ形（顧客名・候補日時・場所・担当者・持参物・連絡先・備考という似た構成の入力項目）の
 * 定義ファイルを1つ追加するだけで拡張できることを前提に設計している
 * （visit.js自体には他のアポイント種別を判定するswitch文等は書かない。
 *   種別ごとに個別ファイルを追加する方式で拡張する）。
 *
 * 候補日時は将来Google Calendar/Outlook/予約システム等と連携する可能性を見据え、
 * 1行1候補のテキストとして扱う（現時点では構造化データへの変換・外部API連携は行わない）。
 *
 * Company Brain・AI Router・Provider固有のロジックはここには書かない。
 */

module.exports = {
  label: '内覧・来店予約案内',
  category: '不動産売買',
  description: '候補日時から、内覧・来店の日程調整メールを生成します',

  fields: [
    { key: 'customerName',       label: '顧客名',           type: 'text',     required: true,  placeholder: '例: 山田 太郎' },
    { key: 'propertyName',       label: '物件名',           type: 'text',     required: true,  placeholder: '例: サンシティ南1条' },
    { key: 'candidateDateTimes', label: '候補日時（複数可・改行区切り）', type: 'textarea', required: true, placeholder: '例:\n7月15日(水) 14:00〜\n7月16日(木) 10:00〜\n7月17日(金) 終日' },
    { key: 'meetingPlace',       label: '集合場所',         type: 'text',     required: true,  placeholder: '例: 現地（サンシティ南1条 エントランス前）' },
    { key: 'staffName',          label: '担当者',           type: 'text',     required: true,  placeholder: '例: 佐藤 一郎' },
    { key: 'itemsToBring',       label: '持参物',           type: 'textarea', required: false, placeholder: '例: 印鑑、本人確認書類（特になければ空欄でも可）' },
    { key: 'contactInfo',        label: '連絡先',           type: 'text',     required: false, placeholder: '例: 090-1234-5678 / sato@example.com' },
    { key: 'notes',              label: '備考',             type: 'textarea', required: false, placeholder: '例: 駐車場は近隣コインパーキングをご利用ください' },
  ],

  systemPrompt: `あなたは不動産会社向けAIアシスタントです。
物件の内覧・来店予約について、顧客と日程調整を行うための案内メールを作成してください。

【ルール】
- 丁寧で読みやすく、候補日時の中から選んで返信するだけで済むよう、返信しやすい文章にする
- 候補日時は箇条書きなど、一目で分かる形式で提示する
- 集合場所・持参物・連絡先など、伝えるべき情報を過不足なく含める
- キャンセル・日程変更が必要な場合の連絡方法についても、自然な形で案内に含める
- 入力されていない情報を推測や創作で補わない（持参物・連絡先・備考が未入力の場合は無理に書かない）
- 誇大広告・断定的な表現は使わない
- メール本文のみを出力する（件名を付ける場合は先頭に「件名：」と書く）`,

  buildUserPrompt: (fields = {}) => {
    const {
      customerName = '', propertyName = '', candidateDateTimes = '',
      meetingPlace = '', staffName = '', itemsToBring = '',
      contactInfo = '', notes = '',
    } = fields;

    return `以下の情報から、内覧・来店の日程調整メールを作成してください。

【顧客名】${customerName || '(未入力)'}様
【物件名】${propertyName || '(未入力)'}

【候補日時】
${candidateDateTimes || '(未入力)'}

【集合場所】${meetingPlace || '(未入力)'}
【担当者】${staffName || '(未入力)'}
【持参物】${itemsToBring || '(特になし)'}
【連絡先】${contactInfo || '(未入力)'}
【備考】${notes || '(特になし)'}`;
  },
};
