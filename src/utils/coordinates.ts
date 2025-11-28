import type { Position } from '../types/chess';

// 棋盘尺寸常量
export const BOARD_COLS = 9; // 9列
export const BOARD_ROWS = 10; // 10行

// 棋盘比例
export const BOARD_ASPECT_RATIO = BOARD_COLS / BOARD_ROWS; // 9/10

// 棋子半径
export const PIECE_RADIUS = 24;

// 棋盘边距（确保边缘棋子完全可见）
export const BOARD_PADDING = PIECE_RADIUS + 4;

/**
 * 将屏幕坐标转换为棋盘坐标
 * @param screenX 屏幕X坐标
 * @param screenY 屏幕Y坐标
 * @param stageWidth Stage宽度
 * @param stageHeight Stage高度
 * @returns 棋盘坐标，如果超出范围返回null
 */
export function screenToBoard(
  screenX: number,
  screenY: number,
  stageWidth: number,
  stageHeight: number
): Position | null {
  const area = getBoardArea(stageWidth, stageHeight);
  
  // 将屏幕坐标转换为相对于棋盘区域的坐标
  const relativeX = screenX - area.boardX;
  const relativeY = screenY - area.boardY;
  
  // 计算最近的交叉点
  const x = Math.round(relativeX / area.cellWidth);
  const y = Math.round(relativeY / area.cellHeight);

  // 检查是否在有效范围内
  if (x >= 0 && x < BOARD_COLS && y >= 0 && y < BOARD_ROWS) {
    return { x, y };
  }

  return null;
}

/**
 * 获取棋盘绘制区域（考虑边距）
 * @param stageWidth Stage宽度
 * @param stageHeight Stage高度
 * @returns 棋盘绘制区域信息
 */
export function getBoardArea(
  stageWidth: number,
  stageHeight: number
): {
  boardX: number; // 棋盘左上角X坐标
  boardY: number; // 棋盘左上角Y坐标
  boardWidth: number; // 棋盘宽度
  boardHeight: number; // 棋盘高度
  cellWidth: number; // 每个格子的宽度
  cellHeight: number; // 每个格子的高度
} {
  // 计算可用区域（减去边距）
  const availableWidth = stageWidth - 2 * BOARD_PADDING;
  const availableHeight = stageHeight - 2 * BOARD_PADDING;
  
  // 计算每个格子的尺寸
  const cellWidth = availableWidth / (BOARD_COLS - 1);
  const cellHeight = availableHeight / (BOARD_ROWS - 1);
  
  return {
    boardX: BOARD_PADDING,
    boardY: BOARD_PADDING,
    boardWidth: availableWidth,
    boardHeight: availableHeight,
    cellWidth,
    cellHeight,
  };
}

/**
 * 将棋盘坐标转换为屏幕坐标
 * @param boardX 棋盘X坐标
 * @param boardY 棋盘Y坐标
 * @param stageWidth Stage宽度
 * @param stageHeight Stage高度
 * @returns 屏幕坐标
 */
export function boardToScreen(
  boardX: number,
  boardY: number,
  stageWidth: number,
  stageHeight: number
): { x: number; y: number } {
  const area = getBoardArea(stageWidth, stageHeight);
  
  // 计算在棋盘区域内的位置
  const x = area.boardX + boardX * area.cellWidth;
  const y = area.boardY + boardY * area.cellHeight;
  
  return { x, y };
}

/**
 * 计算Stage的尺寸，保持棋盘比例
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @returns Stage尺寸
 */
export function calculateStageSize(
  containerWidth: number,
  containerHeight: number
): { width: number; height: number } {
  const containerAspect = containerWidth / containerHeight;

  if (containerAspect > BOARD_ASPECT_RATIO) {
    // 容器更宽，以高度为准
    return {
      width: containerHeight * BOARD_ASPECT_RATIO,
      height: containerHeight,
    };
  } else {
    // 容器更高，以宽度为准
    return {
      width: containerWidth,
      height: containerWidth / BOARD_ASPECT_RATIO,
    };
  }
}

/**
 * 计算交叉点的屏幕坐标（用于绘制）
 * @param boardX 棋盘X坐标
 * @param boardY 棋盘Y坐标
 * @param stageWidth Stage宽度
 * @param stageHeight Stage高度
 * @returns 屏幕坐标
 */
export function getIntersectionPosition(
  boardX: number,
  boardY: number,
  stageWidth: number,
  stageHeight: number
): { x: number; y: number } {
  return boardToScreen(boardX, boardY, stageWidth, stageHeight);
}

