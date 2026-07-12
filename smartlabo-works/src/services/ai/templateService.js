/**
 * Smart Labo Works — 業種特化テンプレート Service（Template Engine）
 *
 * PromptManager（Template Loaderの窓口。実体は templates/index.js）に登録された
 * テンプレートを使ってAI Routerを呼び出す。assistantService.js（既存のtype固定switch）
 * とは独立した経路とし、既存のAI Assistant機能には一切手を加えない。
 *
 * Routerへ渡すfeatureは常に'assistant'固定。Provider選択・JobType判断はRouter側の
 * 既存ROUTE_TABLEに委ね、このServiceやRouterに業種ロジックを書かない。
 */

const router  = require('./router');
const { templates } = require('./promptManager');

/**
 * UI向けのテンプレート一覧を返す（雛形＝status:'planned'のテンプレートも含む）
 */
function listTemplates() {
  return templates.list();
}

/**
 * テンプレートIDと入力フィールドから文書を生成する
 * @param {string} templateId
 * @param {Record<string,string>} fields
 * @returns {Promise<{content:string, provider:string, processingMs:number, success:boolean, error?:string}>}
 */
async function generate(templateId, fields) {
  const tpl = templates.get(templateId);
  if (!tpl) {
    return {
      content: null, provider: null, processingMs: 0, success: false,
      error: `テンプレート "${templateId}" が見つかりません`,
    };
  }
  if (tpl.status !== 'ready') {
    return {
      content: null, provider: null, processingMs: 0, success: false,
      error: `テンプレート "${tpl.label}" は未実装（準備中）です`,
    };
  }

  const userMessage = tpl.buildUserPrompt(fields || {});
  const result = await router.route('assistant', userMessage, { systemPrompt: tpl.systemPrompt });

  if (!result.success) {
    return {
      content:      `AI接続エラー: ${result.error}`,
      provider:     result.provider,
      processingMs: result.processingMs,
      success:      false,
    };
  }

  return {
    content:      result.content,
    provider:     result.provider,
    model:        result.model,
    usage:        result.usage,
    processingMs: result.processingMs,
    success:      true,
  };
}

module.exports = { listTemplates, generate };
