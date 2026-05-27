const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const stripe    = require('stripe')(functions.config().stripe.secret_key);
const cors      = require('cors')({ origin: true });

admin.initializeApp();

const WEBHOOK_SECRET = functions.config().stripe.webhook_secret;

// =========================================
// エンドポイント 1: Checkout Session 作成
// =========================================
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
    } catch (e) {
      return res.status(401).json({ error: '認証トークンが無効です' });
    }

    const { priceId, successUrl, cancelUrl } = req.body;
    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'パラメータが不足しています' });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        locale: 'ja',
        metadata: {
          uid: decodedToken.uid,
          email: decodedToken.email || ''
        },
        customer_email: decodedToken.email,
      });

      console.log(`[Checkout] Session作成 uid=${decodedToken.uid}`);
      return res.json({ sessionId: session.id });

    } catch (err) {
      console.error('[Checkout] Session作成失敗:', err);
      return res.status(500).json({ error: '決済セッションの作成に失敗しました' });
    }
  });
});

// =========================================
// エンドポイント 2: Stripe Webhook 受信
// =========================================
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook] 署名検証失敗:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Payment Link方式: client_reference_id にUIDが入っている
    const uid = session.client_reference_id || session.metadata?.uid;

    if (uid && session.payment_status === 'paid') {
      await admin.firestore().collection('users').doc(uid).update({
        isPremium:       true,
        premiumAt:       admin.firestore.FieldValue.serverTimestamp(),
        stripeSessionId: session.id,
      });
      console.log(`[Webhook] isPremium=true uid=${uid}`);
    }
  }

  res.json({ received: true });
});
