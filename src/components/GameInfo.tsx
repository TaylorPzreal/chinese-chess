import { memo, useMemo } from 'react';
import type { GameState } from '../types/chess';
import type { AIDifficulty } from '../utils/ai';

interface GameInfoProps {
  gameState: GameState;
  // AI相关属性
  aiMode?: boolean;
  aiDifficulty?: AIDifficulty;
  aiColor?: 'red' | 'black' | null;
  isAIThinking?: boolean;
}

function GameInfoComponent({ 
  gameState, 
  aiMode = false,
  aiDifficulty,
  aiColor,
  isAIThinking = false,
}: GameInfoProps) {
  const { currentPlayer, status, moves } = gameState;

  const statusText = useMemo(() => {
    switch (status) {
      case 'redWin':
        return '红方胜！';
      case 'blackWin':
        return '黑方胜！';
      case 'draw':
        return '和棋';
      default:
        return `当前玩家: ${currentPlayer === 'red' ? '红方' : '黑方'}`;
    }
  }, [status, currentPlayer]);

  const difficultyText = useMemo(() => {
    if (!aiDifficulty) return '';
    switch (aiDifficulty) {
      case 'simple':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return '';
    }
  }, [aiDifficulty]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{statusText}</h2>
        {isAIThinking && (
          <div className="mb-2 text-blue-600 font-semibold animate-pulse">
            AI思考中...
          </div>
        )}
        {aiMode && aiColor && (
          <div className="mb-2 text-sm text-gray-600">
            AI模式: {aiColor === 'red' ? '红方' : '黑方'} ({difficultyText})
          </div>
        )}
        <p className="text-gray-600">总步数: {moves.length}</p>
      </div>
    </div>
  );
}

export default memo(GameInfoComponent);

