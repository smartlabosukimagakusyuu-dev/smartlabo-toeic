/**
 * Smart Labo Works — Template Engine: Template Loader（CEO承認による正式仕様）
 *
 * Smart Labo Worksは「機能追加型」ではなく「Template追加型」で成長するSaaSである。
 * 新しい業種・機能を追加するときは、対応するnamespaceフォルダに1ファイル追加するだけでよい
 * （このファイル・templateService.js・server.js・promptManager.jsはいずれも変更不要）。
 * 特定業種（例: 不動産）専用の分岐ロジックはこのファイルに一切書かない。
 *
 * namespace（サブフォルダ）:
 *   realestate/ … 不動産売買
 *   management/ … 不動産管理会社
 *   legal/      … 司法書士
 *   tax/        … 税理士
 *   common/     … 業種を問わず使う汎用テンプレート
 *
 * テンプレート定義ファイルの形式（namespaceフォルダ配下の1ファイル = 1テンプレート）:
 * {
 *   label:       string   UI表示名（例: '物件紹介文'）
 *   category:    string   業種カテゴリ（表示用の日本語ラベル。例: '不動産売買'）
 *   description: string   一覧カードに表示する説明文
 *   fields: [{ key, label, type: 'text'|'textarea'|'select', required, placeholder, options? }],
 *   systemPrompt: string,               // AIへのシステムプロンプト（テンプレート専用）
 *   buildUserPrompt: (fields) => string // 入力フィールド→ユーザープロンプトへの変換
 * }
 *
 * id・namespaceはファイルパスから自動生成するため、ファイル内に書く必要はない
 * （id = "<namespace>.<ファイル名>"、例: realestate/listing.js → "realestate.listing"）。
 *
 * fields/systemPrompt/buildUserPromptを実装していないファイルは「雛形（準備中）」として
 * status:'planned' で登録される。一覧APIには含まれるが、生成呼び出しは明確なエラーを返す
 * （templateService.js側でガードする）。Company Brain固有の取得ロジックは、
 * このファイル・各テンプレート定義ファイルのいずれにも書かない
 * （必要な場合は呼び出し元のService経由で取得し、fieldsとして渡す）。
 */

const fs = require('fs');
const path = require('path');

const IMPLEMENTED_KEYS = ['fields', 'systemPrompt', 'buildUserPrompt'];

function loadTemplates() {
  const templates = new Map();

  const namespaces = fs.readdirSync(__dirname)
    .filter(f => fs.statSync(path.join(__dirname, f)).isDirectory());

  for (const namespace of namespaces) {
    const dir = fs.readdirSync(path.join(__dirname, namespace)).filter(f => f.endsWith('.js'));

    for (const file of dir) {
      const mod = require(path.join(__dirname, namespace, file));
      const name = path.basename(file, '.js');
      const id = `${namespace}.${name}`;
      const isImplemented = IMPLEMENTED_KEYS.every(k => typeof mod[k] !== 'undefined');

      if (templates.has(id)) {
        throw new Error(`テンプレートIDが重複しています: "${id}"`);
      }

      templates.set(id, {
        ...mod,
        id,
        namespace,
        status: isImplemented ? 'ready' : 'planned',
      });
    }
  }

  return templates;
}

// 起動時に一度だけ読み込む（テンプレート数は少なく、ホットリロード対応は不要なため）
const TEMPLATES = loadTemplates();

/**
 * 登録済みテンプレートをUI向けの一覧として返す（systemPrompt/buildUserPromptは含めない）
 * status:'planned'（雛形・未実装）のテンプレートも含めて返す。表示の絞り込みは呼び出し側に委ねる。
 */
function list() {
  return Array.from(TEMPLATES.values()).map(({ id, namespace, label, category, description, fields, status }) => ({
    id, namespace, label, category, description, fields: fields || [], status,
  }));
}

/**
 * テンプレートIDから定義本体（systemPrompt/buildUserPrompt含む）を取得する
 */
function get(id) {
  return TEMPLATES.get(id) || null;
}

module.exports = { list, get };
