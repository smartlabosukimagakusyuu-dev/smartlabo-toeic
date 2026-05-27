/**
 * stripe.js
 * ===================================================
 * Stripe 決済管理
 *
 * 役割:
 *  - プレミアムプランの購入フロー（買い切り ¥1,500）
 *  - Stripe Checkout へのリダイレクト
 *  - 決済結果の確認（URLパラメータで判定）
 *
 * 【設定方法】
 * 1. https://dashboard.stripe.com でアカウント作成
 * 2. 「公開可能キー」（pk_live_... または pk_test_...）を STRIPE_PUBLIC_KEY に設定
 * 3. 商品を作成して「料金ID」（price_...）を STRIPE_PRICE_ID に設定
 * 4. Firebase Cloud FunctionsのURLを FUNCTIONS_BASE_URL に設定
 * ===================================================
 */

// ① Stripe 公開キー（ダッシュボード → 開発者 → APIキー）
const STRIPE_PUBLIC_KEY = 'pk_live_51TbEcx8P9AZo2oHh4ZPYl0Xlmh5HqEvmGtZkn3h20GkQIC43aM5boKvbeXzff5SgptPbEDLKHRBrmKq4qchE2sYS00533pfxHF';

// ② 価格ID（ダッシュボード → 商品 → 料金 → ID）
const STRIPE_PRICE_ID = 'price_1TbXbi8P9AZo2oHhzIV4qkQg';

// ③ Firebase Cloud Functions の URL（デプロイ後に設定）
const FUNCTIONS_BASE_URL = 'https://us-central1-smart-labo-aef08.cloudfunctions.net';

/**
 * Stripe Checkout へリダイレクト（プレミアム購入）
 */
async function startCheckout() {
  const user = getCurrentUser();

  // 未ログインの場合は登録を促す
  if (!user) {
    closeAuthModal();
    closePremiumModal();
    showAuthModal('signup');
    return;
  }

  const btn = document.getElementById('stripe-checkout-btn');
  if (btn) {
    btn.disabled    = true;
    btn.textContent = '処理中...⏳';
  }

  try {
    // Firebase ID Token を取得（Cloud Functions認証に使用）
    const idToken = await user.getIdToken();

    // Cloud Functions に Checkout Session 作成をリクエスト
    const res = await fetch(`${FUNCTIONS_BASE_URL}/createCheckoutSession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        priceId:    STRIPE_PRICE_ID,
        successUrl: `${location.origin}${location.pathname}?payment=success`,
        cancelUrl:  `${location.origin}${location.pathname}?payment=cancel`
      })
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const { sessionId } = await res.json();

    // Stripe Checkout へリダイレクト
    const stripe = Stripe(STRIPE_PUBLIC_KEY);
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      showToast('決済処理中にエラーが発生しました');
      console.error('[Stripe]', error);
    }

  } catch (err) {
    showToast('エラーが発生しました。再度お試しください');
    console.error('[Stripe] checkout error:', err);
    if (btn) {
      btn.disabled    = false;
      btn.textContent = '👑 プレミアムを購入する（¥1,500）';
    }
  }
}

/**
 * ページ読み込み時にURL パラメータで決済結果を確認
 * 決済成功後に Stripe がリダイレクトしてくる
 */
function checkPaymentResult() {
  const params = new URLSearchParams(location.search);
  const result = params.get('payment');

  if (result === 'success') {
    // URLパラメータを除去（ブラウザ履歴を汚さない）
    history.replaceState(null, '', location.pathname);
    showToast('💳 決済完了！確認中...');

    // Webhook処理後に isPremium が更新されるのを少し待って再確認
    // （watchPremiumStatus のリアルタイム監視が自動で反映する）
    setTimeout(async () => {
      const user = getCurrentUser();
      if (user) {
        const data = await getUserData(user.uid);
        if (data?.isPremium) {
          setPremiumStatus(true);
          updateUserStatusBar(user, data);
          hideFreeAds();
          showPremiumSuccessModal();
        } else {
          showToast('決済を確認中です。しばらくお待ちください...');
        }
      }
    }, 3000);

  } else if (result === 'cancel') {
    history.replaceState(null, '', location.pathname);
    showToast('決済がキャンセルされました');
  }
}

/**
 * プレミアム購入成功モーダルを表示
 */
function showPremiumSuccessModal() {
  const modal = document.getElementById('premium-success-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  } else {
    showToast('🎉 プレミアム会員になりました！全機能が解放されました');
  }
}

/**
 * 購入成功モーダルを閉じる
 */
function closePremiumSuccessModal() {
  document.getElementById('premium-success-modal')?.classList.remove('open');
  document.body.style.overflow = '';
}
