/**
 * auth.js
 * ===================================================
 * Firebase Authentication 管理
 *
 * 役割:
 *  - メール/パスワードでの新規登録・ログイン・ログアウト
 *  - ログイン状態の保持と変化検知
 *  - ユーザー状態バーの更新
 *  - 認証モーダルの表示/非表示
 * ===================================================
 */

// 現在ログイン中のユーザー（null = 未ログイン）
let _currentUser = null;

// Firestore プレミアム監視の解除関数
let _unsubscribePremium = null;

/**
 * 現在のユーザーを返す
 */
function getCurrentUser() {
  return _currentUser;
}

/**
 * Auth初期化 — アプリ起動時に1回だけ呼ぶ
 * ログイン状態が変わるたびに自動的に実行される
 */
function initAuth() {
  firebase.auth().onAuthStateChanged(async (user) => {
    _currentUser = user;

    // 前の監視を解除
    if (_unsubscribePremium) {
      _unsubscribePremium();
      _unsubscribePremium = null;
    }

    if (user) {
      // Firestoreにユーザーデータを作成/取得
      const userData = await ensureUserDoc(user);
      setPremiumStatus(userData.isPremium === true);
      updateUserStatusBar(user, userData);

      // プレミアム状態をリアルタイム監視（決済後に即反映）
      _unsubscribePremium = watchPremiumStatus(user.uid, (isPremium) => {
        setPremiumStatus(isPremium);
        getUserData(user.uid).then(data => updateUserStatusBar(user, data));
        if (isPremium) {
          hideFreeAds();
          showToast('👑 プレミアム会員になりました！');
        }
      });

    } else {
      setPremiumStatus(false);
      updateUserStatusBar(null, null);
    }
  });
}

// =========================================
// 認証処理
// =========================================

/**
 * メールアドレスで新規登録
 */
async function signUpWithEmail(email, password) {
  const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
  return cred.user;
}

/**
 * メールアドレスでログイン
 */
async function signInWithEmail(email, password) {
  const cred = await firebase.auth().signInWithEmailAndPassword(email, password);
  return cred.user;
}

/**
 * ログアウト
 */
async function signOutUser() {
  await firebase.auth().signOut();
}

// =========================================
// UI 操作
// =========================================

/**
 * ユーザー状態バーを更新
 */
function updateUserStatusBar(user, userData) {
  const bar = document.getElementById('user-status-bar');
  if (!bar) return;

  if (user) {
    const isPremium = userData?.isPremium === true;
    bar.innerHTML = `
      <span class="usb-email">${escapeHtml(user.email)}</span>
      <span class="usb-badge ${isPremium ? 'usb-badge-premium' : 'usb-badge-free'}">
        ${isPremium ? '👑 プレミアム' : '🆓 無料版'}
      </span>
      <button class="usb-logout" onclick="handleLogout()">ログアウト</button>
    `;
    if (!isPremium) showFreeAds();
    else hideFreeAds();
  } else {
    bar.innerHTML = `
      <span class="usb-guest">👤 ゲスト</span>
      <button class="usb-btn-login" onclick="showAuthModal('login')">ログイン</button>
      <button class="usb-btn-signup" onclick="showAuthModal('signup')">無料登録</button>
    `;
    showFreeAds();
  }
}

/**
 * 認証モーダルを表示
 * @param {'login'|'signup'} mode
 */
function showAuthModal(mode = 'login') {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  modal.dataset.mode = mode;
  const title   = document.getElementById('auth-modal-title');
  const btn     = document.getElementById('auth-submit-btn');
  const sw      = document.getElementById('auth-switch-link');
  const errEl   = document.getElementById('auth-error');

  if (mode === 'login') {
    title.textContent  = 'ログイン';
    btn.textContent    = 'ログイン';
    sw.innerHTML       = 'アカウントをお持ちでない方は<a href="#" onclick="showAuthModal(\'signup\');return false;">新規登録（無料）</a>';
  } else {
    title.textContent  = '新規登録（無料）';
    btn.textContent    = '登録する';
    sw.innerHTML       = 'すでにアカウントの方は<a href="#" onclick="showAuthModal(\'login\');return false;">ログイン</a>';
  }

  errEl.textContent = '';
  document.getElementById('auth-email').value    = '';
  document.getElementById('auth-password').value = '';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * 認証モーダルを閉じる
 */
function closeAuthModal() {
  document.getElementById('auth-modal')?.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * 認証フォームの送信
 */
async function handleAuthSubmit() {
  const modal    = document.getElementById('auth-modal');
  const mode     = modal.dataset.mode;
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errEl    = document.getElementById('auth-error');
  const btn      = document.getElementById('auth-submit-btn');

  // バリデーション
  if (!email || !password) {
    errEl.textContent = 'メールアドレスとパスワードを入力してください';
    return;
  }
  if (password.length < 6) {
    errEl.textContent = 'パスワードは6文字以上で設定してください';
    return;
  }

  btn.disabled    = true;
  btn.textContent = '処理中...';
  errEl.textContent = '';

  try {
    if (mode === 'signup') {
      await signUpWithEmail(email, password);
      closeAuthModal();
      showToast('🎉 登録完了！ようこそ');
    } else {
      await signInWithEmail(email, password);
      closeAuthModal();
      showToast('ログインしました！');
    }
  } catch (err) {
    errEl.textContent = getAuthErrorMessage(err.code);
  } finally {
    btn.disabled    = false;
    btn.textContent = mode === 'signup' ? '登録する' : 'ログイン';
  }
}

/**
 * ログアウト処理
 */
async function handleLogout() {
  if (!confirm('ログアウトしますか？')) return;
  await signOutUser();
  showToast('ログアウトしました');
}

/**
 * Firebase エラーコードを日本語メッセージに変換
 */
function getAuthErrorMessage(code) {
  const map = {
    'auth/email-already-in-use':   'このメールアドレスは既に使用されています',
    'auth/invalid-email':          'メールアドレスの形式が正しくありません',
    'auth/weak-password':          'パスワードは6文字以上で設定してください',
    'auth/user-not-found':         'メールアドレスまたはパスワードが間違っています',
    'auth/wrong-password':         'メールアドレスまたはパスワードが間違っています',
    'auth/invalid-credential':     'メールアドレスまたはパスワードが間違っています',
    'auth/too-many-requests':      'ログイン試行が多すぎます。しばらく経ってから再試行してください',
    'auth/network-request-failed': 'ネットワークエラーが発生しました。接続を確認してください',
  };
  return map[code] || `エラーが発生しました (${code})`;
}

/** HTMLエスケープ */
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
