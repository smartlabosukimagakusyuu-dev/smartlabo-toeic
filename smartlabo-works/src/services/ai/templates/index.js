/**
 * Smart Labo Works — 業種特化テンプレート レジストリ
 *
 * 「Template First」設計：新しいテンプレートを追加したいときは、
 * このフォルダに1ファイル追加するだけでよい（このindex.js・呼び出し元の
 * templateService.js・server.jsは一切変更不要）。
 *
 * テンプレート定義ファイルの形式（各ファイルが module.exports するオブジェクト）:
 * {
 *   id:          string   一意なテンプレートID（例: 'property_listing'）
 *   label:       string   UI表示名（例: '物件紹介文'）
 *   category:    string   業種カテゴリ（例: '不動産売買'）
 *   description: string   一覧カードに表示する説明文
 *   fields: [{ key, label, type: 'text'|'textarea', required, placeholder }],
 *   systemPrompt: string,               // AIへのシステムプロンプト（テンプレート専用）
 *   buildUserPrompt: (fields) => string // 入力フィールド→ユーザープロンプトへの変換
 * }
 *
 * 将来追加予定（今回は未実装、ファイルを追加するだけで対応できる）:
 *   査定コメント / 営業メール / SNS投稿 / LINE配信文 / 司法書士向け文書 / 管理会社向け文書
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_KEYS = ['id', 'label', 'category', 'fields', 'systemPrompt', 'buildUserPrompt'];

function loadTemplates() {
  const templates = new Map();

  const files = fs.readdirSync(__dirname).filter(f => f !== 'index.js' && f.endsWith('.js'));

  for (const file of files) {
    const tpl = require(path.join(__dirname, file));
    const missing = REQUIRED_KEYS.filter(k => !(k in tpl));
    if (missing.length) {
      throw new Error(`テンプレート定義が不正です(${file}): 必須項目が不足 [${missing.join(', ')}]`);
    }
    if (templates.has(tpl.id)) {
      throw new Error(`テンプレートIDが重複しています: "${tpl.id}"`);
    }
    templates.set(tpl.id, tpl);
  }

  return templates;
}

// 起動時に一度だけ読み込む（テンプレート数は少なく、ホットリロード対応は不要なため）
const TEMPLATES = loadTemplates();

/**
 * 登録済みテンプレートをUI向けの一覧として返す（systemPrompt/buildUserPromptは含めない）
 */
function list() {
  return Array.from(TEMPLATES.values()).map(({ id, label, category, description, fields }) => ({
    id, label, category, description, fields,
  }));
}

/**
 * テンプレートIDから定義本体（systemPrompt/buildUserPrompt含む）を取得する
 */
function get(id) {
  return TEMPLATES.get(id) || null;
}

module.exports = { list, get };
