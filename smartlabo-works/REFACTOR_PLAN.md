# Smart Labo Works — Refactor Plan

> **本書の目的**：Smart Labo Worksを「新機能を追加すること」ではなく「販売可能なSaaSへ仕上げること」を目的に、着手すべき改修をPhase・Stepへ分解した計画書。CLAUDE.md・PRODUCT_REQUIREMENTS.md・PRODUCT_BOUNDARY.mdと矛盾しないよう作成した。
>
> **本書はコード変更を含まない。** 各Stepの実装は、CEO承認済み「Version1.0リファクタリング」5Stepの運用ルール（1Step→Git Commit→CURRENT_STATUS更新→報告→CEO承認→次Step）に従い、1ステップずつ着手する。

---

## 1. ドキュメント情報

| 項目 | 内容 |
|---|---|
| 文書名 | Smart Labo Works Refactor Plan |
| バージョン | v1.0 |
| 作成日 | 2026-07-10 |
| 最終更新日 | 2026-07-10 |
| ステータス | CEO承認待ち |
| 管理責任 | Claude Code |
| 関連ドキュメント | `PRODUCT_REQUIREMENTS.md`（何を作るか）／`PRODUCT_BOUNDARY.md`（社内専用と顧客向けの境界）／`BUSINESS_STRATEGY.md`／`CLAUDE.md`（技術・設計基準） |

---

## 2. North Star（CEO指示より）

- Smart Labo Worksは中小企業向けAI業務支援SaaSである。
- Company OSは株式会社スマートラボ専用基盤であり、販売対象ではない。
- すべての実装は、販売製品Smart Labo Worksの品質向上を最優先する。
- 新機能追加より、**認証・企業単位データ分離・サーバー保存・保守性**を優先する。

## 3. 禁止事項（CEO指示より、本計画全体を通して厳守）

- 新機能追加（Phase2・Phase3は認証・企業分離・保守性の基盤が整った後に着手する。Phase1完了前には行わない）
- Smart Growth関連の実装
- Innovation Hubの実装
- Builderの実装（表記修正〈Task5〉を除く）
- Company Memoryの実装
- Meeting AIの新規開発（Phase3の「既存コードの接続のみ」を除く）
- UIリニューアル
- 一括リファクタリング（すべて小さなStep単位で行う）

---

## 4. 全体構成

| Phase | 目的 | 対応するCEO承認5Stepとの関係 |
|---|---|---|
| Phase 1：基盤整備 | 販売可能なSaaSに最低限必要な土台（認証・企業分離・AI Router・CRM保存・app分割） | Step1.1＝Task3（サーバー認証）、Step1.3＝Task4（AI Router整理）。Step1.2・1.4・1.5はTask3〜5完了後、追加のCEO承認を得て着手 |
| Phase 2：不動産特化機能 | 顧客（不動産会社）が実際に価値を感じる機能 | Phase1完了後に新規タスクとして提案・承認を得る |
| Phase 3：拡張AI機能 | 将来のAI Provider拡張 | Phase1・Phase2完了後に新規タスクとして提案・承認を得る |

**Task5（Company OS表記修正）は、いずれのPhaseにも属さない独立した表記修正であり、CEO承認済み5Stepの一部として別途実施する（本計画のPhase構成外）。**

---

## 5. Phase 1：基盤整備

### Step 1.1 サーバー認証（Task3）

| 項目 | 内容 |
|---|---|
| 対象ファイル | `server.js`（認証エンドポイント新設）、`app.html`（`doLogin()`まわり）、`src/config/env.js` |
| 変更範囲 | サーバー側でCompanyID・Email・Passwordを検証し、セッションを発行する最小構成。将来のWorkspace→Company→User→Role構造を見据え、現時点はCompanyID="default"固定。パスワードをHTML/JSに保持しない |
| リスク | 中。セッション管理方式（Cookie等）の選定を誤ると、Step1.2の企業分離に手戻りが生じる |
| コミット単位 | 2〜3コミット（認証エンドポイント追加 → ログイン画面接続 → 未認証アクセスのAPI保護） |
| 完了条件 | パスワードが平文でHTML/JSに存在しない。サーバー再起動後もログイン処理が機能する。未ログイン状態でのAPI呼び出しが拒否される |

### Step 1.2 企業（Company）単位のデータ分離

| 項目 | 内容 |
|---|---|
| 対象ファイル | `server.js`、新設するストレージ層、`app.html`（CRM・Company Brain等の保存呼び出し箇所） |
| 変更範囲 | Step1.1のセッションが持つCompanyIDを使い、データ読み書き時に必ずスコープを絞る。影響範囲の小さいAIログから着手し、次にCompany Brainナレッジ、CRMの順でパイロット導入する（一括移行はしない） |
| リスク | 中〜高。ストレージ方式（SQLite／JSONファイル等）の選定を誤ると、後続機能で作り直しが発生する |
| コミット単位 | 対象データ単位で分割（AIログの企業スコープ化＝1コミット、Company Brainナレッジ＝1〜2コミット、CRM＝1〜2コミット） |
| 完了条件 | 異なるCompanyIDのセッションで、互いのデータが一切見えないことを確認できる |

### Step 1.3 AI Router整理（Task4）

| 項目 | 内容 |
|---|---|
| 対象ファイル | `src/services/ai/router/router.js`、`src/services/ai/providers/*`、`src/services/ai/types/aiTypes.js` |
| 変更範囲 | OpenAI・Claude・将来のGemini・Whisper・OCRを同一のProviderインターフェースへ統一。呼び出し順序をRouter→Provider→AIに一本化し、新Provider追加時に`router.js`本体を書き換えなくてよい構造にする |
| リスク | 低〜中。既存のOpenAI／Claude呼び出し（Company Brain・AI Assistant・Innovation Review・Work Order生成）を壊さないよう、インターフェース変更は後方互換を保つ |
| コミット単位 | 1〜2コミット |
| 完了条件 | 新しいProviderを追加する際、`ROUTE_TABLE`への登録と`providers/`への新規ファイル追加のみで完結し、`router.js`のルーティングロジック本体を変更せずに済むこと |

### Step 1.4 CRMデータのサーバー保存化

| 項目 | 内容 |
|---|---|
| 対象ファイル | `server.js`、`app.html`（`saveCrmData()`・`saveDealsData()`等） |
| 変更範囲 | `localStorage`保存からサーバー永続化への移行。Step1.2の企業分離と一体で実施し、単独では行わない |
| リスク | 中。既存デモデータとの整合、移行漏れによるデータ消失 |
| コミット単位 | 2コミット（保存API追加 → フロント側の保存呼び出し接続） |
| 完了条件 | サーバー再起動後もCRMデータが保持され、ブラウザを変えても同じ企業アカウントで同じデータが見えること |

### Step 1.5 app.html分割

| 項目 | 内容 |
|---|---|
| 対象ファイル | `app.html`（323KBの単一ファイル） |
| 変更範囲 | UI・状態管理・ビジネスロジックの混在（CLAUDE.md「UIとロジックの混在禁止」への適合）を段階的に解消する。**一括分割は「大規模変更」に該当するため行わない。** Step1.1〜1.4で触れた機能（認証・CRM保存等）から順に、変更のついでに該当ブロックのみ分離する方式を取る |
| リスク | 高（本計画の中で最もリスクが大きい）。小さく分割し、都度動作確認することでリスクを低減する |
| コミット単位 | 機能ブロック単位（1機能の分離＝1コミット目安）。一度に複数機能を分割しない |
| 完了条件 | 新規に触れたコードが`app.html`への直書きではなく、分離されたモジュールに実装されていること（完全分割はv1.0後の継続タスクとしてよい） |

---

## 6. Phase 2：不動産特化機能

> Phase1（特にStep1.1〜1.3）完了後、CEOの追加承認を得てから着手する。

### Step 2.1 物件紹介文作成

| 項目 | 内容 |
|---|---|
| 対象ファイル | `src/services/ai/promptManager.js`（新規プロンプトタイプ追加）、`assistantService.js`、`app.html`（UI追加） |
| 変更範囲 | 既存の`assistant.generate()`パターンを踏襲し、`property_listing`等の新タイプを追加 |
| リスク | 低 |
| コミット単位 | 2コミット（プロンプト追加 → UI接続） |
| 完了条件 | 物件情報の入力から紹介文が生成できること |

### Step 2.2 査定コメント作成

| 項目 | 内容 |
|---|---|
| 対象ファイル | `src/services/ai/promptManager.js`、`assistantService.js`、`app.html` |
| 変更範囲 | Step2.1と同様のパターンで`assessment_comment`等の新タイプを追加 |
| リスク | 低 |
| コミット単位 | 2コミット |
| 完了条件 | 物件・条件情報の入力から査定コメントが生成できること |

### Step 2.3 業務テンプレート整備

| 項目 | 内容 |
|---|---|
| 対象ファイル | `app.html`（既存の`INDUSTRY_TEMPLATES.不動産`データ）、`src/services/ai/promptManager.js` |
| 変更範囲 | 既に存在する静的データ（不動産カテゴリ・営業フロー・FAQ）をCompany Brainの初期登録データとして接続する |
| リスク | 低 |
| コミット単位 | 1コミット |
| 完了条件 | 新規企業導入時に、不動産向け初期ナレッジがCompany Brainへ登録された状態で開始できること |

### Step 2.4 メール文作成の強化

| 項目 | 内容 |
|---|---|
| 対象ファイル | `src/services/ai/promptManager.js`（`assistant.inquiry_reply`／`sales_email`） |
| 変更範囲 | 既存機能のプロンプトを、不動産業務の文脈（重説・内見案内等）に合わせて調整 |
| リスク | 低 |
| コミット単位 | 1コミット |
| 完了条件 | 生成文が不動産業務の実用に耐える品質であること（レビューベースで確認） |

---

## 7. Phase 3：拡張AI機能

> Phase1・Phase2完了後、CEOの追加承認を得てから着手する。

### Step 3.1 OCR

| 項目 | 内容 |
|---|---|
| 対象ファイル | `src/services/ai/providers/ocrProvider.js`（新規）、`router/router.js`（登録） |
| 変更範囲 | Step1.3で整理したProviderパターンに従い、新規Providerとして追加 |
| リスク | 中（外部API費用・認識精度） |
| コミット単位 | 2コミット（Provider実装 → Router登録） |
| 完了条件 | 画像・PDFからのテキスト抽出が動作すること |

### Step 3.2 Whisper（音声文字起こし）

| 項目 | 内容 |
|---|---|
| 対象ファイル | `src/services/ai/providers/whisperProvider.js`（新規）、`router/router.js`（登録） |
| 変更範囲 | 同上のProviderパターンで追加 |
| リスク | 中（音声データの取り扱い、個人情報保護。録音同意フローの検討が別途必要） |
| コミット単位 | 2コミット |
| 完了条件 | 音声ファイルからテキストへの変換が動作すること |

### Step 3.3 Gemini

| 項目 | 内容 |
|---|---|
| 対象ファイル | `src/services/ai/providers/geminiProvider.js`（新規）、`router/router.js`（登録） |
| 変更範囲 | 同上のProviderパターンで追加 |
| リスク | 低〜中 |
| コミット単位 | 1〜2コミット |
| 完了条件 | Gemini経由の応答が取得できること |

### Step 3.4 Meeting AI

| 項目 | 内容 |
|---|---|
| 対象ファイル | `server.js`（新規APIエンドポイント）、`src/services/ai/meetingService.js`（既存・実装済みだが未接続） |
| 変更範囲 | **新規開発ではなく、既に実装済みの`meetingService.js`を`server.js`の`loadAIServices()`に接続するのみ** |
| リスク | 低（既存コードの接続のみ） |
| コミット単位 | 1コミット |
| 完了条件 | 議事録要約APIが動作すること |

---

## 8. 運用ルール

1. **1 Step → Git Commit → CURRENT_STATUS更新 → 変更報告 → CEO承認 → 次Step** を厳守する。
2. 各Stepの報告には、変更ファイル・変更理由・コミットメッセージ・影響範囲・次Stepを含める。
3. Phase間の移動（Phase1→Phase2、Phase2→Phase3）には、Step単位の承認とは別に、CEOへ改めて着手可否を確認する。
4. 本計画に記載のない作業（禁止事項に該当するもの、または未記載の新機能）は、実装前に必ずCEOへ確認する。

---

## 変更履歴

| バージョン | 日付 | 変更者 | 変更内容 |
|---|---|---|---|
| v1.0 | 2026-07-10 | Claude Code（CEO承認による） | 新規作成。CEO承認済み「Version1.0リファクタリング」5Stepのうち、Task2として作成。Phase1（認証・企業分離・AI Router・CRM保存・app分割）、Phase2（物件紹介文・査定コメント・テンプレート・メール）、Phase3（OCR・Whisper・Gemini・Meeting AI）の各Stepに、対象ファイル・変更範囲・リスク・コミット単位・完了条件を記載した |
