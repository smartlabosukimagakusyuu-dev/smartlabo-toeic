# Smart Labo Works — Business Strategy

> **本書のステータス：スタブ（未着手）。** 本書は2026-07-10、CEOより「PROJECT_BIBLE／CURRENT_STATUS／PRODUCT_REQUIREMENTS／PRODUCT_BOUNDARY／BUSINESS_STRATEGYも、smartlabo-worksのみを正式版として管理してください」という指示の中で名前が挙がったが、**これまで本書自体が存在しなかった**。中身のない事業戦略を捏造することは本セッションの原則（推測と事実を分ける、調査していない内容を実装済みと記載しない）に反するため、現時点で確定している事実のみを記載し、他は「未着手」として明示する。

---

## 1. ドキュメント情報

| 項目 | 内容 |
|---|---|
| 文書名 | Smart Labo Works Business Strategy |
| バージョン | v0.1（スタブ） |
| 作成日 | 2026-07-10 |
| 最終更新日 | 2026-07-10 |
| ステータス | **未着手（骨子のみ）** |
| 管理責任 | Claude Code（Project Bible編集長 / Lead Software Engineer 兼 Knowledge Manager） |
| 関連ドキュメント | `PRODUCT_REQUIREMENTS.md`（何を作るか）／`PRODUCT_BOUNDARY.md`（社内専用と顧客向けの境界）／PROJECT_BIBLE（別リポジトリ、会社全体のSSOT） |

---

## 2. 現時点で確定している事実

- **会社名**：株式会社スマートラボ
- **販売する製品**：Smart Labo Works（顧客向けSaaS）
- **社内専用システム**：Company OS（非売品、顧客へ販売しない）
- **Smart Labo Worksの唯一の正式コードベース**：`smartlabo-works`（Node.js版）。`WEBSITE/app.html`（別リポジトリ、GitHub Pages公開版）はSmart Labo Works正式製品ではなく、デモサイト／マーケティング用プレビューとして扱う（2026-07-10 CEO決定、詳細は`PRODUCT_BOUNDARY.md`第0.2章）
- **最初の主要対象**：不動産会社（第一号候補：札幌の不動産会社）
- **将来的な対象**：建設業、士業、介護、医療周辺、製造業、小売業、その他の中小企業（`PRODUCT_REQUIREMENTS.md`第1章より）
- **「Smart Labo Group」「Smart Labo AI」「Smart Labo CRM」**：いずれも正式名称・正式製品ではなく、将来のブランド構想／商品候補（`PRODUCT_BOUNDARY.md`第4章）

これらは`PRODUCT_REQUIREMENTS.md`・`PRODUCT_BOUNDARY.md`に記載済みの内容の要約であり、本書独自の新情報ではない。

---

## 3. 未着手の項目(今後CEOとの議論により拡充)

以下は一般的な事業戦略文書が扱う項目の例であり、**本書ではまだ一切検討していない**。着手する際は、憶測で埋めず、CEOとの議論を経て記載すること。

- 料金体系・プラン設計の正式決定（`app.html`内に`PLANS`という静的データ〈Starter ¥9,800/月、Pro ¥29,800/月等〉が存在するが、これが正式料金かデモ用の仮データかは未確認。`PRODUCT_REQUIREMENTS.md`第24章「未決定事項」参照）
- 市場規模・競合分析
- 営業・販売チャネル戦略
- 資金計画・売上目標
- 採用・組織拡大計画
- 札幌の不動産会社への具体的な提案内容・契約条件
- 業種展開の優先順位とタイムライン
- パートナーシップ・アライアンス戦略

---

## 4. 更新ルール

事業戦略に関する意思決定（料金・市場・提携・資金計画等）がCEOまたはChatGPTとの議論でなされた場合、本書を更新すること。その際も本書の他章と同様、事実と推測を分けて記載する。

---

## 変更履歴

| バージョン | 日付 | 変更者 | 変更内容 |
|---|---|---|---|
| v0.1 | 2026-07-10 | Claude Code（CEO指示による） | 新規作成（スタブ）。CEOの指示で名前が挙がったが実体が存在しなかったため、捏造を避け、現時点で確定している事実（会社名・製品名・唯一の正式コードベース決定等）のみを記載し、その他は未着手として明示した |
