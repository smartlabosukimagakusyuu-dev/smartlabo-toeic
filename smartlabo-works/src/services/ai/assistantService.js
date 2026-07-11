/**
 * Smart Labo Works — AI Assistant Service
 * 業務文書生成（営業メール・返信・提案書・補助金・広告）を担当する
 */

const router  = require('./router');
const prompts = require('./promptManager');

/**
 * AIアシスタントで文書を生成する
 * @param {string} type    - 'inquiry_reply' | 'sales_email' | 'proposal' | 'subsidy' | 'ad_copy' | 'minutes' | 'free'
 * @param {string} context - 生成に必要な背景・条件テキスト
 * @returns {Promise<{content: string, provider: string, processingMs: number}>}
 */
async function generate(type, context) {
  let userMessage;

  // タイプ別プロンプト選択
  switch (type) {
    case 'inquiry_reply': userMessage = prompts.assistant.inquiry_reply(context); break;
    case 'sales_email':   userMessage = prompts.assistant.sales_email(context);   break;
    case 'proposal':      userMessage = prompts.assistant.proposal(context);      break;
    case 'subsidy':       userMessage = prompts.assistant.subsidy(context);       break;
    case 'ad_copy':       userMessage = prompts.assistant.ad_copy(context);       break;
    case 'minutes':       userMessage = prompts.assistant.minutes(context);       break;
    default:              userMessage = prompts.assistant.generate(type, context);break;
  }

  const result = await router.route('assistant', userMessage);

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

module.exports = { generate };
