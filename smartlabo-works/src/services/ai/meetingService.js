/**
 * Smart Labo Works — Meeting Service
 * Version 1.0: 画面のみ（API未接続）
 * Version 1.1予定: Whisper（音声→テキスト）+ OpenAI（要約・TODO生成）
 */

// 将来の実装ポイント:
// const router  = require('./router');
// const prompts = require('./promptManager');
// const openai  = require('./openaiService');

/**
 * 音声ファイルをテキストに変換する（将来: Whisper）
 * @param {Buffer} audioBuffer - 音声データ
 * @returns {Promise<string>} テキスト
 */
async function transcribe(audioBuffer) {
  // 将来: Whisper API実装
  // const openaiClient = new OpenAI({ apiKey: config.openai.apiKey });
  // const transcription = await openaiClient.audio.transcriptions.create({
  //   file: audioBuffer,
  //   model: 'whisper-1',
  //   language: 'ja',
  // });
  // return transcription.text;
  throw new Error('音声文字起こしはVersion 1.1で実装予定です');
}

/**
 * テキストから議事録を生成する（将来: OpenAI）
 * @param {string} text - 会議テキスト
 * @param {Object} meta - { title, date, attendees, type }
 * @returns {Promise<Object>} 議事録オブジェクト
 */
async function summarize(text, meta = {}) {
  // 将来: router.route('meeting', prompts.meeting.summarize(text, meta.type))
  throw new Error('議事録AI生成はVersion 1.1で実装予定です');
}

module.exports = { transcribe, summarize };
