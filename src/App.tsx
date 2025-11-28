import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Stage, Layer } from 'react-konva';
import { useChessGame } from './hooks/useChessGame';
import Board from './components/Board';
import Piece from './components/Piece';
import GameInfo from './components/GameInfo';
import GameControls from './components/GameControls';
import type { Piece as PieceType, Position } from './types/chess';
import { calculateStageSize, screenToBoard } from './utils/coordinates';
import { isInCheck } from './utils/rules';
import { initSpeechSynthesis } from './utils/sounds';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 600, height: 667 });

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
  } = useChessGame();

  const [draggingPiece, setDraggingPiece] = useState<PieceType | null>(null);

  // 当前执棋一方是否正处于“被将军”状态（用于显示特效）
  const inCheck = useMemo(
    () => isInCheck(gameState.board, gameState.currentPlayer),
    [gameState.board, gameState.currentPlayer]
  );

  // 初始化语音合成
  useEffect(() => {
    initSpeechSynthesis();
  }, []);

  // 响应式布局：计算Stage尺寸
  useEffect(() => {
    const updateStageSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const { width, height } = calculateStageSize(
          container.clientWidth,
          container.clientHeight
        );
        setStageSize({ width, height });
      }
    };

    updateStageSize();
    window.addEventListener('resize', updateStageSize);
    return () => window.removeEventListener('resize', updateStageSize);
  }, []);

  const handlePositionClick = useCallback(
    (position: Position) => {
      selectPosition(position);
    },
    [selectPosition]
  );

  const handlePieceDragEnd = useCallback(
    (piece: PieceType, newPosition: Position | null): boolean => {
      const currentDraggingPiece = draggingPiece;
      setDraggingPiece(null);
      
      if (!newPosition) {
        // 没有有效位置，棋子已经在 Piece 组件中回到原位置
        return false;
      }
      
      if (!currentDraggingPiece || currentDraggingPiece.id !== piece.id) {
        return false;
      }
      
      const from = piece.position;
      
      // 检查是否是当前玩家的棋子
      if (piece.color !== gameState.currentPlayer) {
        return false;
      }
      
      // 检查目标位置是否与当前位置相同
      if (from.x === newPosition.x && from.y === newPosition.y) {
        return false;
      }
      
      // 使用完整的规则验证并执行移动
      // 如果移动失败，makeMove 返回 false，棋子会保持在原位置
      const moveSuccess = makeMove(from, newPosition);
      
      // 返回移动是否成功，让 Piece 组件知道是否需要恢复位置
      return moveSuccess;
    },
    [draggingPiece, gameState.currentPlayer, makeMove]
  );

  const handlePieceSelect = useCallback(
    (piece: PieceType) => {
      selectPosition(piece.position);
    },
    [selectPosition]
  );

  const handleDragStart = useCallback(
    (piece: PieceType) => {
      if (piece.color === gameState.currentPlayer) {
        setDraggingPiece(piece);
        selectPosition(piece.position);
      }
    },
    [gameState.currentPlayer, selectPosition]
  );


  const handleSave = useCallback(() => {
    if (saveGame()) {
      alert('游戏已保存！');
    } else {
      alert('保存失败，请重试');
    }
  }, [saveGame]);

  const handleLoad = useCallback(() => {
    if (loadGame()) {
      alert('游戏已加载！');
    } else {
      alert('加载失败：没有找到保存的游戏或数据格式错误');
    }
  }, [loadGame]);

  // 处理Stage点击（用于点击空位移动棋子）
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
        stageSize.height
      );

      if (boardPos) {
        handlePositionClick(boardPos);
      }
    },
    [handlePositionClick, stageSize]
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-amber-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 text-amber-900">
          中国象棋
        </h1>

        <GameInfo gameState={gameState} inCheck={inCheck} />

        <div className="relative mb-4">
          <div
            ref={containerRef}
            className="relative w-full max-w-2xl mx-auto aspect-[9/10] bg-amber-50 border-4 border-amber-800 rounded-lg shadow-2xl overflow-hidden"
          >
            <Stage
              width={stageSize.width}
              height={stageSize.height}
              onClick={handleStageClick}
              className="cursor-pointer"
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
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>

        <GameControls
          onUndo={undoMove}
          onReset={resetGame}
          onSave={handleSave}
          onLoad={handleLoad}
          canUndo={gameState.moves.length > 0}
          canLoad={hasSavedGame()}
        />
      </div>
    </div>
  );
}

export default App;
