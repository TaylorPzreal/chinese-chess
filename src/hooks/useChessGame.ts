import { useState, useCallback, useMemo } from 'react';
import type {
  GameState,
  Position,
  Piece,
  Move,
  GameStatus,
} from '../types/chess';
import {
  createInitialPieces,
  piecesToBoard,
} from '../types/chess';
import { getValidMoves, isValidMove, isCheckmate, isInCheck } from '../utils/rules';
import { playMoveSound, playCaptureSound, playCheckSound, playCheckVoice, playCheckmateSound, playCheckmateVoice } from '../utils/sounds';

export function useChessGame() {
  const [pieces, setPieces] = useState<Piece[]>(() => createInitialPieces());
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'black'>('red');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [status, setStatus] = useState<GameStatus>('playing');

  // 计算棋盘状态
  const board = useMemo(() => piecesToBoard(pieces), [pieces]);

  // 执行移动
  const makeMove = useCallback((from: Position, to: Position) => {
    const piece = board[from.y][from.x];
    if (!piece) return false;
    
    // 验证移动合法性
    if (!isValidMove(board, from, to, currentPlayer)) {
      return false;
    }
    
    // 检查是否有吃子
    const capturedPiece = board[to.y][to.x];
    
    // 创建新的棋子数组
    const newPieces = pieces.map(p => {
      if (p.id === piece.id) {
        return { ...p, position: { ...to } };
      }
      return p;
    });
    
    // 如果有吃子，移除被吃的棋子
    if (capturedPiece) {
      const index = newPieces.findIndex(p => p.id === capturedPiece.id);
      if (index !== -1) {
        newPieces.splice(index, 1);
      }
      // 播放吃子音效
      playCaptureSound();
    } else {
      // 播放移动音效
      playMoveSound();
    }
    
    // 创建移动记录
    const move: Move = {
      from: { ...from },
      to: { ...to },
      piece: { ...piece, position: { ...piece.position } },
      capturedPiece: capturedPiece ? { ...capturedPiece, position: { ...capturedPiece.position } } : undefined,
    };
    
    // 切换玩家
    const nextPlayer = currentPlayer === 'red' ? 'black' : 'red';
    
    // 更新状态
    setPieces(newPieces);
    setMoveHistory(prev => [...prev, move]);
    setSelectedPosition(null);
    setCurrentPlayer(nextPlayer);
    
    // 检查游戏状态（使用新的棋盘状态）
    const newBoard = piecesToBoard(newPieces);
    const isCheck = isInCheck(newBoard, nextPlayer);
    const isMate = isCheckmate(newBoard, nextPlayer);
    
    if (isMate) {
      setStatus(currentPlayer === 'red' ? 'redWin' : 'blackWin');
      // 绝杀时播放音效和语音
      playCheckmateSound();
      playCheckmateVoice();
    } else if (isCheck) {
      // 将军时播放提示音效和语音
      playCheckSound();
      playCheckVoice();
      // 状态保持为 'playing'
    }
    
    return true;
  }, [board, pieces, currentPlayer]);

  // 计算当前选中位置的合法移动
  const validMoves = useMemo(() => {
    if (!selectedPosition) return [];
    const piece = board[selectedPosition.y][selectedPosition.x];
    if (!piece || piece.color !== currentPlayer) return [];
    
    // 获取所有可能的移动
    const moves = getValidMoves(board, piece);
    
    // 过滤掉会导致被将军的移动
    return moves.filter(move => {
      return isValidMove(board, selectedPosition, move, currentPlayer);
    });
  }, [board, selectedPosition, currentPlayer]);

  // 选择位置
  const selectPosition = useCallback((position: Position) => {
    const piece = board[position.y][position.x];
    
    // 如果点击的是己方棋子
    if (piece && piece.color === currentPlayer) {
      // 如果点击的是已经选中的棋子，取消选择
      if (selectedPosition && selectedPosition.x === position.x && selectedPosition.y === position.y) {
        setSelectedPosition(null);
        return;
      }
      // 否则选中这个棋子
      setSelectedPosition({ ...position });
      return;
    }
    
    // 如果已选中位置，尝试移动
    if (selectedPosition) {
      const isValid = validMoves.some(
        move => move.x === position.x && move.y === position.y
      );
      
      if (isValid) {
        makeMove(selectedPosition, position);
      } else {
        // 如果点击的是对方棋子或空位但不是合法移动，取消选择
        setSelectedPosition(null);
      }
    }
  }, [board, currentPlayer, selectedPosition, validMoves, makeMove]);

  // 悔棋
  const undoMove = useCallback(() => {
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory[moveHistory.length - 1];
    const newHistory = moveHistory.slice(0, -1);
    
    // 恢复棋子位置
    const newPieces = pieces.map(p => {
      if (p.id === lastMove.piece.id) {
        return { ...p, position: { ...lastMove.from } };
      }
      return p;
    });
    
    // 恢复被吃的棋子
    if (lastMove.capturedPiece) {
      newPieces.push({ ...lastMove.capturedPiece, position: { ...lastMove.capturedPiece.position } });
    }
    
    // 切换回上一个玩家
    const previousPlayer = currentPlayer === 'red' ? 'black' : 'red';
    
    setPieces(newPieces);
    setMoveHistory(newHistory);
    setCurrentPlayer(previousPlayer);
    setSelectedPosition(null);
    setStatus('playing');
  }, [moveHistory, pieces, currentPlayer]);

  // 重置游戏
  const resetGame = useCallback(() => {
    setPieces(createInitialPieces());
    setCurrentPlayer('red');
    setSelectedPosition(null);
    setMoveHistory([]);
    setStatus('playing');
  }, []);

  // 获取指定位置的棋子
  const getPieceAt = useCallback((position: Position): Piece | null => {
    return board[position.y][position.x];
  }, [board]);

  // 检查位置是否被选中
  const isPositionSelected = useCallback((position: Position): boolean => {
    return selectedPosition?.x === position.x && selectedPosition?.y === position.y;
  }, [selectedPosition]);

  // 保存游戏
  const saveGame = useCallback(() => {
    const gameData = {
      pieces: pieces.map(p => ({ ...p, position: { ...p.position } })),
      currentPlayer,
      moveHistory: moveHistory.map(m => ({
        ...m,
        from: { ...m.from },
        to: { ...m.to },
        piece: { ...m.piece, position: { ...m.piece.position } },
        capturedPiece: m.capturedPiece ? { ...m.capturedPiece, position: { ...m.capturedPiece.position } } : undefined,
      })),
      status,
    };
    try {
      localStorage.setItem('chineseChessGame', JSON.stringify(gameData));
      return true;
    } catch (e) {
      console.error('保存游戏失败:', e);
      return false;
    }
  }, [pieces, currentPlayer, moveHistory, status]);

  // 加载游戏
  const loadGame = useCallback(() => {
    try {
      const saved = localStorage.getItem('chineseChessGame');
      if (!saved) return false;
      
      const gameData = JSON.parse(saved);
      
      // 验证数据格式
      if (
        !Array.isArray(gameData.pieces) ||
        !['red', 'black'].includes(gameData.currentPlayer) ||
        !Array.isArray(gameData.moveHistory) ||
        !['playing', 'redWin', 'blackWin', 'draw'].includes(gameData.status)
      ) {
        return false;
      }
      
      setPieces(gameData.pieces);
      setCurrentPlayer(gameData.currentPlayer);
      setMoveHistory(gameData.moveHistory);
      setStatus(gameData.status);
      setSelectedPosition(null);
      
      return true;
    } catch (e) {
      console.error('加载游戏失败:', e);
      return false;
    }
  }, []);

  // 检查是否有保存的游戏
  const hasSavedGame = useCallback(() => {
    return !!localStorage.getItem('chineseChessGame');
  }, []);

  const gameState: GameState = {
    board,
    currentPlayer,
    status,
    moves: moveHistory,
    selectedPosition: selectedPosition ? { ...selectedPosition } : null,
    validMoves,
  };

  return {
    gameState,
    pieces,
    selectPosition,
    makeMove,
    undoMove,
    resetGame,
    getPieceAt,
    isPositionSelected,
    saveGame,
    loadGame,
    hasSavedGame,
  };
}
