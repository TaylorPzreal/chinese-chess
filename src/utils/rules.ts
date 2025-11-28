import type { Position, Piece, PieceColor } from '../types/chess';

// 检查位置是否在棋盘范围内
export function isValidPosition(pos: Position): boolean {
  return pos.x >= 0 && pos.x < 9 && pos.y >= 0 && pos.y < 10;
}

// 检查位置是否在九宫格内（对于将和士）
export function isInPalace(pos: Position, color: PieceColor): boolean {
  if (color === 'red') {
    return pos.x >= 3 && pos.x <= 5 && pos.y >= 7 && pos.y <= 9;
  } else {
    return pos.x >= 3 && pos.x <= 5 && pos.y >= 0 && pos.y <= 2;
  }
}

// 检查位置是否在己方区域（对于象）
export function isInOwnArea(pos: Position, color: PieceColor): boolean {
  if (color === 'red') {
    return pos.y >= 5 && pos.y <= 9;
  } else {
    return pos.y >= 0 && pos.y <= 4;
  }
}

// 检查两个位置之间是否有棋子（不包括起点和终点）
export function hasPieceBetween(
  board: (Piece | null)[][],
  from: Position,
  to: Position
): boolean {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // 必须是直线
  if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) {
    return false;
  }
  
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (steps === 0) return false;
  
  const stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
  const stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
  
  for (let i = 1; i < steps; i++) {
    const x = from.x + stepX * i;
    const y = from.y + stepY * i;
    if (board[y][x] !== null) {
      return true;
    }
  }
  
  return false;
}

// 计算两个位置之间的棋子数量（不包括起点和终点）
export function countPiecesBetween(
  board: (Piece | null)[][],
  from: Position,
  to: Position
): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // 必须是直线
  if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) {
    return 0;
  }
  
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (steps === 0) return 0;
  
  const stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
  const stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
  let count = 0;
  
  for (let i = 1; i < steps; i++) {
    const x = from.x + stepX * i;
    const y = from.y + stepY * i;
    if (board[y][x] !== null) {
      count++;
    }
  }
  
  return count;
}

// 将（帅）的走法
export function getKingMoves(
  board: (Piece | null)[][],
  piece: Piece
): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  const directions = [
    { x: 0, y: -1 }, // 上
    { x: 0, y: 1 },  // 下
    { x: -1, y: 0 }, // 左
    { x: 1, y: 0 },  // 右
  ];
  
  for (const dir of directions) {
    const newPos: Position = { x: x + dir.x, y: y + dir.y };
    if (isValidPosition(newPos) && isInPalace(newPos, piece.color)) {
      const targetPiece = board[newPos.y][newPos.x];
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push(newPos);
      }
    }
  }
  
  // 将帅对脸（飞将）- 必须在同一列
  const kingY = piece.color === 'red' ? 9 : 0;
  if (y === kingY) {
    // 检查同一列是否有对方的将
    for (let checkY = 0; checkY < 10; checkY++) {
      if (checkY === y) continue;
      const checkPiece = board[checkY][x];
      if (checkPiece && checkPiece.type === 'king' && checkPiece.color !== piece.color) {
        // 检查中间是否有棋子
        if (!hasPieceBetween(board, piece.position, { x, y: checkY })) {
          moves.push({ x, y: checkY });
        }
      }
    }
  }
  
  return moves;
}

// 士（仕）的走法
export function getAdvisorMoves(
  board: (Piece | null)[][],
  piece: Piece
): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  const directions = [
    { x: -1, y: -1 }, // 左上
    { x: 1, y: -1 },  // 右上
    { x: -1, y: 1 },  // 左下
    { x: 1, y: 1 },   // 右下
  ];
  
  for (const dir of directions) {
    const newPos: Position = { x: x + dir.x, y: y + dir.y };
    if (isValidPosition(newPos) && isInPalace(newPos, piece.color)) {
      const targetPiece = board[newPos.y][newPos.x];
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push(newPos);
      }
    }
  }
  
  return moves;
}

// 象（相）的走法
export function getElephantMoves(
  board: (Piece | null)[][],
  piece: Piece
): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  const directions = [
    { x: -2, y: -2 }, // 左上
    { x: 2, y: -2 },  // 右上
    { x: -2, y: 2 },  // 左下
    { x: 2, y: 2 },   // 右下
  ];
  
  for (const dir of directions) {
    const newPos: Position = { x: x + dir.x, y: y + dir.y };
    if (isValidPosition(newPos) && isInOwnArea(newPos, piece.color)) {
      // 检查塞象眼
      const blockPos: Position = { x: x + dir.x / 2, y: y + dir.y / 2 };
      if (board[blockPos.y][blockPos.x] === null) {
        const targetPiece = board[newPos.y][newPos.x];
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push(newPos);
        }
      }
    }
  }
  
  return moves;
}

// 马的走法
export function getHorseMoves(
  board: (Piece | null)[][],
  piece: Piece
): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  const horseMoves = [
    { x: -2, y: -1, block: { x: -1, y: 0 } }, // 左上
    { x: -2, y: 1, block: { x: -1, y: 0 } },  // 左下
    { x: 2, y: -1, block: { x: 1, y: 0 } },   // 右上
    { x: 2, y: 1, block: { x: 1, y: 0 } },    // 右下
    { x: -1, y: -2, block: { x: 0, y: -1 } }, // 上左
    { x: 1, y: -2, block: { x: 0, y: -1 } },  // 上右
    { x: -1, y: 2, block: { x: 0, y: 1 } },   // 下左
    { x: 1, y: 2, block: { x: 0, y: 1 } },    // 下右
  ];
  
  for (const move of horseMoves) {
    const newPos: Position = { x: x + move.x, y: y + move.y };
    if (isValidPosition(newPos)) {
      // 检查蹩马腿
      const blockPos: Position = { x: x + move.block.x, y: y + move.block.y };
      if (board[blockPos.y][blockPos.x] === null) {
        const targetPiece = board[newPos.y][newPos.x];
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push(newPos);
        }
      }
    }
  }
  
  return moves;
}

// 车的走法
export function getRookMoves(
  board: (Piece | null)[][],
  piece: Piece
): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  const directions = [
    { x: 0, y: -1 }, // 上
    { x: 0, y: 1 },  // 下
    { x: -1, y: 0 }, // 左
    { x: 1, y: 0 },  // 右
  ];
  
  for (const dir of directions) {
    for (let i = 1; i < 10; i++) {
      const newPos: Position = { x: x + dir.x * i, y: y + dir.y * i };
      if (!isValidPosition(newPos)) break;
      
      const targetPiece = board[newPos.y][newPos.x];
      if (targetPiece) {
        if (targetPiece.color !== piece.color) {
          moves.push(newPos);
        }
        break;
      }
      moves.push(newPos);
    }
  }
  
  return moves;
}

// 炮的走法
export function getCannonMoves(
  board: (Piece | null)[][],
  piece: Piece
): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  const directions = [
    { x: 0, y: -1 }, // 上
    { x: 0, y: 1 },  // 下
    { x: -1, y: 0 }, // 左
    { x: 1, y: 0 },  // 右
  ];
  
  for (const dir of directions) {
    let foundPiece = false; // 是否找到了一个棋子作为"炮台"
    
    for (let i = 1; i < 10; i++) {
      const newPos: Position = { x: x + dir.x * i, y: y + dir.y * i };
      if (!isValidPosition(newPos)) break;
      
      const targetPiece = board[newPos.y][newPos.x];
      
      if (targetPiece) {
        if (!foundPiece) {
          // 找到第一个棋子，作为"炮台"，可以翻山吃子
          foundPiece = true;
        } else {
          // 找到第二个棋子，可以吃它
          if (targetPiece.color !== piece.color) {
            moves.push(newPos);
          }
          break;
        }
      } else {
        // 空位
        if (!foundPiece) {
          // 还没有找到"炮台"，可以移动
          moves.push(newPos);
        }
      }
    }
  }
  
  return moves;
}

// 兵（卒）的走法
export function getPawnMoves(
  board: (Piece | null)[][],
  piece: Piece
): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  
  if (piece.color === 'red') {
    // 红方兵
    // 未过河，只能向前
    if (y > 4) {
      const newPos: Position = { x, y: y - 1 };
      if (isValidPosition(newPos)) {
        const targetPiece = board[newPos.y][newPos.x];
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push(newPos);
        }
      }
    } else {
      // 已过河，可以向前、左、右
      const directions = [
        { x: 0, y: -1 }, // 前
        { x: -1, y: 0 }, // 左
        { x: 1, y: 0 },  // 右
      ];
      for (const dir of directions) {
        const newPos: Position = { x: x + dir.x, y: y + dir.y };
        if (isValidPosition(newPos)) {
          const targetPiece = board[newPos.y][newPos.x];
          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push(newPos);
          }
        }
      }
    }
  } else {
    // 黑方卒
    // 未过河，只能向前
    if (y < 5) {
      const newPos: Position = { x, y: y + 1 };
      if (isValidPosition(newPos)) {
        const targetPiece = board[newPos.y][newPos.x];
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push(newPos);
        }
      }
    } else {
      // 已过河，可以向前、左、右
      const directions = [
        { x: 0, y: 1 },  // 前
        { x: -1, y: 0 }, // 左
        { x: 1, y: 0 },  // 右
      ];
      for (const dir of directions) {
        const newPos: Position = { x: x + dir.x, y: y + dir.y };
        if (isValidPosition(newPos)) {
          const targetPiece = board[newPos.y][newPos.x];
          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push(newPos);
          }
        }
      }
    }
  }
  
  return moves;
}

// 获取棋子的所有合法移动（不考虑将军检查）
export function getValidMoves(
  board: (Piece | null)[][],
  piece: Piece
): Position[] {
  switch (piece.type) {
    case 'king':
      return getKingMoves(board, piece);
    case 'advisor':
      return getAdvisorMoves(board, piece);
    case 'elephant':
      return getElephantMoves(board, piece);
    case 'horse':
      return getHorseMoves(board, piece);
    case 'rook':
      return getRookMoves(board, piece);
    case 'cannon':
      return getCannonMoves(board, piece);
    case 'pawn':
      return getPawnMoves(board, piece);
    default:
      return [];
  }
}

// 检查是否将军（不递归调用 getValidMoves，避免循环）
export function isInCheck(
  board: (Piece | null)[][],
  color: PieceColor
): boolean {
  // 找到将/帅的位置
  let kingPos: Position | null = null;
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = board[y][x];
      if (piece && piece.type === 'king' && piece.color === color) {
        kingPos = { x, y };
        break;
      }
    }
    if (kingPos) break;
  }
  
  if (!kingPos) return false;
  
  // 检查对方所有棋子是否能攻击到将/帅
  const opponentColor: PieceColor = color === 'red' ? 'black' : 'red';
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = board[y][x];
      if (piece && piece.color === opponentColor) {
        // 直接检查每种棋子的攻击方式，避免递归
        const canAttack = canPieceAttackPosition(board, piece, kingPos);
        if (canAttack) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// 检查棋子是否能攻击到指定位置（不递归）
function canPieceAttackPosition(
  board: (Piece | null)[][],
  piece: Piece,
  target: Position
): boolean {
  const moves = getValidMoves(board, piece);
  return moves.some(move => move.x === target.x && move.y === target.y);
}

// 检查移动后是否会被将军（用于验证移动合法性）
export function wouldBeInCheck(
  board: (Piece | null)[][],
  from: Position,
  to: Position,
  color: PieceColor
): boolean {
  // 创建临时棋盘（深拷贝）
  const tempBoard: (Piece | null)[][] = board.map(row => 
    row.map(cell => {
      if (!cell) return null;
      return { ...cell, position: { ...cell.position } };
    })
  );
  
  const piece = tempBoard[from.y][from.x];
  if (!piece) return false;
  
  // 执行移动
  tempBoard[to.y][to.x] = { ...piece, position: { ...to } };
  tempBoard[from.y][from.x] = null;
  
  // 检查是否被将军
  return isInCheck(tempBoard, color);
}

// 检查是否将死
export function isCheckmate(
  board: (Piece | null)[][],
  color: PieceColor
): boolean {
  if (!isInCheck(board, color)) return false;
  
  // 检查是否有任何合法移动可以解除将军
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = board[y][x];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, piece);
        for (const move of moves) {
          if (!wouldBeInCheck(board, piece.position, move, color)) {
            return false; // 有合法移动，不是将死
          }
        }
      }
    }
  }
  
  return true; // 没有合法移动，将死
}

// 验证移动是否合法
export function isValidMove(
  board: (Piece | null)[][],
  from: Position,
  to: Position,
  color: PieceColor
): boolean {
  const piece = board[from.y][from.x];
  if (!piece || piece.color !== color) return false;
  
  // 检查是否是合法走法
  const validMoves = getValidMoves(board, piece);
  const isValid = validMoves.some(move => move.x === to.x && move.y === to.y);
  if (!isValid) return false;
  
  // 检查移动后是否会被将军
  if (wouldBeInCheck(board, from, to, color)) return false;
  
  return true;
}
