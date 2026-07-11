/**
 * Smart Labo Works — Database connection（Task7）
 *
 * Version1.0β向けの保存方式として SQLite（Node.js組み込みの node:sqlite）を採用した。
 * 理由は REFACTOR_PLAN.md Step1.4 の完了報告（PRODUCT_REQUIREMENTS.md等）を参照。
 * 要約：
 *   - node:sqlite はNode.js標準モジュールのため npm依存が増えない
 *     （本プロジェクトはこれまで一切npm依存を持たない方針で作られている）
 *   - 単純なJSONファイルと違い、company_idにインデックスを張った検索・
 *     同時書き込みへの耐性・トランザクションを最初から持てる
 *   - 1ファイル（.db）で完結するため、JSONファイルと同程度に運用・バックアップが容易
 *   - 将来PostgreSQL等へ移行する際も、SQL・スキーマの考え方をそのまま流用できる
 *
 * データベースファイルは data/smartlabo-works.db に生成される（.gitignore対象）。
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'smartlabo-works.db');
const db = new DatabaseSync(DB_PATH);

// ==========================================
// スキーマ
// ==========================================
// 各テーブルは Workspace → Company(company_id) → レコード という構造。
// レコード本体は data列にJSONとして保存する（Version1.0βでは、既存のフロントエンドが
// 扱うオブジェクト形状をそのまま保存し、フィールド追加・変更時のスキーマ移行を避けるため）。
// company_idにはインデックスを張り、企業単位の検索を高速化・安全に分離する。
db.exec(`
  CREATE TABLE IF NOT EXISTS crm (
    id         TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    data       TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_crm_company_id ON crm(company_id);

  CREATE TABLE IF NOT EXISTS deals (
    id         TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    data       TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals(company_id);

  CREATE TABLE IF NOT EXISTS contracts (
    id         TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    data       TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_contracts_company_id ON contracts(company_id);

  -- Task8: Company Brain（社内ナレッジ）のサーバー永続化
  CREATE TABLE IF NOT EXISTS brain (
    id         TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    data       TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_brain_company_id ON brain(company_id);
`);

module.exports = db;
