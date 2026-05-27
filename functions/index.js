/**
 * functions/index.js
 * ===================================================
 * Firebase Cloud Functions — サーバーサイド処理
 *
 * 役割:
 *  1. createCheckoutSession  … Stripe Checkout Session を作成
 *  2. stripeWebhook          … Stripe の支払い完了を受信し
 *                              Firestore の isPremium を true に更新
 *
 * 【デプロイ方法】
 *  cd functions
 *  npm install
 *  firebase deploy --only functions
 * ===================================================
 */

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const stripe    = require('stripe')(functions.config().stripe.secret_key);

admin.initializeApp();

// Stripe Webhook 署名シークレット（Stripeダッシュボードで取得）
const WEBHOOK_SECRET = functions.config().stripe.webhook_secret;

// CORS 許可オリジン（GitHub Pages の URL に変更）
const ALLOWED_ORIGIN = '*'; // 本番は 'https://smartlabosukimagakusyuu-dev.github.io' に変更

// =========================================
// エンドポイント 1: Checkout Session 作成
// =========================================
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  // CORS ヘッダー
  res.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // ① Firebase ID Token で認証チェック
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
  } catch {
    return res.status(401).json({ error: '認証トークンが無効です' });
  }

  const { priceId, successUrl, cancelUrl } = req.body;
  if (!priceId || !successUrl || !cancelUrl) {
    return res.status(400).json({ error: 'パラメータが不足しています' });
  }

  try {
    // ② Stripe Checkout Session を作成
    const session = await stripe.checkout.sessions.create({
      mode:                 'payment',       // 買い切り
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url:          successUrl,
      cancel_url:           cancelUrl,
      locale:               'ja',            // 日本語表示
      metadata: {
        uid:   decodedToken.uid,             // WebhookでFirestoreを更新するためにuidを渡す
        email: decodedToken.email || ''
      },
      customer_email: decodedToken.email,   // チェックアウト画面にメール自動入力
    });

    console.log(`[Checkout] Session作成 uid=${decodedToken.uid}`);
    res.json({ sessionId: session.id });

  } catch (err) {
    console.error('[Checkout] Session作成失敗:', err);
    res.status(500).json({ error: '決済セッションの作成に失敗しました' });
  }
});

// =========================================
// エンドポイント 2: Stripe Webhook 受信
// =========================================
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  // ① Stripe の署名を検証（セキュリティのため必須）
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook] 署名検証失敗:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ② 支払い完了イベントのみ処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const uid     = session.metadata?.uid;

    if (uid && session.payment_status === 'paid') {
      // ③ Firestore の isPremium を true に更新（サーバーサイドで行うのでセキュア）
      await admin.firestore().collection('users').doc(uid).update({
        isPremium:       true,
        premiumAt:       admin.firestore.FieldValue.serverTimestamp(),
        stripeSessionId: session.id,
      });
      console.log(`[Webhook] ✅ isPremium=true 設定完了 uid=${uid}`);
    }
  }

  res.json({ received: true });
});
