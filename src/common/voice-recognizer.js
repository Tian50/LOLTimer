// 语音识别封装模块（仅 APP-PLUS 有效）
// 使用 plus.speech.startRecognize，将语音识别结果回调给业务层

import { parseSummonerCommand } from './voice-summoner-parser.js';

function isSupported() {
  // #ifdef APP-PLUS
  return typeof plus !== 'undefined' && !!plus.speech;
  // #endif

  // #ifndef APP-PLUS
  return false;
  // #endif
}

function startRecognize(onResult, onError, options = {}) {
  if (typeof onResult !== 'function') {
    console.warn('[voice-recognizer] onResult 必须是函数');
    return;
  }

  if (!isSupported()) {
    const msg = '当前环境不支持语音识别（仅 App-Plus 支持 plus.speech）';
    console.warn('[voice-recognizer]', msg);
    if (typeof onError === 'function') {
      onError(msg);
    }
    return;
  }

  const {
    lang = 'zh-cn',
    timeout = 60000
  } = options;

  // #ifdef APP-PLUS
  const opts = {
    // 指定使用 manifest 中已配置的百度语音识别引擎
    engine: 'baidu',
    lang,
    timeout
  };

  plus.speech.startRecognize(
    opts,
    function (res) {
      const text = Array.isArray(res) ? res.join('') : String(res || '');
      const command = parseSummonerCommand(text);
      onResult(text, command);
    },
    function (err) {
      console.error('[voice-recognizer] 识别失败:', err);
      if (typeof onError === 'function') {
        let msg = '语音识别失败';
        if (err && err.message) {
          msg = err.message;
        }
        // 科大讯飞等云引擎鉴权失败时常见错误码：4004/-3004
        if (err && (err.code === 4004 || err.code === -3004)) {
          msg = '语音服务未配置或鉴权失败，请在 manifest.json 中配置语音识别 SDK';
        }
        onError(msg);
      }
    }
  );
  // #endif
}

function stopRecognize() {
  if (!isSupported()) return;

  // #ifdef APP-PLUS
  try {
    plus.speech.stopRecognize();
  } catch (e) {
    console.warn('[voice-recognizer] stopRecognize 调用异常:', e);
  }
  // #endif
}

export default {
  isSupported,
  startRecognize,
  stopRecognize
};

