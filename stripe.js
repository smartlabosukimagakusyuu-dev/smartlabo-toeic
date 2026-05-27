/**
 * stripe.js - Stripe 決済管理（Payment Link方式）
 * CORSの問題を回避するためPayment Linkを使用
 */

// Stripe Payment Link URL（Stripeダッシュボードで作成）
// テスト中: 本番に切り替える場合は下の本番URLに変更
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_9B66oB1ofbb8cbZdoe2Ry00';
// const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/9B66oB1ofbb8cbZdoe2Ry00'; // 本番URL

/**
 * Stripe Payment Linkへリダイレクト
 * client_reference_id にユーザーのUIDを付与して誰の購入か識別
 */
function startCheckout() {
  const user = getCurrentUser();

  // 未ログインの場合は登録を促す
  if (!user) {
    closePremiumModal();
    showAuthModal('signup');
    return;
  }

  // Payment Link に UID をパラメータとして付与
  const successUrl = encodeURIComponent(
    `${location.origin}${location.pathname}?payment=success`
  );
  const cancelUrl = encodeURIComponent(
    `${location.origin}${location.pathname}?payment=cancel`
  );

  const checkoutUrl = `${STRIPE_PAYMENT_LINK}?client_reference_id=${user.uid}&prefilled_email=${encodeURIComponent(user.email)}`;

  // Stripe決済ページへリダイレクト
  window.location.href = checkoutUrl;
}

/**
 * ページ読み込み時にURL パラメータで決済結果を確認
 */
function checkPaymentResult() {
  const params = new URLSearchParams(location.search);
  const result = params.get('payment');

  if (result === 'success') {
    history.replaceState(null, '', location.pathname);
    showToast('💳 決済完了！確認中...');

    // Webhookが処理するまで少し待ってから確認
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
          showToast('✅ 決済を確認中です。しばらくお待ちください...');
          // 5秒後に再確認
          setTimeout(async () => {
            const data2 = await getUserData(user.uid);
            if (data2?.isPremium) {
              setPremiumStatus(true);
              updateUserStatusBar(user, data2);
              hideFreeAds();
              showPremiumSuccessModal();
            }
          }, 5000);
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
  }
}

/**
 * 購入成功モーダルを閉じる
 */
function closePremiumSuccessModal() {
  document.getElementById('premium-success-modal')?.classList.remove('open');
  document.body.style.overflow = '';
}
