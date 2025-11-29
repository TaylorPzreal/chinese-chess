import type { BoardTheme, BoardThemeId } from '../types/boardTheme';

// 纸质经典棋盘（当前默认的米黄色纸面）
const paperBoardTheme: BoardTheme = {
  id: 'paper',
  name: '纸质棋盘',
  description: '传统米黄色纸面棋盘，温暖复古',
  backgroundType: 'solid',
  backgroundColor: '#FEF3C7',
  lineColor: '#8B4513',
  labelColor: '#92400E',
  labelOpacity: 0.4,
  numberOpacity: 0.7,
};

// 黑色石板棋盘（参考图片）
const stoneBoardTheme: BoardTheme = {
  id: 'stone',
  name: '石板棋盘',
  description: '深色石板棋盘，白色网格与刻字',
  backgroundType: 'gradient',
  gradientStops: [
    { offset: 0, color: '#111827' }, // 顶部略亮的深灰
    { offset: 0.5, color: '#020617' }, // 中间接近黑色
    { offset: 1, color: '#020617' }, // 底部接近黑色
  ],
  lineColor: '#E5E7EB',
  labelColor: '#F9FAFB',
  labelOpacity: 0.9,
  numberOpacity: 0.9,
};

// 大理石棋盘（使用纹理图片）
const marbleBoardTheme: BoardTheme = {
  id: 'marble',
  name: '大理石棋盘',
  description: '淡绿色大理石纹理棋盘，清冷雅致',
  backgroundType: 'texture',
  // 纹理模式下 backgroundColor 作为加载前的占位色
  backgroundColor: '#E0F2F1',
  lineColor: '#0F766E', // 偏深的青绿线条
  labelColor: '#064E3B', // 深绿文字
  labelOpacity: 0.85,
  numberOpacity: 0.8,
};

export const boardThemes: Record<BoardThemeId, BoardTheme> = {
  paper: paperBoardTheme,
  stone: stoneBoardTheme,
  marble: marbleBoardTheme,
};

export function getBoardTheme(id: BoardThemeId): BoardTheme {
  return boardThemes[id] || boardThemes.paper;
}

export function getAllBoardThemes(): BoardTheme[] {
  return Object.values(boardThemes);
}


