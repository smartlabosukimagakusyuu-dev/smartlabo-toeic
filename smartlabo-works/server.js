/**
 * Smart Labo Works — Server
 * 静的ファイル配信 + AI APIルーティング
 */

const http        = require('http');
const fs          = require('fs');
const path        = require('path');
const config      = require('./src/config/env');
const authService = require('./src/services/auth/authService');

const PORT = config.app.port || 3006;
const ROOT = __dirname;
const SESSION_COOKIE = 'slw_session';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff2':'font/woff2',
};

// AIサービス（遅延ロード）
let brainService, assistantService, router, openaiService;
function loadAIServices() {
  if (!brainService) {
    brainService     = require('./src/services/ai/companyBrainService');
    assistantService = require('./src/services/ai/assistantService');
    router           = require('./src/services/ai/router');
    openaiService    = require('./src/services/ai/openaiService');
  }
}

// ==========================================
// AIログ（インメモリ、将来DB化）
// ==========================================
const aiLogs = [];
function addLog(entry) {
  aiLogs.unshift({
    id:          Date.now(),
    datetime:    new Date().toLocaleString('ja-JP'),
    ...entry,
  });
  if (aiLogs.length > 200) aiLogs.pop();
}

// ==========================================
// JSONレスポンスヘルパー
// ==========================================
function sendJSON(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type':                'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type',
  });
  res.end(body);
}

// ==========================================
// リクエストボディを読む
// ==========================================
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch (e) { reject(new Error('Invalid JSON')); }
    });
  });
}

// ==========================================
// Cookie / セッションヘルパー
// ==========================================
function parseCookies(req) {
  const header = req.headers.cookie || '';
  const cookies = {};
  header.split(';').forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    if (key) cookies[key] = decodeURIComponent(val);
  });
  return cookies;
}

function getSessionFromRequest(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  return token ? authService.getSession(token) : null;
}

function setSessionCookie(res, token) {
  const maxAgeSec = 8 * 60 * 60; // authService.SESSION_TTL_MSと合わせて8時間
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAgeSec}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
}

// ==========================================
// APIハンドラー
// ==========================================
async function handleAPI(req, res, pathname) {
  loadAIServices();

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // ---- POST /api/auth/login ----
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const { companyId, email, password } = await readBody(req);
    if (!companyId || !email || !password) {
      sendJSON(res, 400, { error: 'companyId、email、password は必須です' });
      return;
    }
    if (!authService.verifyCredentials(companyId, email, password)) {
      sendJSON(res, 401, { error: 'CompanyID、メールアドレス、またはパスワードが正しくありません' });
      return;
    }
    const token = authService.createSession(companyId, email);
    setSessionCookie(res, token);
    sendJSON(res, 200, { success: true, companyId, email });
    return;
  }

  // ---- POST /api/auth/logout ----
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const token = parseCookies(req)[SESSION_COOKIE];
    authService.destroySession(token);
    clearSessionCookie(res);
    sendJSON(res, 200, { success: true });
    return;
  }

  // ---- GET /api/auth/me ----
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const session = getSessionFromRequest(req);
    if (!session) { sendJSON(res, 401, { error: '未ログインです' }); return; }
    sendJSON(res, 200, { companyId: session.companyId, email: session.email });
    return;
  }

  // ---- GET /api/ai/status ----
  if (pathname === '/api/ai/status' && req.method === 'GET') {
    const routerStatus = router.getRouterStatus();
    const models       = openaiService.getAvailableModels();
    sendJSON(res, 200, {
      openai: {
        enabled: config.openai.enabled,
        model:   config.openai.model,
        hasKey:  config.openai.enabled,
      },
      claude:  { enabled: config.claude.enabled },
      gemini:  { enabled: config.gemini.enabled },
      mode:    config.app.aiMode,
      router:  routerStatus,
      models,
      version: '1.0.0',
    });
    return;
  }

  // ---- POST /api/ai/test ----
  if (pathname === '/api/ai/test' && req.method === 'POST') {
    const start  = Date.now();
    const result = await openaiService.testConnection();
    const ms     = Date.now() - start;
    addLog({ feature: '接続テスト', provider: 'openai', processingMs: ms, success: result.ok, error: result.ok ? null : result.message });
    sendJSON(res, result.ok ? 200 : 500, { ...result, processingMs: ms });
    return;
  }

  // ---- POST /api/ai/brain ----
  if (pathname === '/api/ai/brain' && req.method === 'POST') {
    const { question, brainData = [] } = await readBody(req);
    if (!question) { sendJSON(res, 400, { error: '質問が空です' }); return; }

    const result = await brainService.query(question, brainData);
    addLog({ feature: 'Company Brain', provider: result.provider || 'openai', processingMs: result.processingMs, success: result.success, error: result.success ? null : result.answer });
    sendJSON(res, result.success ? 200 : 500, result);
    return;
  }

  // ---- POST /api/ai/assistant ----
  if (pathname === '/api/ai/assistant' && req.method === 'POST') {
    const { type, context } = await readBody(req);
    if (!type || !context) { sendJSON(res, 400, { error: 'type と context は必須です' }); return; }

    const result = await assistantService.generate(type, context);
    addLog({ feature: `AI Assistant (${type})`, provider: result.provider || 'openai', processingMs: result.processingMs, success: result.success, error: result.success ? null : result.content });
    sendJSON(res, result.success ? 200 : 500, result);
    return;
  }

  // ---- GET /api/ai/logs ----
  if (pathname === '/api/ai/logs' && req.method === 'GET') {
    sendJSON(res, 200, { logs: aiLogs, total: aiLogs.length });
    return;
  }

  // ---- POST /api/ai/innovation-review ----
  if (pathname === '/api/ai/innovation-review' && req.method === 'POST') {
    const { title, body, effect, cat } = await readBody(req);
    if (!title || !body) { sendJSON(res, 400, { error: 'title と body は必須です' }); return; }

    const prompts = require('./src/services/ai/promptManager');
    const userMsg = prompts.innovationReview.query(title, body, effect, cat);
    const result  = await router.route('innovation', userMsg, { systemPrompt: prompts.innovationReview.system });

    let review = null;
    if (result.success) {
      try {
        const cleaned = result.content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        review = JSON.parse(cleaned);
      } catch(e) {
        review = { merit: result.content, demerit:'', risk:'', revenue:'', priority:'中', suggestion:'' };
      }
    }
    addLog({ feature: 'Innovation Review', provider: result.provider||'openai', processingMs: result.processingMs, success: result.success });
    sendJSON(res, result.success ? 200 : 500, { review, success: result.success, error: result.error });
    return;
  }

  // ---- POST /api/ai/workorder-gen ----
  if (pathname === '/api/ai/workorder-gen' && req.method === 'POST') {
    const { title, body, effect } = await readBody(req);
    if (!title) { sendJSON(res, 400, { error: 'title は必須です' }); return; }

    const prompts = require('./src/services/ai/promptManager');
    const userMsg = prompts.workOrderGen.query(title, body, effect);
    const result  = await router.route('projectBible', userMsg, { systemPrompt: prompts.workOrderGen.system });

    let workOrder = null;
    if (result.success) {
      try {
        const cleaned = result.content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        workOrder = JSON.parse(cleaned);
      } catch(e) {
        workOrder = { todos: [result.content], assignee: '小川 昌利', deadline: '', claudePrompt: '' };
      }
    }
    addLog({ feature: 'Work Order Gen', provider: result.provider||'openai', processingMs: result.processingMs, success: result.success });
    sendJSON(res, result.success ? 200 : 500, { workOrder, success: result.success, error: result.error });
    return;
  }

  sendJSON(res, 404, { error: `API not found: ${pathname}` });
}

// ==========================================
// 静的ファイルハンドラー
// ==========================================
function handleStatic(req, res, pathname) {
  const filePath = path.join(ROOT, pathname === '/' ? '/app.html' : pathname);
  const ext      = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    }
  });
}

// ==========================================
// メインサーバー
// ==========================================
const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://localhost:${PORT}`).pathname;

  if (pathname.startsWith('/api/')) {
    try {
      await handleAPI(req, res, pathname);
    } catch (e) {
      sendJSON(res, 500, { error: e.message });
    }
  } else {
    handleStatic(req, res, pathname);
  }
});

server.listen(PORT, () => {
  console.log(`Smart Labo Works server running at http://localhost:${PORT}`);
  console.log(`OpenAI: ${config.openai.enabled ? 'ENABLED (' + config.openai.model + ')' : 'APIキー未設定'}`);
});
