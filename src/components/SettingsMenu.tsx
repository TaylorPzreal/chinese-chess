import { memo, useState } from 'react';
import type { PieceThemeId } from '../types/pieceTheme';
import type { BoardThemeId } from '../types/boardTheme';
import { getAllThemes } from '../utils/pieceThemes';
import { getAllBoardThemes } from '../utils/boardThemes';

interface SettingsMenuProps {
  pieceThemeId: PieceThemeId;
  boardThemeId: BoardThemeId;
  pieceRadius: number;
  onPieceThemeChange: (themeId: PieceThemeId) => void;
  onBoardThemeChange: (themeId: BoardThemeId) => void;
  onPieceRadiusChange: (radius: number) => void;
}

function SettingsMenuComponent({
  pieceThemeId,
  boardThemeId,
  pieceRadius,
  onPieceThemeChange,
  onBoardThemeChange,
  onPieceRadiusChange,
}: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const themes = getAllThemes();
  const boardThemes = getAllBoardThemes();

  return (
    <>
      {/* 设置按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
        title="设置"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-amber-900"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* 设置菜单遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 设置菜单 */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* 关闭按钮 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-amber-900">设置</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 棋子大小选择器 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-amber-900">
              棋子大小
            </h3>
            <div className="flex gap-3 items-center">
              <span className="text-sm text-amber-700">小</span>
              <input
                type="range"
                min="16"
                max="40"
                step="2"
                value={pieceRadius}
                onChange={(e) => onPieceRadiusChange(Number(e.target.value))}
                className="flex-1 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <span className="text-sm text-amber-700">大</span>
              <span className="ml-4 text-sm font-medium text-amber-900 min-w-12 text-center">
                {pieceRadius}px
              </span>
            </div>
          </div>

          {/* 棋子主题选择器 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-amber-900">
              棋子主题
            </h3>
            <div className="flex gap-2 flex-wrap">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onPieceThemeChange(theme.id)}
                  className={`px-3 py-2 rounded-lg transition-all text-sm ${
                    pieceThemeId === theme.id
                      ? 'bg-amber-600 text-white shadow-md scale-105'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  <div className="font-medium">{theme.name}</div>
                  <div className="text-xs opacity-75">{theme.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 棋盘主题选择器 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-amber-900">
              棋盘主题
            </h3>
            <div className="flex gap-2 flex-wrap">
              {boardThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onBoardThemeChange(theme.id)}
                  className={`px-3 py-2 rounded-lg transition-all text-sm ${
                    boardThemeId === theme.id
                      ? 'bg-amber-600 text-white shadow-md scale-105'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  <div className="font-medium">{theme.name}</div>
                  <div className="text-xs opacity-75">{theme.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(SettingsMenuComponent);

