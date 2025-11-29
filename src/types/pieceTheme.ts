// 棋子主题类型定义

export type PieceThemeId = 'neumorphic' | 'classic' | 'wooden' | 'stone';

export interface PieceThemeColors {
  // 基础渐变颜色（从亮到暗）
  baseGradient: [string, string, string];
  // 边框颜色
  borderColor: string;
  // 高光颜色
  highlightColor: string;
  // 阴影颜色
  shadowColor: string;
  // 文字颜色
  textColor: string;
  // 文字阴影颜色
  textShadow: string;
}

export interface PieceTheme {
  id: PieceThemeId;
  name: string;
  description: string;
  red: PieceThemeColors;
  black: PieceThemeColors;
  // 渲染函数，返回React Konva组件
  renderPiece: (props: PieceRenderProps) => React.ReactNode;
}

export interface PieceRenderProps {
  radius: number;
  isRed: boolean;
  pieceName: string;
  isSelected: boolean;
  isDragging: boolean;
  colors: PieceThemeColors;
}

