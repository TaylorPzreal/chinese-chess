import { memo, useState } from 'react';
import type { AIDifficulty } from '../utils/ai';
import type { PieceColor } from '../types/chess';

interface AIConfigProps {
  onStart: (difficulty: AIDifficulty, aiColor: PieceColor) => void;
  onBack: () => void;
}

function AIConfigComponent({ onStart, onBack }: AIConfigProps) {
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [aiColor, setAIColor] = useState<PieceColor>('black');

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-amber-200 py-8 px-4 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-900">
          AI对战配置
        </h1>
        
        {/* AI难度选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-amber-900 mb-3">
            AI难度
          </label>
          <div className="flex gap-2">
            {(['simple', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  difficulty === diff
                    ? 'bg-amber-600 text-white shadow-md scale-105'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                {diff === 'simple' && '简单'}
                {diff === 'medium' && '中等'}
                {diff === 'hard' && '困难'}
              </button>
            ))}
          </div>
        </div>

        {/* AI颜色选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-amber-900 mb-3">
            AI控制
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setAIColor('red')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                aiColor === 'red'
                  ? 'bg-red-600 text-white shadow-md scale-105'
                  : 'bg-red-100 text-red-900 hover:bg-red-200'
              }`}
            >
              红方
            </button>
            <button
              onClick={() => setAIColor('black')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                aiColor === 'black'
                  ? 'bg-gray-800 text-white shadow-md scale-105'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              黑方
            </button>
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-all"
          >
            返回
          </button>
          <button
            onClick={() => onStart(difficulty, aiColor)}
            className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all shadow-md hover:shadow-lg"
          >
            开始游戏
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(AIConfigComponent);

