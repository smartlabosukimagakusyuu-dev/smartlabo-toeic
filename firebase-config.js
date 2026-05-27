/**
 * firebase-config.js
 * ===================================================
 * Firebase プロジェクト設定
 *
 * 【設定方法】
 * 1. https://console.firebase.google.com にアクセス
 * 2. 「プロジェクトを追加」→ プロジェクト名を入力
 * 3. プロジェクト設定 → 「マイアプリ」→ ウェブ (</>)
 * 4. 表示される設定をこのファイルに貼り付ける
 * ===================================================
 */

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// Firebase 初期化
firebase.initializeApp(firebaseConfig);
