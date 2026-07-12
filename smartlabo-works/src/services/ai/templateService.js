/**
 * Smart Labo Works — 業種特化テンプレート Service
 *
 * templates/ レジストリに登録されたテンプレートを使ってAIを呼び出す。
 * assistantService.js（既存のtype固定switch）とは独立した経路とし、
 * 既存のAI Assistant機能には一切手を加えない。
 */

const router    = require('./router');
const templates = require('./templates');

/**
 * UI向けのテンプレート一覧を返す
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
