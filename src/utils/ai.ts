import type { Position, Piece, PieceColor } from '../types/chess';
import { getValidMoves, isValidMove, isInCheck, isCheckmate } from './rules';

export type AIDifficulty = 'simple' | 'medium' | 'hard';

// 棋子价值表
const PIECE_VALUES: Record<string, number> = {
  king: 10000,
  rook: 450,
  horse: 400,
  cannon: 400,
  pawn: 50,
  advisor: 20,
  elephant: 20,
};

// 位置价值表（简化版，可以根据需要扩展）
// 中心位置和关键位置更有价值
const POSITION_VALUES: number[][] = [
  // 黑方区域（y: 0-4）
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 红方区域（y: 5-9）
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// 评估棋盘位置
export function evaluateBoard(
  board: (Piece | null)[][],
  color: PieceColor
): number {
  let score = 0;
  const opponentColor: PieceColor = color === 'red' ? 'black' : 'red';

  // 检查是否被将军
  if (isInCheck(board, color)) {
    score -= 500; // 被将军惩罚
  }
  if (isInCheck(board, opponentColor)) {
    score += 500; // 将军对手奖励
  }

  // 检查是否将死
  if (isCheckmate(board, opponentColor)) {
    score += 10000; // 将死对手
  }
  if (isCheckmate(board, color)) {
    score -= 10000; // 被将死
  }

  // 计算棋子价值
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = board[y][x];
      if (!piece) continue;

      const pieceValue = PIECE_VALUES[piece.type] || 0;
      const positionValue = POSITION_VALUES[y]?.[x] || 0;

      if (piece.color === color) {
        score += pieceValue + positionValue;
      } else {
        score -= pieceValue + positionValue;
      }
    }
  }

  return score;
}

// 获取所有可能的移动
function getAllPossibleMoves(
  board: (Piece | null)[][],
  color: PieceColor
): Array<{ from: Position; to: Position; piece: Piece }> {
  const moves: Array<{ from: Position; to: Position; piece: Piece }> = [];

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = board[y][x];
      if (!piece || piece.color !== color) continue;

      const validMoves = getValidMoves(board, piece);
      for (const move of validMoves) {
        // 检查移动是否合法（不会导致被将军）
        if (isValidMove(board, piece.position, move, color)) {
          moves.push({
            from: piece.position,
            to: move,
            piece,
          });
        }
      }
    }
  }

  return moves;
}

// 简单难度：随机选择合法移动
function getSimpleMove(
  board: (Piece | null)[][],
  color: PieceColor
): { from: Position; to: Position } | null {
  const moves = getAllPossibleMoves(board, color);
  if (moves.length === 0) return null;

  const randomMove = moves[Math.floor(Math.random() * moves.length)];
  return {
    from: randomMove.from,
    to: randomMove.to,
  };
}

// 中等难度：贪心算法，选择评估值最高的移动
function getMediumMove(
  board: (Piece | null)[][],
  color: PieceColor
): { from: Position; to: Position } | null {
  const moves = getAllPossibleMoves(board, color);
  if (moves.length === 0) return null;

  let bestMove: { from: Position; to: Position } | null = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    // 创建临时棋盘
    const tempBoard: (Piece | null)[][] = board.map((row) =>
      row.map((cell) => {
        if (!cell) return null;
        return { ...cell, position: { ...cell.position } };
      })
    );

    // 执行移动
    const piece = tempBoard[move.from.y][move.from.x];
    if (!piece) continue;

    const capturedPiece = tempBoard[move.to.y][move.to.x];
    tempBoard[move.to.y][move.to.x] = { ...piece, position: { ...move.to } };
    tempBoard[move.from.y][move.from.x] = null;

    // 评估移动后的棋盘
    const score = evaluateBoard(tempBoard, color);

    // 如果吃子，额外奖励
    if (capturedPiece) {
      const captureValue = PIECE_VALUES[capturedPiece.type] || 0;
      const moveScore = score + captureValue * 2; // 吃子奖励加倍

      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = { from: move.from, to: move.to };
      }
    } else if (score > bestScore) {
      bestScore = score;
      bestMove = { from: move.from, to: move.to };
    }
  }

  return bestMove;
}

// Minimax算法（带Alpha-Beta剪枝）
function minimax(
  board: (Piece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  color: PieceColor
): number {
  // 终止条件
  if (depth === 0) {
    return evaluateBoard(board, color);
  }

  const opponentColor: PieceColor = color === 'red' ? 'black' : 'red';
  const currentColor = maximizingPlayer ? color : opponentColor;

  // 检查游戏是否结束
  if (isCheckmate(board, opponentColor)) {
    return 10000 - depth; // 将死对手，深度越浅越好
  }
  if (isCheckmate(board, color)) {
    return -10000 + depth; // 被将死，深度越浅越差
  }

  const moves = getAllPossibleMoves(board, currentColor);
  if (moves.length === 0) {
    // 无合法移动，可能是和棋或输棋
    if (isInCheck(board, currentColor)) {
      return maximizingPlayer ? -10000 + depth : 10000 - depth;
    }
    return 0; // 和棋
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      // 创建临时棋盘
      const tempBoard: (Piece | null)[][] = board.map((row) =>
        row.map((cell) => {
          if (!cell) return null;
          return { ...cell, position: { ...cell.position } };
        })
      );

      // 执行移动
      const piece = tempBoard[move.from.y][move.from.x];
      if (!piece) continue;

      tempBoard[move.to.y][move.to.x] = { ...piece, position: { ...move.to } };
      tempBoard[move.from.y][move.from.x] = null;

      const evalResult = minimax(tempBoard, depth - 1, alpha, beta, false, color);
      maxEval = Math.max(maxEval, evalResult);
      alpha = Math.max(alpha, evalResult);
      if (beta <= alpha) {
        break; // Alpha-Beta剪枝
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      // 创建临时棋盘
      const tempBoard: (Piece | null)[][] = board.map((row) =>
        row.map((cell) => {
          if (!cell) return null;
          return { ...cell, position: { ...cell.position } };
        })
      );

      // 执行移动
      const piece = tempBoard[move.from.y][move.from.x];
      if (!piece) continue;

      tempBoard[move.to.y][move.to.x] = { ...piece, position: { ...move.to } };
      tempBoard[move.from.y][move.from.x] = null;

      const evalResult = minimax(tempBoard, depth - 1, alpha, beta, true, color);
      minEval = Math.min(minEval, evalResult);
      beta = Math.min(beta, evalResult);
      if (beta <= alpha) {
        break; // Alpha-Beta剪枝
      }
    }
    return minEval;
  }
}

// 困难难度：Minimax算法
function getHardMove(
  board: (Piece | null)[][],
  color: PieceColor,
  depth: number = 3
): { from: Position; to: Position } | null {
  const moves = getAllPossibleMoves(board, color);
  if (moves.length === 0) return null;

  let bestMove: { from: Position; to: Position } | null = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    // 创建临时棋盘
    const tempBoard: (Piece | null)[][] = board.map((row) =>
      row.map((cell) => {
        if (!cell) return null;
        return { ...cell, position: { ...cell.position } };
      })
    );

    // 执行移动
    const piece = tempBoard[move.from.y][move.from.x];
    if (!piece) continue;

    tempBoard[move.to.y][move.to.x] = { ...piece, position: { ...move.to } };
    tempBoard[move.from.y][move.from.x] = null;

    // 使用Minimax评估
    const score = minimax(tempBoard, depth - 1, -Infinity, Infinity, false, color);

    if (score > bestScore) {
      bestScore = score;
      bestMove = { from: move.from, to: move.to };
    }
  }

  return bestMove;
}

// 主函数：根据难度获取AI移动
export function getAIMove(
  board: (Piece | null)[][],
  color: PieceColor,
  difficulty: AIDifficulty
): { from: Position; to: Position } | null {
  switch (difficulty) {
    case 'simple':
      return getSimpleMove(board, color);
    case 'medium':
      return getMediumMove(board, color);
    case 'hard':
      return getHardMove(board, color, 3);
    default:
      return getSimpleMove(board, color);
  }
}

