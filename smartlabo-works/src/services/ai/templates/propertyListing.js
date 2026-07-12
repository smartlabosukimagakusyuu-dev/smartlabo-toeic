/**
 * テンプレート: 物件紹介文（不動産売買・不動産管理向け）
 * Sprint3 Task4 Step2.1 で実装する唯一のテンプレート。
 */

module.exports = {
  id: 'property_listing',
  label: '物件紹介文',
  category: '不動産売買',
  description: '物件情報を入力すると、魅力が伝わる物件紹介文を生成します',

  fields: [
    { key: 'propertyType', label: '物件種別', type: 'text', required: true, placeholder: '例: 中古マンション、新築一戸建て' },
    { key: 'location',     label: '所在地',   type: 'text', required: true, placeholder: '例: 札幌市中央区南〇条西〇丁目' },
    { key: 'layout',       label: '間取り・広さ', type: 'text', required: false, placeholder: '例: 3LDK / 75.2㎡' },
    { key: 'age',          label: '築年数',   type: 'text', required: false, placeholder: '例: 築8年' },
    { key: 'price',        label: '価格',     type: 'text', required: false, placeholder: '例: 3,480万円' },
    { key: 'features',     label: '特徴・アピールポイント', type: 'textarea', required: true, placeholder: '例: 南向きで陽当たり良好、駅徒歩5分、リフォーム済み' },
  ],

  systemPrompt: `あなたは株式会社スマートラボが提供する不動産会社向けAIアシスタントです。
物件情報から、購入・入居検討者に魅力が伝わる物件紹介文を作成してください。

【ルール】
- 誇大広告・断定的な表現（「必ず」「絶対」等）は使わない（宅建業法上の不当表示に配慮する）
- 入力されていない情報を推測や創作で補わない
- 300〜500字程度で、読みやすい段落構成にする
- 誠実で信頼感のあるトーンにする（煽り文句は避ける）`,

  buildUserPrompt: (fields = {}) => {
    const {
      propertyType = '', location = '', layout = '',
      age = '', price = '', features = '',
    } = fields;

    return `以下の物件情報から、物件紹介文を作成してください。

【物件種別】${propertyType || '(未入力)'}
【所在地】${location || '(未入力)'}
【間取り・広さ】${layout || '(未入力)'}
【築年数】${age || '(未入力)'}
【価格】${price || '(未入力)'}
【特徴・アピールポイント】
${features || '(未入力)'}`;
  },
};
