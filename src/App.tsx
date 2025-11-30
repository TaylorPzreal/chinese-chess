import { useState, useCallback, useRef, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { useChessGame } from './hooks/useChessGame';
import Board from './components/Board';
import Piece from './components/Piece';
import GameInfo from './components/GameInfo';
import GameControls from './components/GameControls';
import MoveHistory from './components/MoveHistory';
import EffectOverlay from './components/EffectOverlay';
import GameModeSelector, { type GameMode } from './components/GameModeSelector';
import AIConfig from './components/AIConfig';
import SettingsMenu from './components/SettingsMenu';
import type { Piece as PieceType, Position } from './types/chess';
import { screenToBoard, DEFAULT_PIECE_RADIUS } from './utils/coordinates';
import { initSpeechSynthesis } from './utils/sounds';
import type { PieceThemeId } from './types/pieceTheme';
import type { BoardThemeId } from './types/boardTheme';
import type { AIDifficulty } from './utils/ai';
import type { PieceColor } from './types/chess';

type AppMode = 'select' | 'ai-config' | 'playing';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 600, height: 667 });
  const [appMode, setAppMode] = useState<AppMode>('select');
  
  const [pieceThemeId, setPieceThemeId] = useState<PieceThemeId>(() => {
    const saved = localStorage.getItem('chineseChessPieceTheme');
    return (saved as PieceThemeId) || 'neumorphic';
  });
  const [pieceRadius, setPieceRadius] = useState<number>(() => {
    const saved = localStorage.getItem('chineseChessPieceRadius');
    return saved ? Number(saved) : DEFAULT_PIECE_RADIUS;
  });
  const [boardThemeId, setBoardThemeId] = useState<BoardThemeId>(() => {
    const saved = localStorage.getItem('chineseChessBoardTheme');
    return (saved as BoardThemeId) || 'paper';
  });

  // 保存主题选择
  const handleThemeChange = useCallback((themeId: PieceThemeId) => {
    setPieceThemeId(themeId);
    localStorage.setItem('chineseChessPieceTheme', themeId);
  }, []);

  const handleBoardThemeChange = useCallback((themeId: BoardThemeId) => {
    setBoardThemeId(themeId);
    localStorage.setItem('chineseChessBoardTheme', themeId);
  }, []);

  // 保存棋子大小选择
  const handlePieceRadiusChange = useCallback((radius: number) => {
    setPieceRadius(radius);
    localStorage.setItem('chineseChessPieceRadius', String(radius));
  }, []);

  const {
    gameState,
    pieces,
    selectPosition,
    makeMove,
    undoMove,
    resetGame,
    isPositionSelected,
    saveGame,
    loadGame,
    hasSavedGame,
    aiMode,
    aiDifficulty,
    aiColor,
    isAIThinking,
    setAIMode,
    setAIDifficulty,
    setAIColor,
    effectTrigger,
    clearEffectTrigger,
  } = useChessGame();

  const [draggingPiece, setDraggingPiece] = useState<PieceType | null>(null);

  // 初始化语音合成
  useEffect(() => {
    initSpeechSynthesis();
  }, []);

  // 响应式布局：计算Stage尺寸
  useEffect(() => {
    const updateStageSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        // 直接使用容器的实际尺寸，因为容器已经通过aspect-[9/10]保持了正确的比例
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width > 0 && height > 0) {
          setStageSize({ width, height });
        }
      }
    };

    // 延迟执行以确保DOM已渲染
    const timeoutId = setTimeout(updateStageSize, 0);
    updateStageSize();
    window.addEventListener('resize', updateStageSize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateStageSize);
    };
  }, [appMode]); // 当appMode改变时重新计算（从选择界面进入游戏界面时）

  // 处理模式选择
  const handleModeSelect = useCallback((mode: GameMode) => {
    if (mode === 'load') {
      if (loadGame()) {
        setAppMode('playing');
      } else {
        alert('加载失败：没有找到保存的游戏或数据格式错误');
      }
    } else if (mode === 'ai') {
      setAppMode('ai-config');
    } else if (mode === 'human') {
      setAIMode(false);
      setAIColor(null);
      resetGame();
      setAppMode('playing');
    }
  }, [loadGame, setAIMode, setAIColor, resetGame]);

  // 处理AI配置完成
  const handleAIStart = useCallback((difficulty: AIDifficulty, color: PieceColor) => {
    setAIMode(true);
    setAIDifficulty(difficulty);
    setAIColor(color);
    resetGame();
    setAppMode('playing');
  }, [setAIMode, setAIDifficulty, setAIColor, resetGame]);

  // 返回主菜单
  const handleBackToMenu = useCallback(() => {
    setAppMode('select');
    setAIMode(false);
    setAIColor(null);
  }, [setAIMode, setAIColor]);

  const handlePositionClick = useCallback(
    (position: Position) => {
      selectPosition(position);
    },
    [selectPosition]
  );

  const handlePieceDragEnd = useCallback(
    (piece: PieceType, newPosition: Position | null): boolean => {
      if (aiMode && aiColor === gameState.currentPlayer) {
        return false;
      }
      if (isAIThinking) {
        return false;
      }
      
      const currentDraggingPiece = draggingPiece;
      setDraggingPiece(null);
      
      if (!newPosition) {
        return false;
      }
      
      if (!currentDraggingPiece || currentDraggingPiece.id !== piece.id) {
        return false;
      }
      
      const from = piece.position;
      
      if (piece.color !== gameState.currentPlayer) {
        return false;
      }
      
      if (from.x === newPosition.x && from.y === newPosition.y) {
        return false;
      }
      
      const moveSuccess = makeMove(from, newPosition);
      return moveSuccess;
    },
    [draggingPiece, gameState.currentPlayer, makeMove, aiMode, aiColor, isAIThinking]
  );

  const handlePieceSelect = useCallback(
    (piece: PieceType) => {
      selectPosition(piece.position);
    },
    [selectPosition]
  );

  const handleDragStart = useCallback(
    (piece: PieceType) => {
      if (aiMode && aiColor === gameState.currentPlayer) {
        return;
      }
      if (isAIThinking) {
        return;
      }
      if (piece.color === gameState.currentPlayer) {
        setDraggingPiece(piece);
        selectPosition(piece.position);
      }
    },
    [gameState.currentPlayer, selectPosition, aiMode, aiColor, isAIThinking]
  );

  const handleSave = useCallback(() => {
    if (saveGame()) {
      alert('游戏已保存！');
    } else {
      alert('保存失败，请重试');
    }
  }, [saveGame]);

  // 处理Stage点击
  const handleStageClick = useCallback(
    (e: any) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      const boardPos = screenToBoard(
        pointerPos.x,
        pointerPos.y,
        stageSize.width,
        stageSize.height,
        pieceRadius
      );

      if (boardPos) {
        handlePositionClick(boardPos);
      }
    },
    [handlePositionClick, stageSize, pieceRadius]
  );

  // 模式选择界面
  if (appMode === 'select') {
    return <GameModeSelector onSelectMode={handleModeSelect} canLoad={hasSavedGame()} />;
  }

  // AI配置界面
  if (appMode === 'ai-config') {
    return <AIConfig onStart={handleAIStart} onBack={() => setAppMode('select')} />;
  }

  // 游戏界面
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-amber-200 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 顶部标题 */}
        <h1 className="text-4xl font-bold text-center mb-6 text-amber-900">
          中国象棋
        </h1>

        <div className="flex items-start gap-4">
          {/* 左侧：棋盘区域 */}
          <div className="flex-1">
            <div className="relative mb-4">
              <div
                ref={containerRef}
                className="relative w-full aspect-[9/10] bg-amber-50 border-4 border-amber-800 rounded-lg shadow-2xl overflow-hidden"
              >
                <Stage
                  width={stageSize.width || 600}
                  height={stageSize.height || 667}
                  onClick={handleStageClick}
                  className="cursor-pointer"
                  style={{ width: '100%', height: '100%' }}
                >
                  {/* 棋盘层 */}
                  <Layer>
                    <Board
                      board={gameState.board}
                      selectedPosition={gameState.selectedPosition}
                      validMoves={gameState.validMoves}
                      draggingPiece={draggingPiece}
                      stageWidth={stageSize.width}
                      stageHeight={stageSize.height}
                      pieceRadius={pieceRadius}
                      boardThemeId={boardThemeId}
                    />
                  </Layer>

                  {/* 棋子层 */}
                  <Layer>
                    {pieces.map((piece) => (
                      <Piece
                        key={piece.id}
                        piece={piece}
                        position={piece.position}
                        isSelected={isPositionSelected(piece.position)}
                        onSelect={handlePieceSelect}
                        onDragStart={handleDragStart}
                        onDragEnd={handlePieceDragEnd}
                        isDragging={draggingPiece?.id === piece.id}
                        stageWidth={stageSize.width}
                        stageHeight={stageSize.height}
                        themeId={pieceThemeId}
                        pieceRadius={pieceRadius}
                      />
                    ))}
                  </Layer>
                </Stage>
                
                {/* 动效层 */}
                <EffectOverlay
                  width={stageSize.width}
                  height={stageSize.height}
                  effectType={effectTrigger}
                  onComplete={clearEffectTrigger}
                />
              </div>
            </div>
          </div>

          {/* 右侧：游戏信息、操作按钮和走棋记录 */}
          <div className="w-80 flex-shrink-0 space-y-4">
            <GameInfo 
              gameState={gameState} 
              aiMode={aiMode}
              aiDifficulty={aiDifficulty}
              aiColor={aiColor}
              isAIThinking={isAIThinking}
            />
            
            <GameControls
              onUndo={undoMove}
              onReset={resetGame}
              onSave={handleSave}
              onLoad={() => handleModeSelect('load')}
              canUndo={gameState.moves.length > 0}
              canLoad={hasSavedGame()}
            />

            {/* 返回主菜单按钮 */}
            <div className="text-center">
              <button
                onClick={handleBackToMenu}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                返回主菜单
              </button>
            </div>

            <MoveHistory moves={gameState.moves} />
          </div>
        </div>
      </div>

      {/* 设置菜单 */}
      <SettingsMenu
        pieceThemeId={pieceThemeId}
        boardThemeId={boardThemeId}
        pieceRadius={pieceRadius}
        onPieceThemeChange={handleThemeChange}
        onBoardThemeChange={handleBoardThemeChange}
        onPieceRadiusChange={handlePieceRadiusChange}
      />
    </div>
  );
}

export default App;
