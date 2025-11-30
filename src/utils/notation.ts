import type { Position, Move } from '../types/chess';
import { getPieceName } from '../types/chess';

// 将位置转换为中文记谱法的列号（1-9）
function getColumnNotation(x: number, color: 'red' | 'black'): string {
  const columns = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (color === 'red') {
    // 红方（下方）：从右到左是1-9，所以x=8对应"一"，x=0对应"九"
    return columns[8 - x];
  } else {
    // 黑方（上方）：从左到右是1-9，所以x=0对应"一"，x=8对应"九"
    return columns[x];
  }
}

// 判断移动方向
function getMoveDirection(from: Position, to: Position, color: 'red' | 'black'): '进' | '退' | '平' {
  if (color === 'red') {
    // 红方：向上（y减小）是"进"，向下（y增大）是"退"
    if (to.y < from.y) return '进';
    if (to.y > from.y) return '退';
    return '平';
  } else {
    // 黑方：向下（y增大）是"进"，向上（y减小）是"退"
    if (to.y > from.y) return '进';
    if (to.y < from.y) return '退';
    return '平';
  }
}

// 计算移动距离
function getMoveDistance(from: Position, to: Position): number {
  if (from.x === to.x) {
    // 纵向移动
    return Math.abs(to.y - from.y);
  } else {
    // 横向移动
    return Math.abs(to.x - from.x);
  }
}

// 将移动转换为中文记谱法
export function moveToNotation(move: Move): string {
  const { from, to, piece, capturedPiece } = move;
  const pieceName = getPieceName(piece);
  const direction = getMoveDirection(from, to, piece.color);
  const distance = getMoveDistance(from, to);
  
  // 获取起始位置的列号
  const fromColumn = getColumnNotation(from.x, piece.color);
  
  // 判断是否有吃子
  const hasCapture = !!capturedPiece;
  
  if (direction === '平') {
    // 平：车一平二、炮二平五
    const toColumn = getColumnNotation(to.x, piece.color);
    return `${pieceName}${fromColumn}平${toColumn}${hasCapture ? '吃' : ''}`;
  } else if (direction === '进') {
    // 进：马二进三、兵三进一
    if (from.x === to.x) {
      // 纵向前进
      return `${pieceName}${fromColumn}进${distance}${hasCapture ? '吃' : ''}`;
    } else {
      // 斜向或横向前进（如马、象、士）
      const toColumn = getColumnNotation(to.x, piece.color);
      return `${pieceName}${fromColumn}进${toColumn}${hasCapture ? '吃' : ''}`;
    }
  } else {
    // 退：车二退一、马三退二
    if (from.x === to.x) {
      // 纵向后退
      return `${pieceName}${fromColumn}退${distance}${hasCapture ? '吃' : ''}`;
    } else {
      // 斜向或横向后退（如马、象、士）
      const toColumn = getColumnNotation(to.x, piece.color);
      return `${pieceName}${fromColumn}退${toColumn}${hasCapture ? '吃' : ''}`;
    }
  }
}

// 格式化移动记录（带序号和颜色）
export function formatMoveRecord(move: Move, moveNumber: number): {
  number: number;
  color: 'red' | 'black';
  notation: string;
  move: Move;
} {
  return {
    number: moveNumber,
    color: move.piece.color,
    notation: moveToNotation(move),
    move,
  };
}

