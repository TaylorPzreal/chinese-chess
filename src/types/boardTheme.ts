// 棋盘主题类型定义

export type BoardThemeId = 'paper' | 'stone' | 'marble';

export interface BoardThemeGradientStop {
  offset: number; // 0 - 1
  color: string;
}

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  description: string;
  // 背景配置：纯色、渐变或纹理
  backgroundType: 'solid' | 'gradient' | 'texture';
  backgroundColor?: string;
  gradientStops?: BoardThemeGradientStop[];
  // 棋盘线条颜色（网格线 + 九宫格）
  lineColor: string;
  // “楚河汉界”与数字标记的颜色与透明度
  labelColor: string;
  labelOpacity: number;
  numberOpacity: number;
}


