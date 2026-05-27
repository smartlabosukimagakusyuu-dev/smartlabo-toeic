/**
 * premium.js
 * ===================================================
 * 無料 / プレミアム 機能制御
 *
 * 役割:
 *  - プレミアム状態の管理（Firestoreから取得した値を使用）
 *  - 無料ユーザーへのアクセス制限
 *  - プレミアムアップグレードモーダルの表示
 *  - 広告エリアの表示/非表示
 *
 * 無料版の制限:
 *  - 各ジャンルの最初の5問のみ
 *  - 苦手復習は利用不可
 *  - 学習履歴はローカルのみ
 * ===================================================
 */

// プレミアム状態（Firestoreで管理。クライアント側のみの判定は禁止）
let _isPremium = false;

// 無料ユーザーが使えるジャンルごとの問題数
const FREE_QUESTIONS_PER_GENRE = 5;

// =========================================
// プレミアム状態管理
// =========================================

/**
 * プレミアム状態をセット（auth.jsから呼ばれる）
 */
function setPremiumStatus(status) {
  _isPremium = status === true;
  updatePremiumUI();
}

/**
 * プレミアムかどうかを返す
 */
function isPremiumUser() {
  return _isPremium;
}

/**
 * プレミアム状態に応じてUIを更新
 */
function updatePremiumUI() {
  // 無料バナーの表示切替
  document.querySelectorAll('.free-only').forEach(el => {
    el.style.display = _isPremium ? 'none' : '';
  });
  document.querySelectorAll('.premium-only').forEach(el => {
    el.style.display = _isPremium ? '' : 'none';
  });
}

// =========================================
// 問題プールの取得（無料制限適用）
// =========================================

/**
 * ジャンル問題プールを返す
 *  無料: IDが若い順に最初の5問
 *  プレミアム: 全問題
 * @param {string} genre
 * @returns {Array}
 */
function getGenrePool(genre) {
  const all = QUESTIONS.filter(q => q.genre === genre);
  if (_isPremium) return all;
  // 無料: IDの昇順で最初の5問
  return [...all].sort((a, b) => a.id - b.id).slice(0, FREE_QUESTIONS_PER_GENRE);
}

/**
 * 全問題プールを返す（全ジャンルランダム）
 *  無料: 全ジャンル5問ずつ × 12 = 60問からランダム10問
 *  プレミアム: 全695問からランダム
 * @returns {Array}
 */
function getAllPool() {
  if (_isPremium) return QUESTIONS;
  // 無料: 各ジャンルから最初の5問を集めてプールにする
  const freePool = [];
  const genres = [...new Set(QUESTIONS.map(q => q.genre))];
  genres.forEach(genre => {
    const sorted = QUESTIONS.filter(q => q.genre === genre).sort((a, b) => a.id - b.id);
    freePool.push(...sorted.slice(0, FREE_QUESTIONS_PER_GENRE));
  });
  return freePool;
}

// =========================================
// アクセスチェック
// =========================================

/**
 * プレミアム機能へのアクセスを試みた時の処理
 *  未ログイン → ログイン/登録モーダルを表示
 *  無料ユーザー → プレミアムモーダルを表示
 *
 * @param {string} reason - ロックの理由（例: "苦手復習はプレミアム機能です"）
 * @returns {boolean} アクセス可能なら true
 */
function checkPremiumAccess(reason) {
  const user = getCurrentUser();
  if (!user) {
    // 未ログイン → 登録を促す
    showAuthModal('signup');
    return false;
  }
  if (!_isPremium) {
    // 無料ユーザー → アップグレードを促す
    showPremiumModal(reason);
    return false;
  }
  return true;
}

// =========================================
// プレミアムモーダル
// =========================================

/**
 * プレミアムアップグレードモーダルを表示
 * @param {string} reason - ロック理由のメッセージ（省略可）
 */
function showPremiumModal(reason) {
  const modal    = document.getElementById('premium-modal');
  const reasonEl = document.getElementById('premium-modal-reason');
  if (!modal) return;

  if (reason) {
    reasonEl.textContent  = reason;
    reasonEl.style.display = 'block';
  } else {
    reasonEl.style.display = 'none';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * プレミアムモーダルを閉じる
 */
function closePremiumModal() {
  document.getElementById('premium-modal')?.classList.remove('open');
  document.body.style.overflow = '';
}

// =========================================
// 広告エリア
// =========================================

/**
 * 無料ユーザー向け広告エリアを表示
 */
function showFreeAds() {
  document.querySelectorAll('.ad-area').forEach(el => el.style.display = 'flex');
}

/**
 * プレミアムユーザーは広告を非表示
 */
function hideFreeAds() {
  document.querySelectorAll('.ad-area').forEach(el => el.style.display = 'none');
}
