import { memo } from 'react';

interface GameControlsProps {
  onUndo: () => void;
  onReset: () => void;
  onSave: () => void;
  onLoad: () => void;
  canUndo: boolean;
  canLoad: boolean;
}

function GameControlsComponent({
  onUndo,
  onReset,
  onSave,
  onLoad,
  canUndo,
  canLoad,
}: GameControlsProps) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        悔棋
      </button>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        重新开始
      </button>
      <button
        onClick={onSave}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        保存游戏
      </button>
      <button
        onClick={onLoad}
        disabled={!canLoad}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        加载游戏
      </button>
    </div>
  );
}

export default memo(GameControlsComponent);

