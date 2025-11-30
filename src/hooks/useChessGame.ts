import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type {
  GameState,
  Position,
  Piece,
  Move,
  GameStatus,
  PieceColor,
} from '../types/chess';
import {
  createInitialPieces,
  piecesToBoard,
} from '../types/chess';
import { getValidMoves, isValidMove, isCheckmate, isInCheck } from '../utils/rules';
import { playMoveSound, playCaptureSound, playCheckSound, playCheckVoice, playCheckmateSound, playCheckmateVoice } from '../utils/sounds';
import { getAIMove, type AIDifficulty } from '../utils/ai';

export function useChessGame() {
  const [pieces, setPieces] = useState<Piece[]>(() => createInitialPieces());
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'black'>('red');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [status, setStatus] = useState<GameStatus>('playing');
  
  // AI相关状态
  const [aiMode, setAIMode] = useState<boolean>(false);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('medium');
  const [aiColor, setAIColor] = useState<PieceColor | null>(null);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  
  // 动效触发状态
  const [effectTrigger, setEffectTrigger] = useState<'check' | 'checkmate' | null>(null);
  const lastCheckStateRef = useRef<boolean>(false);
  const lastCheckmateStateRef = useRef<boolean>(false);
  
  // 用于防止AI重复走棋的ref
  const aiMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    
    // 检测状态变化，触发动效
    if (isMate && !lastCheckmateStateRef.current) {
      // 绝杀：状态从非绝杀变为绝杀
      setStatus(currentPlayer === 'red' ? 'redWin' : 'blackWin');
      setEffectTrigger('checkmate');
      // 绝杀时播放音效和语音
      playCheckmateSound();
      playCheckmateVoice();
      lastCheckmateStateRef.current = true;
    } else if (isCheck && !lastCheckStateRef.current) {
      // 将军：状态从非将军变为将军
      setEffectTrigger('check');
      // 将军时播放提示音效和语音
      playCheckSound();
      playCheckVoice();
      lastCheckStateRef.current = true;
    } else if (!isCheck) {
      // 解除将军状态
      lastCheckStateRef.current = false;
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
    // 如果AI模式开启且当前是AI的回合，禁用玩家操作
    if (aiMode && aiColor === currentPlayer) {
      return;
    }
    
    // 如果AI正在思考，禁用玩家操作
    if (isAIThinking) {
      return;
    }
    
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
  }, [board, currentPlayer, selectedPosition, validMoves, makeMove, aiMode, aiColor, isAIThinking]);

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
    setEffectTrigger(null);
    lastCheckStateRef.current = false;
    lastCheckmateStateRef.current = false;
  }, [moveHistory, pieces, currentPlayer]);

  // 重置游戏
  const resetGame = useCallback(() => {
    // 清除AI移动的定时器
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current);
      aiMoveTimeoutRef.current = null;
    }
    setPieces(createInitialPieces());
    setCurrentPlayer('red');
    setSelectedPosition(null);
    setMoveHistory([]);
    setStatus('playing');
    setIsAIThinking(false);
    setEffectTrigger(null);
    lastCheckStateRef.current = false;
    lastCheckmateStateRef.current = false;
  }, []);

  // 获取指定位置的棋子
  const getPieceAt = useCallback((position: Position): Piece | null => {
    return board[position.y][position.x];
  }, [board]);

  // 检查位置是否被选中
  const isPositionSelected = useCallback((position: Position): boolean => {
    return selectedPosition?.x === position.x && selectedPosition.y === position.y;
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

  // AI自动走棋逻辑
  useEffect(() => {
    // 如果AI模式未开启，或者游戏已结束，不执行
    if (!aiMode || aiColor === null || status !== 'playing') {
      return;
    }

    // 如果当前不是AI的回合，不执行
    if (currentPlayer !== aiColor) {
      return;
    }

    // 如果AI正在思考，不执行（防止重复触发）
    if (isAIThinking) {
      return;
    }

    // 设置AI思考状态
    setIsAIThinking(true);

    // 延迟执行AI走棋，模拟思考时间
    aiMoveTimeoutRef.current = setTimeout(() => {
      // 在回调中重新计算 board，确保使用最新的棋盘状态
      const currentBoard = piecesToBoard(pieces);
      const aiMove = getAIMove(currentBoard, aiColor, aiDifficulty);
      
      if (aiMove) {
        makeMove(aiMove.from, aiMove.to);
      }
      
      setIsAIThinking(false);
      aiMoveTimeoutRef.current = null;
    }, 500); // 500ms思考时间

    // 清理函数
    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current);
        aiMoveTimeoutRef.current = null;
      }
    };
    // 注意：不包含 isAIThinking 在依赖项中，避免循环触发
    // 不包含 board 在依赖项中，因为 board 是从 pieces 计算的，使用 pieces 更稳定
  }, [aiMode, aiColor, currentPlayer, pieces, aiDifficulty, status, makeMove]);

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
    // AI相关方法
    aiMode,
    aiDifficulty,
    aiColor,
    isAIThinking,
    setAIMode,
    setAIDifficulty,
    setAIColor,
    // 动效相关
    effectTrigger,
    clearEffectTrigger: () => setEffectTrigger(null),
  };
}
