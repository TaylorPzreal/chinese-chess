import { Circle, Text } from 'react-konva';
import type { PieceTheme, PieceThemeId, PieceRenderProps } from '../types/pieceTheme';

// 拟物化主题
const neumorphicTheme: PieceTheme = {
  id: 'neumorphic',
  name: '拟物化',
  description: '现代拟物化设计，立体质感',
  red: {
    baseGradient: ['#DC2626', '#B91C1C', '#991B1B'],
    borderColor: '#7F1D1D',
    highlightColor: '#EF4444',
    shadowColor: 'rgba(127, 29, 29, 0.6)',
    textColor: '#FFFFFF',
    textShadow: 'rgba(0, 0, 0, 0.5)',
  },
  black: {
    baseGradient: ['#374151', '#1F2937', '#111827'],
    borderColor: '#030712',
    highlightColor: '#4B5563',
    shadowColor: 'rgba(3, 7, 18, 0.7)',
    textColor: '#FFFFFF',
    textShadow: 'rgba(0, 0, 0, 0.8)',
  },
  renderPiece: (props: PieceRenderProps) => {
    const { radius, isSelected, colors } = props;
    const isRed = props.isRed;
    // 根据棋子大小自适应字体大小
    const fontSize = Math.round(radius * 0.9);
    const textOffset = fontSize / 2;

    return (
      <>
        {/* 选中状态的外圈光晕 */}
        {isSelected && (
          <>
            <Circle
              x={0}
              y={0}
              radius={radius + 8}
              fill="rgba(59, 130, 246, 0.2)"
              listening={false}
            />
            <Circle
              x={0}
              y={0}
              radius={radius + 6}
              stroke="#3B82F6"
              strokeWidth={3}
              fill="transparent"
              listening={false}
            />
          </>
        )}

        {/* 底部阴影层（增强立体感） */}
        <Circle
          x={0}
          y={2}
          radius={radius}
          fill={colors.shadowColor}
          opacity={0.4}
          listening={false}
        />

        {/* 主棋子体（基础色） */}
        <Circle
          x={0}
          y={0}
          radius={radius}
          fill={colors.baseGradient[1]}
          shadowColor={colors.shadowColor}
          shadowBlur={12}
          shadowOffset={{ x: 0, y: 4 }}
          shadowOpacity={0.8}
        />

        {/* 顶部亮部（模拟光照） */}
        <Circle
          x={-radius * 0.3}
          y={-radius * 0.3}
          radius={radius * 0.7}
          fill={colors.baseGradient[0]}
          opacity={0.6}
          listening={false}
        />

        {/* 底部暗部（增强立体感） */}
        <Circle
          x={radius * 0.2}
          y={radius * 0.3}
          radius={radius * 0.8}
          fill={colors.baseGradient[2]}
          opacity={0.5}
          listening={false}
        />

        {/* 顶部高光（模拟反光） */}
        <Circle
          x={-radius * 0.35}
          y={-radius * 0.35}
          radius={radius * 0.4}
          fill="rgba(255, 255, 255, 0.3)"
          opacity={isRed ? 0.4 : 0.25}
          listening={false}
        />

        {/* 内边框高光（增强边缘立体感） */}
        <Circle
          x={0}
          y={0}
          radius={radius - 1.5}
          stroke={colors.highlightColor}
          strokeWidth={1.5}
          fill="transparent"
          opacity={0.4}
          listening={false}
        />

        {/* 外边框（深色边框，增强轮廓） */}
        <Circle
          x={0}
          y={0}
          radius={radius}
          stroke={colors.borderColor}
          strokeWidth={2.5}
          fill="transparent"
          listening={false}
        />

        {/* 底部边缘阴影（增强立体感） */}
        <Circle
          x={0}
          y={radius * 0.4}
          radius={radius * 0.9}
          fill="rgba(0, 0, 0, 0.3)"
          opacity={isRed ? 0.3 : 0.5}
          listening={false}
        />

        {/* 棋子文字阴影层（增强立体感） */}
        <Text
          x={1}
          y={1}
          text={props.pieceName}
          fontSize={fontSize}
          fontStyle="bold"
          fontFamily="Arial, 'Microsoft YaHei', 'SimHei', sans-serif"
          fill="rgba(0, 0, 0, 0.5)"
          align="center"
          verticalAlign="middle"
          offsetX={textOffset}
          offsetY={textOffset}
          listening={false}
        />

        {/* 棋子文字（主文字） */}
        <Text
          x={0}
          y={0}
          text={props.pieceName}
          fontSize={fontSize}
          fontStyle="bold"
          fontFamily="Arial, 'Microsoft YaHei', 'SimHei', sans-serif"
          fill={colors.textColor}
          align="center"
          verticalAlign="middle"
          offsetX={textOffset}
          offsetY={textOffset}
          listening={false}
        />
      </>
    );
  },
};

// 传统复古主题
const classicTheme: PieceTheme = {
  id: 'classic',
  name: '传统复古',
  description: '经典中国象棋风格，古朴典雅',
  red: {
    baseGradient: ['#F5F1E8', '#F0EBDF', '#EBE5D6'], // 浅米色底座，边缘稍暗
    borderColor: '#D4C4B0', // 边缘稍暗的米色
    highlightColor: '#FAF7F0', // 浅色高光
    shadowColor: 'rgba(139, 69, 19, 0.25)', // 深棕色内部阴影
    textColor: '#8B4513', // 深棕色文字（参照图片）
    textShadow: 'rgba(0, 0, 0, 0.2)',
  },
  black: {
    baseGradient: ['#F5F1E8', '#F0EBDF', '#EBE5D6'], // 浅米色底座，边缘稍暗
    borderColor: '#D4C4B0', // 边缘稍暗的米色
    highlightColor: '#FAF7F0', // 浅色高光
    shadowColor: 'rgba(44, 44, 44, 0.25)', // 深色内部阴影
    textColor: '#5C4033', // 深棕色文字（参照图片）
    textShadow: 'rgba(0, 0, 0, 0.2)',
  },
  renderPiece: (props: PieceRenderProps) => {
    const { radius, isSelected, pieceName, colors } = props;
    // 根据棋子大小自适应字体大小
    const fontSize = Math.round(radius * 1.1);
    const textOffset = fontSize / 2;

    return (
      <>
        {/* 选中状态的外圈 */}
        {isSelected && (
          <Circle
            x={0}
            y={0}
            radius={radius + 5}
            stroke="#D97706"
            strokeWidth={3}
            fill="transparent"
            listening={false}
          />
        )}

        {/* 底部投影 - 柔和的阴影，暗示棋子略微凸起 */}
        <Circle
          x={radius * 0.2}
          y={radius * 0.3}
          radius={radius}
          fill="rgba(0, 0, 0, 0.12)"
          listening={false}
        />

        {/* 圆形棋子底座 - 浅米色正圆，边缘稍暗 */}
        <Circle
          x={0}
          y={0}
          radius={radius}
          fill={colors.baseGradient[1]}
          shadowColor="rgba(0, 0, 0, 0.08)"
          shadowBlur={3}
          shadowOffset={{ x: 0, y: 1 }}
          shadowOpacity={0.4}
        />

        {/* 边缘渐变 - 边缘比主表面稍暗，提供深度感 */}
        <Circle
          x={0}
          y={0}
          radius={radius}
          stroke={colors.baseGradient[2]}
          strokeWidth={2}
          fill="transparent"
          opacity={0.3}
          listening={false}
        />

        {/* 右下边缘内侧的内部阴影 - 柔和的阴影，营造凸起效果 */}
        <Circle
          x={radius * 0.12}
          y={radius * 0.2}
          radius={radius * 0.95}
          fill={colors.shadowColor}
          opacity={0.3}
          listening={false}
        />

        {/* 最外缘 - 极细的深色边框 */}
        <Circle
          x={0}
          y={0}
          radius={radius}
          stroke={colors.borderColor}
          strokeWidth={0.8}
          fill="transparent"
          listening={false}
        />

        {/* 内侧 - 更细的浅色高光边框 */}
        <Circle
          x={0}
          y={0}
          radius={radius - 1.2}
          stroke={colors.highlightColor}
          strokeWidth={0.6}
          fill="transparent"
          opacity={0.6}
          listening={false}
        />

        {/* 主文字 - 深棕色，清晰易读 */}
        <Text
          x={0}
          y={0}
          text={pieceName}
          fontSize={fontSize}
          fontStyle="bold"
          fontFamily="'KaiTi', '楷体', 'STKaiti', 'Microsoft YaHei', serif"
          fill={colors.textColor}
          align="center"
          verticalAlign="middle"
          offsetX={textOffset}
          offsetY={textOffset}
          listening={false}
        />
      </>
    );
  },
};

// 木质主题（根据图片还原）
const woodenTheme: PieceTheme = {
  id: 'wooden',
  name: '木质经典',
  description: '还原真实木质棋子，浅棕色底座配红色/黑色字符',
  red: {
    baseGradient: ['#E8D4B8', '#D4A574', '#C9A06A'], // 浅棕色渐变，从亮到暗
    borderColor: '#B8956A', // 稍深的棕色边框
    highlightColor: '#F0E6D2', // 浅色高光
    shadowColor: 'rgba(139, 69, 19, 0.3)', // 深棕色阴影
    textColor: '#DC2626', // 鲜艳的红色字符
    textShadow: 'rgba(0, 0, 0, 0.2)',
  },
  black: {
    baseGradient: ['#E8D4B8', '#D4A574', '#C9A06A'], // 浅棕色渐变，从亮到暗
    borderColor: '#B8956A', // 稍深的棕色边框
    highlightColor: '#F0E6D2', // 浅色高光
    shadowColor: 'rgba(44, 44, 44, 0.3)', // 深色阴影
    textColor: '#1F2937', // 深色字符
    textShadow: 'rgba(0, 0, 0, 0.2)',
  },
  renderPiece: (props: PieceRenderProps) => {
    const { radius, isSelected, pieceName, colors, isRed } = props;
    // 根据棋子大小自适应字体大小
    const fontSize = Math.round(radius * 1.0);
    const textOffset = fontSize / 2;

    return (
      <>
        {/* 选中状态的外圈 */}
        {isSelected && (
          <Circle
            x={0}
            y={0}
            radius={radius + 6}
            stroke="#3B82F6"
            strokeWidth={3}
            opacity={0.5}
            fill="transparent"
            listening={false}
          />
        )}

        {/* 底部柔和阴影 */}
        <Circle
          x={radius * 0.15}
          y={radius * 0.25}
          radius={radius}
          fill="rgba(0, 0, 0, 0.15)"
          listening={false}
        />

        {/* 主棋子体 - 浅棕色圆形底座 */}
        <Circle
          x={0}
          y={0}
          radius={radius}
          fill={colors.baseGradient[1]}
          shadowColor="rgba(0, 0, 0, 0.1)"
          shadowBlur={4}
          shadowOffset={{ x: 0, y: 2 }}
          shadowOpacity={0.5}
        />

        {/* 顶部轻微高光 - 模拟光照效果 */}
        <Circle
          x={-radius * 0.25}
          y={-radius * 0.25}
          radius={radius * 0.6}
          fill={colors.highlightColor}
          opacity={0.4}
          listening={false}
        />

        {/* 边缘渐变 - 边缘稍暗 */}
        <Circle
          x={0}
          y={0}
          radius={radius}
          stroke={colors.baseGradient[2]}
          strokeWidth={1.5}
          fill="transparent"
          opacity={0.4}
          listening={false}
        />

        {/* 外边框 - 稍深的棕色 */}
        <Circle
          x={0}
          y={0}
          radius={radius}
          stroke={colors.borderColor}
          strokeWidth={1.2}
          fill="transparent"
          listening={false}
        />

        {/* 红色方：字符周围的红色圆形边框 */}
        {isRed && (
          <Circle
            x={0}
            y={0}
            radius={radius * 0.75}
            stroke="#DC2626"
            strokeWidth={1.5}
            fill="transparent"
            listening={false}
          />
        )}

        {/* 黑色方：字符周围的深色圆形边框 */}
        {!isRed && (
          <Circle
            x={0}
            y={0}
            radius={radius * 0.75}
            stroke="#1F2937"
            strokeWidth={1.5}
            fill="transparent"
            listening={false}
          />
        )}

        {/* 文字阴影层 */}
        <Text
          x={1}
          y={1}
          text={pieceName}
          fontSize={fontSize}
          fontStyle="bold"
          fontFamily="'KaiTi', '楷体', 'STKaiti', 'Microsoft YaHei', serif"
          fill="rgba(0, 0, 0, 0.3)"
          align="center"
          verticalAlign="middle"
          offsetX={textOffset}
          offsetY={textOffset}
          listening={false}
        />

        {/* 主文字 */}
        <Text
          x={0}
          y={0}
          text={pieceName}
          fontSize={fontSize}
          fontStyle="bold"
          fontFamily="'LiSu', '隶书', 'KaiTi', '楷体', 'STKaiti', 'Microsoft YaHei', serif"
          fill={colors.textColor}
          align="center"
          verticalAlign="middle"
          offsetX={textOffset}
          offsetY={textOffset}
          listening={false}
        />
      </>
    );
  },
};

// 石质主题（仿石盘棋子）
const stoneTheme: PieceTheme = {
  id: 'stone',
  name: '石盘棋子',
  description: '仿围棋石盘质感，冷色石质棋子',
  red: {
    baseGradient: ['#F87171', '#DC2626', '#991B1B'], // 略带石纹感的红色
    borderColor: '#7F1D1D',
    highlightColor: '#FCA5A5',
    shadowColor: 'rgba(127, 29, 29, 0.55)',
    textColor: '#F9FAFB',
    textShadow: 'rgba(0, 0, 0, 0.45)',
  },
  black: {
    baseGradient: ['#E5E7EB', '#9CA3AF', '#4B5563'], // 冷灰色石质渐变
    borderColor: '#111827',
    highlightColor: '#F9FAFB',
    shadowColor: 'rgba(15, 23, 42, 0.65)',
    textColor: '#111827',
    textShadow: 'rgba(0, 0, 0, 0.6)',
  },
  renderPiece: (props: PieceRenderProps) => {
    const { radius, isSelected, colors, pieceName, isRed } = props;
    // 石质主题：字体略大一些，突出“刻字”效果
    const fontSize = Math.round(radius * 1.0);
    const textOffset = fontSize / 2;

    return (
      <>
        {/* 选中状态的柔和外圈光晕 */}
        {isSelected && (
          <>
            <Circle
              x={0}
              y={0}
              radius={radius + 7}
              fill="rgba(59, 130, 246, 0.18)"
              listening={false}
            />
            <Circle
              x={0}
              y={0}
              radius={radius + 5}
              stroke="#3B82F6"
              strokeWidth={2.5}
              opacity={0.9}
              fill="transparent"
              listening={false}
            />
          </>
        )}

        {/* 底部投影，模拟石子压在棋盘上的效果 */}
        <Circle
          x={radius * 0.1}
          y={radius * 0.28}
          radius={radius}
          fill={colors.shadowColor}
          opacity={0.4}
          listening={false}
        />

        {/* 主棋子体：略扁的石质圆盘 */}
        <Circle
          x={0}
          y={0}
          radius={radius}
          fill={colors.baseGradient[1]}
          shadowColor={colors.shadowColor}
          shadowBlur={10}
          shadowOffset={{ x: 0, y: 3 }}
          shadowOpacity={0.9}
        />

        {/* 顶部高光，模拟石面反光 */}
        <Circle
          x={-radius * 0.25}
          y={-radius * 0.3}
          radius={radius * 0.75}
          fill={colors.highlightColor}
          opacity={isRed ? 0.55 : 0.4}
          listening={false}
        />

        {/* 底部暗部，加深石头厚重感 */}
        <Circle
          x={radius * 0.2}
          y={radius * 0.3}
          radius={radius * 0.9}
          fill={colors.baseGradient[2]}
          opacity={0.5}
          listening={false}
        />

        {/* 内部柔和高光圈，增强立体感 */}
        <Circle
          x={0}
          y={0}
          radius={radius - 2}
          stroke={colors.highlightColor}
          strokeWidth={1.4}
          opacity={0.4}
          fill="transparent"
          listening={false}
        />

        {/* 外轮廓：深色描边，类似石子边缘 */}
        <Circle
          x={0}
          y={0}
          radius={radius}
          stroke={colors.borderColor}
          strokeWidth={2}
          opacity={0.95}
          fill="transparent"
          listening={false}
        />

        {/* 文字阴影层：上方/左侧的暗部，模拟凹陷内部的阴影 */}
        <Text
          x={-1}
          y={-1}
          text={pieceName}
          fontSize={fontSize}
          fontStyle="bold"
          fontFamily="'LiSu', '隶书', 'KaiTi', '楷体', 'STKaiti', 'Microsoft YaHei', serif"
          fill={isRed ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.6)'}
          align="center"
          verticalAlign="middle"
          offsetX={textOffset}
          offsetY={textOffset}
          listening={false}
        />

        {/* 文字高光层：右下方的亮边，增强“雕刻”立体感 */}
        <Text
          x={1.2}
          y={1.2}
          text={pieceName}
          fontSize={fontSize}
          fontStyle="bold"
          fontFamily="'LiSu', '隶书', 'KaiTi', '楷体', 'STKaiti', 'Microsoft YaHei', serif"
          fill={isRed ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.4)'}
          align="center"
          verticalAlign="middle"
          offsetX={textOffset}
          offsetY={textOffset}
          listening={false}
        />

        {/* 主文字：中间层字符，颜色略收敛，整体看起来嵌入石面 */}
        <Text
          x={0}
          y={0}
          text={pieceName}
          fontSize={fontSize}
          fontStyle="bold"
          fontFamily="'LiSu', '隶书', 'KaiTi', '楷体', 'STKaiti', 'Microsoft YaHei', serif"
          fill={isRed ? '#FEE2E2' : colors.textColor}
          align="center"
          verticalAlign="middle"
          offsetX={textOffset}
          offsetY={textOffset}
          listening={false}
        />
      </>
    );
  },
};

// 所有主题
export const pieceThemes: Record<PieceThemeId, PieceTheme> = {
  neumorphic: neumorphicTheme,
  classic: classicTheme,
  wooden: woodenTheme,
  stone: stoneTheme,
};

// 获取主题
export function getPieceTheme(themeId: PieceThemeId): PieceTheme {
  return pieceThemes[themeId] || pieceThemes.neumorphic;
}

// 获取所有主题列表
export function getAllThemes(): PieceTheme[] {
  return Object.values(pieceThemes);
}

