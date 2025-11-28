import { memo, useMemo } from 'react';
import type { GameState } from '../types/chess';

interface GameInfoProps {
  gameState: GameState;
  // 当前执棋一方是否正处于被将军状态
  inCheck?: boolean;
}

function GameInfoComponent({ gameState, inCheck = false }: GameInfoProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{statusText}</h2>
        {/* {status === 'playing' && inCheck && (
          <div className="mb-1 text-red-600 font-semibold animate-pulse">
            将军！请尽快应将
          </div>
        )} */}
        <p className="text-gray-600">总步数: {moves.length}</p>
      </div>
    </div>
  );
}

export default memo(GameInfoComponent);

