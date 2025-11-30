import { memo, useMemo } from 'react';
import type { Move } from '../types/chess';
import { formatMoveRecord } from '../utils/notation';

interface MoveHistoryProps {
  moves: Move[];
  onMoveClick?: (moveIndex: number) => void;
}

function MoveHistoryComponent({ moves, onMoveClick }: MoveHistoryProps) {
  // 将移动记录格式化为显示格式，并倒序排列
  const formattedMoves = useMemo(() => {
    const formatted = moves.map((move, index) => formatMoveRecord(move, index + 1));
    // 倒序排列，最新的记录显示在最上面
    return formatted.reverse();
  }, [moves]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-center text-amber-900">
        走棋记录
      </h3>
      <div className="max-h-96 overflow-y-auto">
        {formattedMoves.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            暂无走棋记录
          </div>
        ) : (
          <div className="space-y-1">
            {formattedMoves.map((move, index) => {
              // 计算原始序号（倒序后的序号）
              const originalIndex = moves.length - index;
              return (
                <div
                  key={move.number - 1}
                  className="flex items-center gap-2 text-sm border-b border-gray-200 pb-1 hover:bg-amber-50 transition-colors"
                >
                  <span className="text-gray-500 font-mono w-8 text-right">
                    {originalIndex}.
                  </span>
                  <button
                    onClick={() => onMoveClick?.(move.number - 1)}
                    className={`flex-1 text-left px-2 py-1 rounded ${
                      onMoveClick
                        ? move.color === 'red'
                          ? 'hover:bg-red-100 cursor-pointer'
                          : 'hover:bg-gray-100 cursor-pointer'
                        : 'cursor-default'
                    } ${
                      move.color === 'red'
                        ? 'text-red-700 font-medium'
                        : 'text-gray-800 font-medium'
                    }`}
                  >
                    <span
                      className={`font-semibold ${
                        move.color === 'red' ? 'text-red-600' : 'text-gray-800'
                      }`}
                    >
                      {move.color === 'red' ? '红' : '黑'}
                    </span>{' '}
                    {move.notation}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(MoveHistoryComponent);
