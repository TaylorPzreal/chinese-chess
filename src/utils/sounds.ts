// 音效工具函数
// 使用Web Audio API生成简单的音效

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// 生成音调
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // 如果音频上下文不可用，静默失败
    console.warn('无法播放音效:', e);
  }
}

// 播放移动音效
export function playMoveSound(): void {
  // 短促的上升音调
  playTone(400, 0.1, 'sine');
  setTimeout(() => {
    playTone(500, 0.1, 'sine');
  }, 50);
}

// 播放吃子音效
export function playCaptureSound(): void {
  // 更强烈的音效
  playTone(300, 0.15, 'square');
  setTimeout(() => {
    playTone(200, 0.15, 'square');
  }, 100);
}

// 播放错误音效
export function playErrorSound(): void {
  playTone(200, 0.2, 'sawtooth');
}

// 播放选择音效
export function playSelectSound(): void {
  playTone(600, 0.05, 'sine');
}

// 播放将军音效
export function playCheckSound(): void {
  // 具有紧张感的上行音阶
  playTone(700, 0.15, 'triangle');
  setTimeout(() => {
    playTone(900, 0.18, 'triangle');
  }, 90);
}

// 获取中文语音
function getChineseVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) {
    return null;
  }
  
  const voices = window.speechSynthesis.getVoices();
  
  // 优先查找中文语音（按优先级）
  const chineseVoices = voices.filter(voice => 
    voice.lang.includes('zh') || 
    voice.lang.includes('CN') || 
    voice.name.toLowerCase().includes('chinese')
  );
  
  // 优先选择简体中文
  const simplifiedChinese = chineseVoices.find(voice => 
    voice.lang.includes('zh-CN') || voice.lang.includes('zh-Hans')
  );
  
  if (simplifiedChinese) {
    return simplifiedChinese;
  }
  
  // 如果没有简体中文，使用任何中文语音
  if (chineseVoices.length > 0) {
    return chineseVoices[0];
  }
  
  return null;
}

// 播放"将军"语音
export function playCheckVoice(): void {
  try {
    if ('speechSynthesis' in window) {
      // 取消之前的语音，避免重复播放
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance('将军');
      
      // 尝试使用中文语音
      const chineseVoice = getChineseVoice();
      
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      } else {
        // 如果没有中文语音，设置语言为中文，让浏览器自动选择
        utterance.lang = 'zh-CN';
      }
      
      // 设置语音参数
      utterance.rate = 1.0; // 语速
      utterance.pitch = 1.0; // 音调
      utterance.volume = 1.0; // 音量
      
      // 播放语音
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    // 如果语音合成不可用，静默失败
    console.warn('无法播放语音:', e);
  }
}

// 播放绝杀音效
export function playCheckmateSound(): void {
  // 更强烈的音效，表示游戏结束
  playTone(400, 0.2, 'square');
  setTimeout(() => {
    playTone(300, 0.2, 'square');
  }, 150);
  setTimeout(() => {
    playTone(200, 0.3, 'square');
  }, 300);
}

// 播放"绝杀"语音
export function playCheckmateVoice(): void {
  try {
    if ('speechSynthesis' in window) {
      // 取消之前的语音，避免重复播放
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance('绝杀');
      
      // 尝试使用中文语音
      const chineseVoice = getChineseVoice();
      
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      } else {
        // 如果没有中文语音，设置语言为中文，让浏览器自动选择
        utterance.lang = 'zh-CN';
      }
      
      // 设置语音参数（绝杀时稍微慢一点，更有气势）
      utterance.rate = 0.9; // 语速稍慢
      utterance.pitch = 1.0; // 音调
      utterance.volume = 1.0; // 音量
      
      // 播放语音
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    // 如果语音合成不可用，静默失败
    console.warn('无法播放语音:', e);
  }
}

// 初始化语音（某些浏览器需要用户交互后才能使用）
export function initSpeechSynthesis(): void {
  if ('speechSynthesis' in window) {
    // 预加载语音列表（某些浏览器需要）
    window.speechSynthesis.getVoices();
    
    // 监听语音列表变化（某些浏览器异步加载）
    // 当语音列表加载完成后，再次获取以确保可用
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        // 语音列表已加载，可以正常使用
        window.speechSynthesis.getVoices();
      };
    }
  }
}

