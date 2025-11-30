import { memo } from 'react';

export type GameMode = 'ai' | 'human' | 'load';

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
  canLoad: boolean;
}

function GameModeSelectorComponent({ onSelectMode, canLoad }: GameModeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-amber-200 py-8 px-4 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-amber-900">
          中国象棋
        </h1>
        <div className="space-y-4">
          <button
            onClick={() => onSelectMode('ai')}
            className="w-full px-6 py-4 bg-amber-600 text-white rounded-lg font-semibold text-lg hover:bg-amber-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            AI对战
          </button>
          <button
            onClick={() => onSelectMode('human')}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            人人对战
          </button>
          <button
            onClick={() => onSelectMode('load')}
            disabled={!canLoad}
            className={`w-full px-6 py-4 rounded-lg font-semibold text-lg transition-all shadow-md ${
              canLoad
                ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            加载游戏
          </button>
        </div>
        {!canLoad && (
          <p className="text-center text-gray-500 text-sm mt-4">
            暂无保存的游戏
          </p>
        )}
      </div>
    </div>
  );
}

export default memo(GameModeSelectorComponent);

