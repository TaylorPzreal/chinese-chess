import { useMemo, memo, useState, useEffect } from 'react';
import { Line, Rect, Text, Circle } from 'react-konva';
import type { Position, Piece } from '../types/chess';
import type { BoardThemeId } from '../types/boardTheme';
import { getBoardTheme } from '../utils/boardThemes';
import { BOARD_COLS, BOARD_ROWS, getIntersectionPosition, getBoardArea } from '../utils/coordinates';
import marbleTexture from '../assets/dalishi.png';

interface BoardProps {
  board: (Piece | null)[][];
  selectedPosition: Position | null;
  validMoves: Position[];
  draggingPiece?: Piece | null;
  stageWidth: number;
  stageHeight: number;
  pieceRadius?: number;
  boardThemeId: BoardThemeId;
}

function BoardComponent({
  board,
  selectedPosition,
  validMoves,
  draggingPiece,
  stageWidth,
  stageHeight,
  pieceRadius = 30,
  boardThemeId,
}: BoardProps) {
  // 获取棋盘绘制区域（考虑边距）
  const area = useMemo(() => getBoardArea(stageWidth, stageHeight, pieceRadius), [stageWidth, stageHeight, pieceRadius]);
  const { boardX, boardY, boardWidth, boardHeight, cellWidth, cellHeight } = area;

  // 根据主题切换棋盘整体风格
  const theme = getBoardTheme(boardThemeId);
  const { lineColor, labelColor, labelOpacity, numberOpacity, backgroundType, backgroundColor, gradientStops } = theme;

  // 纹理背景图片（例如大理石纹理）
  const [textureImage, setTextureImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (backgroundType !== 'texture') return;

    const img = new Image();
    img.src = marbleTexture;
    img.onload = () => {
      setTextureImage(img);
    };
  }, [backgroundType]);

  // 生成所有交叉点
  const intersections = useMemo(() => {
    const points: Position[] = [];
    for (let y = 0; y < BOARD_ROWS; y++) {
      for (let x = 0; x < BOARD_COLS; x++) {
        points.push({ x, y });
      }
    }
    return points;
  }, []);

  // 绘制横线
  const horizontalLines = useMemo(() => {
    return Array.from({ length: BOARD_ROWS }, (_, y) => {
      const yPos = boardY + y * cellHeight;
      return (
        <Line
          key={`h-${y}`}
          points={[boardX, yPos, boardX + boardWidth, yPos]}
          stroke={lineColor}
          strokeWidth={2}
          lineCap="round"
        />
      );
    });
  }, [boardX, boardY, boardWidth, cellHeight, lineColor]);

  // 绘制竖线（保留两边的竖线完整，中间竖线在楚河汉界区域断开）
  const verticalLines = useMemo(() => {
    const riverTopY = boardY + 4 * cellHeight; // 河界上方（y=4）
    const riverBottomY = boardY + 5 * cellHeight; // 河界下方（y=5）
    
    return Array.from({ length: BOARD_COLS }, (_, x) => {
      const xPos = boardX + x * cellWidth;
      
      // 两边的竖线（x=0 和 x=8）保持完整
      if (x === 0 || x === BOARD_COLS - 1) {
        return (
          <Line
            key={`v-${x}`}
            points={[xPos, boardY, xPos, boardY + boardHeight]}
            stroke={lineColor}
            strokeWidth={2}
            lineCap="round"
          />
        );
      }
      
      // 中间竖线在河界处断开
      const topLine = (
        <Line
          key={`v-top-${x}`}
          points={[xPos, boardY, xPos, riverTopY]}
          stroke={lineColor}
          strokeWidth={2}
          lineCap="round"
        />
      );
      const bottomLine = (
        <Line
          key={`v-bottom-${x}`}
          points={[xPos, riverBottomY, xPos, boardY + boardHeight]}
          stroke={lineColor}
          strokeWidth={2}
          lineCap="round"
        />
      );
      return [topLine, bottomLine];
    }).flat();
  }, [boardX, boardY, boardHeight, cellWidth, cellHeight, lineColor]);

  // 绘制九宫格斜线（交叉线）
  const palaceLines = useMemo(() => {
    const lines = [];
    
    // 上方九宫格（黑方，y: 0-2）
    // 左上角到右下角的对角线
    const topLeft = { x: boardX + 3 * cellWidth, y: boardY };
    const topRight = { x: boardX + 5 * cellWidth, y: boardY };
    const topBottomLeft = { x: boardX + 3 * cellWidth, y: boardY + 2 * cellHeight };
    const topBottomRight = { x: boardX + 5 * cellWidth, y: boardY + 2 * cellHeight };
    
    // 从左上(3,0)到右下(5,2)
    lines.push(
      <Line
        key="palace-top-diag-1"
        points={[topLeft.x, topLeft.y, topBottomRight.x, topBottomRight.y]}
        stroke={lineColor}
        strokeWidth={2}
        lineCap="round"
      />
    );
    // 从右上(5,0)到左下(3,2)
    lines.push(
      <Line
        key="palace-top-diag-2"
        points={[topRight.x, topRight.y, topBottomLeft.x, topBottomLeft.y]}
        stroke={lineColor}
        strokeWidth={2}
        lineCap="round"
      />
    );
    
    // 下方九宫格（红方，y: 7-9）
    // 左上角到右下角的对角线
    const bottomTopLeft = { x: boardX + 3 * cellWidth, y: boardY + 7 * cellHeight };
    const bottomTopRight = { x: boardX + 5 * cellWidth, y: boardY + 7 * cellHeight };
    const bottomLeft = { x: boardX + 3 * cellWidth, y: boardY + 9 * cellHeight };
    const bottomRight = { x: boardX + 5 * cellWidth, y: boardY + 9 * cellHeight };
    
    // 从左上(3,7)到右下(5,9)
    lines.push(
      <Line
        key="palace-bottom-diag-1"
        points={[bottomTopLeft.x, bottomTopLeft.y, bottomRight.x, bottomRight.y]}
        stroke={lineColor}
        strokeWidth={2}
        lineCap="round"
      />
    );
    // 从右上(5,7)到左下(3,9)
    lines.push(
      <Line
        key="palace-bottom-diag-2"
        points={[bottomTopRight.x, bottomTopRight.y, bottomLeft.x, bottomLeft.y]}
        stroke={lineColor}
        strokeWidth={2}
        lineCap="round"
      />
    );
    
    return lines;
  }, [boardX, boardY, cellWidth, cellHeight, lineColor]);

  // 绘制竖线数字标记
  const columnNumbers = useMemo(() => {
    return Array.from({ length: BOARD_COLS }, (_, x) => {
      // 上方（黑方）：从左到右是1-9路
      const topNumber = x + 1;
      const topX = boardX + x * cellWidth;
      const topY = boardY - 40; // 在棋盘上方，更靠近边缘，避免被棋子遮挡
      
      // 下方（红方）：从右到左是1-9路
      const numZh = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
      const bottomNumber = numZh[BOARD_COLS - x - 1];
      const bottomX = boardX + x * cellWidth;
      const bottomY = boardY + boardHeight + 40; // 在棋盘下方，更靠近边缘，避免被棋子遮挡
      
      return [
        <Text
          key={`top-number-${x}`}
          x={topX}
          y={topY}
          text={String(topNumber)}
          fontSize={18}
          fontStyle="bold"
          fill={labelColor}
          opacity={numberOpacity}
          align="center"
          verticalAlign="middle"
          offsetX={9}
          offsetY={9}
          listening={false}
        />,
        <Text
          key={`bottom-number-${x}`}
          x={bottomX}
          y={bottomY}
          text={String(bottomNumber)}
          fontSize={18}
          fontStyle="bold"
          fill={labelColor}
          opacity={numberOpacity}
          align="center"
          verticalAlign="middle"
          offsetX={9}
          offsetY={9}
          listening={false}
        />,
      ];
    }).flat();
  }, [boardX, boardY, boardHeight, cellWidth, labelColor, numberOpacity]);

  // 绘制交叉点提示
  const intersectionHints = useMemo(() => {
    return intersections.map((pos) => {
      const { x, y } = getIntersectionPosition(pos.x, pos.y, stageWidth, stageHeight, pieceRadius);
      const piece = board[pos.y][pos.x];
      const isSelected = selectedPosition?.x === pos.x && selectedPosition?.y === pos.y;
      const isValidMove = validMoves.some((move) => move.x === pos.x && move.y === pos.y);
      const isDraggingOver = draggingPiece && !piece;

      let fill = 'transparent';
      let opacity = 0;
      let radius = 6;

      if (isSelected) {
        fill = '#3B82F6';
        opacity = 0.8;
        radius = 8;
      } else if (isValidMove) {
        fill = '#10B981';
        opacity = 0.6;
        radius = 7;
      } else if (isDraggingOver) {
        fill = '#FCD34D';
        opacity = 0.6;
        radius = 7;
      }

      return (
        <Circle
          key={`hint-${pos.x}-${pos.y}`}
          x={x}
          y={y}
          radius={radius}
          fill={fill}
          opacity={opacity}
          listening={false}
        />
      );
    });
  }, [intersections, board, selectedPosition, validMoves, draggingPiece, stageWidth, stageHeight, pieceRadius]);

  return (
    <>
      {/* 棋盘背景 */}
      {backgroundType === 'texture' && textureImage ? (
        <Rect
          x={0}
          y={0}
          width={stageWidth}
          height={stageHeight}
          fillPatternImage={textureImage}
          fillPatternScale={{
            x: stageWidth / textureImage.width,
            y: stageHeight / textureImage.height,
          }}
        />
      ) : backgroundType === 'gradient' && gradientStops ? (
        <Rect
          x={0}
          y={0}
          width={stageWidth}
          height={stageHeight}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: stageWidth, y: stageHeight }}
          fillLinearGradientColorStops={gradientStops.flatMap((s) => [s.offset, s.color])}
        />
      ) : (
        <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill={backgroundColor || '#FEF3C7'} />
      )}

      {/* 横线 */}
      {horizontalLines}

      {/* 竖线 */}
      {verticalLines}

      {/* 九宫格斜线 */}
      {palaceLines}

      {/* 楚河汉界文字 */}
      <Text
        x={boardX + boardWidth * 0.25}
        y={boardY + 4.5 * cellHeight}
        text="楚河"
        fontSize={28}
        fontStyle="bold"
        fontFamily="'KaiTi', '楷体', 'STKaiti'"
        fill={labelColor}
        opacity={labelOpacity}
        align="center"
        verticalAlign="middle"
        offsetX={28}
        offsetY={14}
        listening={false}
      />
      <Text
        x={boardX + boardWidth * 0.75}
        y={boardY + 4.5 * cellHeight}
        text="汉界"
        fontSize={28}
        fontStyle="bold"
        fontFamily="'KaiTi', '楷体', 'STKaiti'"
        fill={labelColor}
        opacity={labelOpacity}
        align="center"
        verticalAlign="middle"
        offsetX={28}
        offsetY={14}
        listening={false}
      />

      {/* 竖线数字标记 */}
      {columnNumbers}

      {/* 交叉点提示 */}
      {intersectionHints}
    </>
  );
}

export default memo(BoardComponent);
