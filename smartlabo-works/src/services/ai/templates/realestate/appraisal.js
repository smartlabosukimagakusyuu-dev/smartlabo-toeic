/**
 * テンプレート: 査定コメント（不動産売買向け）
 * id・namespaceは templates/index.js（Template Loader）がファイルパスから自動付与する。
 *
 * Sprint3 Task4 Step2.2で実装・動作確認・CEO承認済みの内容を、
 * Template Engine正式フォルダ構成（realestate/）へそのまま移動したもの。
 * 査定価格の根拠を顧客にそのまま提示できる文章として生成する。法的判断・価格保証は行わず、
 * 断定的な将来予測表現も禁止する（CEO指示「必ず売れる」「確実に値上がりする」等の表現禁止に対応）。
 */

const TONE_OPTIONS = [
  { value: 'standard', label: '標準（丁寧・誠実）' },
  { value: 'concise',  label: '簡潔' },
  { value: 'detailed', label: '詳しく丁寧に' },
];
const TONE_LABELS = TONE_OPTIONS.reduce((acc, t) => (acc[t.value] = t.label, acc), {});

module.exports = {
  label: '査定コメント',
  category: '不動産売買',
  description: '査定価格の根拠が伝わる、顧客提示用の査定コメントを生成します',

  fields: [
    { key: 'propertyType',    label: '物件種別',         type: 'text',     required: true,  placeholder: '例: 中古一戸建て、土地' },
    { key: 'location',        label: '所在地',           type: 'text',     required: true,  placeholder: '例: 札幌市中央区南〇条西〇丁目' },
    { key: 'landArea',        label: '土地面積',         type: 'text',     required: false, placeholder: '例: 120.5㎡' },
    { key: 'buildingArea',    label: '建物面積',         type: 'text',     required: false, placeholder: '例: 95.0㎡' },
    { key: 'age',             label: '築年数',           type: 'text',     required: false, placeholder: '例: 築15年' },
    { key: 'stationDistance', label: '最寄駅までの距離', type: 'text',     required: false, placeholder: '例: 徒歩8分' },
    { key: 'surroundings',    label: '周辺環境',         type: 'textarea', required: false, placeholder: '例: 閑静な住宅街、スーパー・小学校が近い' },
    { key: 'roadAccess',      label: '接道状況',         type: 'text',     required: false, placeholder: '例: 南側6m公道に接道' },
    { key: 'strengths',       label: '物件の強み',       type: 'textarea', required: true,  placeholder: '例: 陽当たり良好、角地、リフォーム済み' },
    { key: 'weaknesses',      label: '物件の弱み',       type: 'textarea', required: false, placeholder: '例: 駅から距離がある、旧耐震基準' },
    { key: 'price',           label: '査定価格',         type: 'text',     required: true,  placeholder: '例: 2,800万円' },
    { key: 'basis',           label: '査定根拠',         type: 'textarea', required: true,  placeholder: '例: 周辺成約事例、路線価、築年数を踏まえて算出' },
    { key: 'tone',            label: 'コメントのトーン', type: 'select',   required: false, options: TONE_OPTIONS },
  ],

  systemPrompt: `あなたは株式会社スマートラボが提供する不動産会社向けAIアシスタントです。
査定価格とその根拠をもとに、顧客へそのまま提示できる「査定コメント」を作成してください。

【位置づけ】
このコメントは査定価格に納得感を持ってもらうための補足説明であり、契約書・重要事項説明書ではありません。
法的な効力を持つ文言や、価格を保証する表現にはしないでください。

【厳守ルール】
- 「必ず売れます」「確実に値上がりします」等、将来を断定・保証する表現は禁止する
- 法的判断（税務・権利関係の断定等）や価格保証は行わない
- 入力されていない情報を推測や創作で補わない（未確認情報を事実として書かない）
- 専門用語は必要最小限にとどめ、一般の顧客にもわかりやすい言葉を使う
- 査定価格の根拠（立地・広さ・築年数・周辺環境・強み弱み等）が伝わるように構成する
- 断定しすぎず、「〜と考えられます」「〜の傾向があります」等、査定担当者としての見解であることが伝わるトーンにする
- 営業的な誇張ではなく、誠実な説明を心がける
- 必要に応じて、末尾に「本コメントは参考情報であり、最終的な取引条件は別途ご相談ください」等の注意書きを添える`,

  buildUserPrompt: (fields = {}) => {
    const {
      propertyType = '', location = '', landArea = '', buildingArea = '',
      age = '', stationDistance = '', surroundings = '', roadAccess = '',
      strengths = '', weaknesses = '', price = '', basis = '', tone = '',
    } = fields;

    const toneLabel = TONE_LABELS[tone] || TONE_LABELS.standard;

    return `以下の査定情報から、顧客へ提示する査定コメントを作成してください。

【物件種別】${propertyType || '(未入力)'}
【所在地】${location || '(未入力)'}
【土地面積】${landArea || '(未入力)'}
【建物面積】${buildingArea || '(未入力)'}
【築年数】${age || '(未入力)'}
【最寄駅までの距離】${stationDistance || '(未入力)'}
【周辺環境】${surroundings || '(未入力)'}
【接道状況】${roadAccess || '(未入力)'}
【物件の強み】${strengths || '(未入力)'}
【物件の弱み】${weaknesses || '(未入力)'}
【査定価格】${price || '(未入力)'}
【査定根拠】${basis || '(未入力)'}

【コメントのトーン】${toneLabel}`;
  },
};
