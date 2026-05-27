/**
 * firestore.js
 * ===================================================
 * Firestore ユーザーデータ管理
 *
 * 役割:
 *  - ログイン時にユーザードキュメントを自動作成
 *  - isPremium（プレミアム判定）の読み書き
 *  - 学習履歴のクラウド保存（プレミアム用）
 *
 * Firestore コレクション構造:
 *   users/{uid} = {
 *     uid: string,
 *     email: string,
 *     isPremium: boolean,
 *     createdAt: timestamp,
 *     premiumAt: timestamp | null
 *   }
 * ===================================================
 */

const db = firebase.firestore();

/**
 * ユーザードキュメントを確認し、なければ作成して返す
 * @param {firebase.User} user
 * @returns {Object} ユーザーデータ
 */
async function ensureUserDoc(user) {
  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();

  if (!snap.exists) {
    // 初回ログイン: 新規ドキュメントを作成
    const newUserData = {
      uid:        user.uid,
      email:      user.email,
      isPremium:  false,
      createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
      premiumAt:  null
    };
    await ref.set(newUserData);
    console.log('[Firestore] 新規ユーザー作成:', user.uid);
    return newUserData;
  }

  return snap.data();
}

/**
 * ユーザーデータを取得
 * @param {string} uid
 * @returns {Object|null}
 */
async function getUserData(uid) {
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists) return null;
  return snap.data();
}

/**
 * プレミアム状態をリアルタイム監視（Webhook処理後に自動反映）
 * @param {string} uid
 * @param {Function} callback - isPremium(boolean) を受け取る関数
 * @returns {Function} 監視を解除する関数
 */
function watchPremiumStatus(uid, callback) {
  return db.collection('users').doc(uid)
    .onSnapshot(snap => {
      if (snap.exists) {
        const isPremium = snap.data().isPremium === true;
        callback(isPremium);
      }
    });
}
