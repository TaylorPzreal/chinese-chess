// 棋子类型
export type PieceType = 'king' | 'advisor' | 'elephant' | 'horse' | 'rook' | 'cannon' | 'pawn';

// 棋子颜色
export type PieceColor = 'red' | 'black';

// 棋盘位置 (x: 0-8, y: 0-9)
export interface Position {
  x: number; // 0-8 (从左到右)
  y: number; // 0-9 (从上到下)
}

// 棋子
export interface Piece {
  type: PieceType;
  color: PieceColor;
  position: Position;
  id: string; // 唯一标识符
}

// 移动记录
export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece; // 被吃的棋子
}

// 游戏状态
export type GameStatus = 'playing' | 'redWin' | 'blackWin' | 'draw';

// 游戏状态
export interface GameState {
  board: (Piece | null)[][]; // 9x10 棋盘
  currentPlayer: PieceColor;
  status: GameStatus;
  moves: Move[]; // 移动历史
  selectedPosition: Position | null; // 当前选中的位置
  validMoves: Position[]; // 当前选中位置的合法移动
}

// 初始棋盘配置
export const INITIAL_BOARD: (Piece | null)[][] = Array(10).fill(null).map(() => Array(9).fill(null));

// 创建初始棋子配置
export function createInitialPieces(): Piece[] {
  const pieces: Piece[] = [];
  let idCounter = 0;

  // 红方（下方，y: 7-9）
  // 车
  pieces.push({ type: 'rook', color: 'red', position: { x: 0, y: 9 }, id: `red-rook-${idCounter++}` });
  pieces.push({ type: 'rook', color: 'red', position: { x: 8, y: 9 }, id: `red-rook-${idCounter++}` });
  // 马
  pieces.push({ type: 'horse', color: 'red', position: { x: 1, y: 9 }, id: `red-horse-${idCounter++}` });
  pieces.push({ type: 'horse', color: 'red', position: { x: 7, y: 9 }, id: `red-horse-${idCounter++}` });
  // 象
  pieces.push({ type: 'elephant', color: 'red', position: { x: 2, y: 9 }, id: `red-elephant-${idCounter++}` });
  pieces.push({ type: 'elephant', color: 'red', position: { x: 6, y: 9 }, id: `red-elephant-${idCounter++}` });
  // 士
  pieces.push({ type: 'advisor', color: 'red', position: { x: 3, y: 9 }, id: `red-advisor-${idCounter++}` });
  pieces.push({ type: 'advisor', color: 'red', position: { x: 5, y: 9 }, id: `red-advisor-${idCounter++}` });
  // 将
  pieces.push({ type: 'king', color: 'red', position: { x: 4, y: 9 }, id: `red-king-${idCounter++}` });
  // 炮
  pieces.push({ type: 'cannon', color: 'red', position: { x: 1, y: 7 }, id: `red-cannon-${idCounter++}` });
  pieces.push({ type: 'cannon', color: 'red', position: { x: 7, y: 7 }, id: `red-cannon-${idCounter++}` });
  // 兵
  pieces.push({ type: 'pawn', color: 'red', position: { x: 0, y: 6 }, id: `red-pawn-${idCounter++}` });
  pieces.push({ type: 'pawn', color: 'red', position: { x: 2, y: 6 }, id: `red-pawn-${idCounter++}` });
  pieces.push({ type: 'pawn', color: 'red', position: { x: 4, y: 6 }, id: `red-pawn-${idCounter++}` });
  pieces.push({ type: 'pawn', color: 'red', position: { x: 6, y: 6 }, id: `red-pawn-${idCounter++}` });
  pieces.push({ type: 'pawn', color: 'red', position: { x: 8, y: 6 }, id: `red-pawn-${idCounter++}` });

  // 黑方（上方，y: 0-2）
  // 车
  pieces.push({ type: 'rook', color: 'black', position: { x: 0, y: 0 }, id: `black-rook-${idCounter++}` });
  pieces.push({ type: 'rook', color: 'black', position: { x: 8, y: 0 }, id: `black-rook-${idCounter++}` });
  // 马
  pieces.push({ type: 'horse', color: 'black', position: { x: 1, y: 0 }, id: `black-horse-${idCounter++}` });
  pieces.push({ type: 'horse', color: 'black', position: { x: 7, y: 0 }, id: `black-horse-${idCounter++}` });
  // 象
  pieces.push({ type: 'elephant', color: 'black', position: { x: 2, y: 0 }, id: `black-elephant-${idCounter++}` });
  pieces.push({ type: 'elephant', color: 'black', position: { x: 6, y: 0 }, id: `black-elephant-${idCounter++}` });
  // 士
  pieces.push({ type: 'advisor', color: 'black', position: { x: 3, y: 0 }, id: `black-advisor-${idCounter++}` });
  pieces.push({ type: 'advisor', color: 'black', position: { x: 5, y: 0 }, id: `black-advisor-${idCounter++}` });
  // 将
  pieces.push({ type: 'king', color: 'black', position: { x: 4, y: 0 }, id: `black-king-${idCounter++}` });
  // 炮
  pieces.push({ type: 'cannon', color: 'black', position: { x: 1, y: 2 }, id: `black-cannon-${idCounter++}` });
  pieces.push({ type: 'cannon', color: 'black', position: { x: 7, y: 2 }, id: `black-cannon-${idCounter++}` });
  // 兵
  pieces.push({ type: 'pawn', color: 'black', position: { x: 0, y: 3 }, id: `black-pawn-${idCounter++}` });
  pieces.push({ type: 'pawn', color: 'black', position: { x: 2, y: 3 }, id: `black-pawn-${idCounter++}` });
  pieces.push({ type: 'pawn', color: 'black', position: { x: 4, y: 3 }, id: `black-pawn-${idCounter++}` });
  pieces.push({ type: 'pawn', color: 'black', position: { x: 6, y: 3 }, id: `black-pawn-${idCounter++}` });
  pieces.push({ type: 'pawn', color: 'black', position: { x: 8, y: 3 }, id: `black-pawn-${idCounter++}` });

  return pieces;
}

// 将棋子数组转换为棋盘数组
export function piecesToBoard(pieces: Piece[]): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(10).fill(null).map(() => Array(9).fill(null));
  pieces.forEach(piece => {
    board[piece.position.y][piece.position.x] = piece;
  });
  return board;
}

// 获取棋子显示名称
export function getPieceName(piece: Piece): string {
  const names: Record<PieceType, { red: string; black: string }> = {
    king: { red: '帥', black: '將' },
    advisor: { red: '仕', black: '士' },
    elephant: { red: '相', black: '象' },
    horse: { red: '馬', black: '馬' },
    rook: { red: '車', black: '車' },
    cannon: { red: '炮', black: '砲' },
    pawn: { red: '兵', black: '卒' },
  };
  return names[piece.type][piece.color];
}

