import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

interface EffectOverlayProps {
  width: number;
  height: number;
  effectType: 'check' | 'checkmate' | null;
  onComplete?: () => void;
}

// 缓动函数
const easeOutElastic = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

export default function EffectOverlay({
  width,
  height,
  effectType,
  onComplete,
}: EffectOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [isAppReady, setIsAppReady] = useState<boolean>(false);
  const textRef = useRef<PIXI.Text | null>(null);
  const glowRef = useRef<PIXI.Graphics | null>(null);
  const shockwaveRef = useRef<PIXI.Graphics | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const centerX = width / 2;
  const centerY = height / 2;

  // 绘制光晕效果
  const drawGlow = (progress: number, color: number, container: PIXI.Container) => {
    if (!glowRef.current) {
      const glow = new PIXI.Graphics();
      container.addChild(glow);
      glowRef.current = glow;
    }
    
    const glow = glowRef.current;
    glow.clear();
    
    // 多层光晕
    const layers = 3;
    for (let i = 0; i < layers; i++) {
      const alpha = (1 - progress) * (0.3 - i * 0.1) * (1 - i * 0.2);
      const radius = 100 + i * 30 + progress * 50;
      
      glow.beginFill(color, alpha);
      glow.drawCircle(centerX, centerY, radius);
      glow.endFill();
    }
  };

  // 绘制冲击波
  const drawShockwave = (progress: number, color: number, container: PIXI.Container) => {
    if (!shockwaveRef.current) {
      const shockwave = new PIXI.Graphics();
      container.addChild(shockwave);
      shockwaveRef.current = shockwave;
    }
    
    const shockwave = shockwaveRef.current;
    shockwave.clear();
    
    if (progress < 0.4) {
      const t = progress / 0.4;
      const radius = 50 + t * 200;
      const alpha = (1 - t) * 0.6;
      
      shockwave.lineStyle(4, color, alpha);
      shockwave.drawCircle(centerX, centerY, radius);
    }
  };

  // 初始化 PixiJS 应用
  useEffect(() => {
    if (!containerRef.current) return;

    const app = new PIXI.Application();
    
    app.init({
      width,
      height,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
    }).then(() => {
      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas);
        app.canvas.style.position = 'absolute';
        app.canvas.style.top = '0';
        app.canvas.style.left = '0';
        app.canvas.style.pointerEvents = 'none';
        app.canvas.style.zIndex = '10';
        
        appRef.current = app;
        setIsAppReady(true);
      }
    });

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
        setIsAppReady(false);
      }
    };
  }, [width, height]);

  // 初始化动效
  useEffect(() => {
    // 如果没有动效类型，清理并返回
    if (!effectType) {
      // 清理
      if (textRef.current && appRef.current) {
        appRef.current.stage.removeChild(textRef.current);
        textRef.current.destroy();
        textRef.current = null;
      }
      if (glowRef.current && appRef.current) {
        appRef.current.stage.removeChild(glowRef.current);
        glowRef.current.destroy();
        glowRef.current = null;
      }
      if (shockwaveRef.current && appRef.current) {
        appRef.current.stage.removeChild(shockwaveRef.current);
        shockwaveRef.current.destroy();
        shockwaveRef.current = null;
      }
      return;
    }

    // 等待应用初始化完成
    if (!isAppReady || !appRef.current) {
      return;
    }

    const app = appRef.current;
    const container = app.stage;
    
    startTimeRef.current = Date.now();

    // 创建文字 - 使用渐变和发光效果
    const text = effectType === 'check' ? '将军！' : '绝杀！';
    const fontSize = effectType === 'check' ? 90 : 110;
    const textColor = effectType === 'check' ? 0xff3333 : 0xffd700;
    const glowColor = effectType === 'check' ? 0xff6666 : 0xffff99;

    const textStyle = new PIXI.TextStyle({
      fontSize,
      fontFamily: "'KaiTi', '楷体', 'STKaiti', serif",
      fontWeight: 'bold',
      fill: textColor,
      stroke: { color: 0x000000, width: 6 },
      dropShadow: {
        color: glowColor,
        blur: 20,
        angle: Math.PI / 4,
        distance: 8,
        alpha: 0.8,
      },
    });

    const textSprite = new PIXI.Text({
      text,
      style: textStyle,
    });
    textSprite.anchor.set(0.5);
    textSprite.x = centerX;
    textSprite.y = centerY;
    textSprite.scale.set(0);
    textSprite.alpha = 0;
    container.addChild(textSprite);
    textRef.current = textSprite;

    // 动画循环
    const animate = () => {
      if (!appRef.current || !textRef.current) {
        animationRef.current = undefined;
        return;
      }

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const duration = effectType === 'check' ? 2.5 : 3.5;

      if (elapsed > duration) {
        if (onComplete) {
          onComplete();
        }
        // 清理
        if (textRef.current && appRef.current) {
          appRef.current.stage.removeChild(textRef.current);
          textRef.current.destroy();
          textRef.current = null;
        }
        if (glowRef.current && appRef.current) {
          appRef.current.stage.removeChild(glowRef.current);
          glowRef.current.destroy();
          glowRef.current = null;
        }
        if (shockwaveRef.current && appRef.current) {
          appRef.current.stage.removeChild(shockwaveRef.current);
          shockwaveRef.current.destroy();
          shockwaveRef.current = null;
        }
        animationRef.current = undefined;
        return;
      }

      // 文字动画 - 使用更流畅的缓动函数
      const progress = elapsed / duration;
      const textSprite = textRef.current;
      if (!textSprite) {
        animationRef.current = undefined;
        return;
      }
      
      // 0-0.15: 快速弹出（弹性效果）
      if (progress < 0.15) {
        const t = progress / 0.15;
        const eased = easeOutElastic(t);
        textSprite.scale.set(eased * 1.3);
        textSprite.alpha = t;
      }
      // 0.15-0.25: 回弹
      else if (progress < 0.25) {
        const t = (progress - 0.15) / 0.1;
        const eased = easeOutCubic(t);
        textSprite.scale.set(1.3 - eased * 0.3); // 1.3 -> 1.0
        textSprite.alpha = 1;
      }
      // 0.25-0.7: 轻微抖动和发光
      else if (progress < 0.7) {
        const t = (progress - 0.25) / 0.45;
        const shake = Math.sin(t * Math.PI * 6) * 0.02;
        const pulse = 1 + Math.sin(t * Math.PI * 4) * 0.05;
        textSprite.rotation = shake;
        textSprite.scale.set(pulse);
        textSprite.alpha = 1;
        
        // 发光效果
        const glowIntensity = 0.5 + Math.sin(t * Math.PI * 4) * 0.3;
        textSprite.style.dropShadow = {
          color: glowColor,
          blur: 20 + glowIntensity * 10,
          angle: Math.PI / 4,
          distance: 8,
          alpha: 0.6 + glowIntensity * 0.4,
        };
      }
      // 0.7-1.0: 渐隐
      else {
        const t = (progress - 0.7) / 0.3;
        const eased = easeInOutQuad(t);
        textSprite.alpha = 1 - eased;
        textSprite.scale.set(1.0 + eased * 0.1); // 稍微放大后消失
      }

      // 绘制光晕和冲击波
      if (progress < 0.3) {
        drawGlow(progress / 0.3, glowColor, container);
        drawShockwave(progress / 0.3, textColor, container);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [effectType, centerX, centerY, onComplete, isAppReady]);

  if (!effectType) {
    return null;
  }

  return <div ref={containerRef} style={{ zIndex: 10, position: 'absolute', top: 0, left: 0, width, height, pointerEvents: 'none' }} />;
}
