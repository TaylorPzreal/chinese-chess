import { memo, useRef, useEffect, useCallback } from 'react';
import { Group, Circle, Text } from 'react-konva';
import type { Piece as PieceType, Position } from '../types/chess';
import { getPieceName } from '../types/chess';
import { playSelectSound } from '../utils/sounds';
import { boardToScreen, screenToBoard } from '../utils/coordinates';

interface PieceProps {
  piece: PieceType;
  position: Position;
  isSelected: boolean;
  onSelect: (piece: PieceType) => void;
  onDragStart: (piece: PieceType, event: any) => void;
  onDragEnd: (piece: PieceType, newPosition: Position | null) => boolean;
  isDragging?: boolean;
  stageWidth: number;
  stageHeight: number;
}

function PieceComponent({
  piece,
  position,
  isSelected,
  onSelect,
  onDragStart,
  onDragEnd,
  isDragging = false,
  stageWidth,
  stageHeight,
}: PieceProps) {
  const groupRef = useRef<any>(null);
  const pieceName = getPieceName(piece);
  const isRed = piece.color === 'red';

  // 计算屏幕坐标
  const screenPos = boardToScreen(position.x, position.y, stageWidth, stageHeight);

  // 处理点击
  const handleClick = useCallback(
    (e: any) => {
      e.cancelBubble = true;
      playSelectSound();
      onSelect(piece);
    },
    [onSelect, piece]
  );

  // 处理拖拽开始
  const handleDragStart = useCallback(
    (e: any) => {
      e.cancelBubble = true;
      onDragStart(piece, e);
    },
    [onDragStart, piece]
  );

  // 处理拖拽结束
  const handleDragEnd = useCallback(
    (e: any) => {
      e.cancelBubble = true;
      const node = e.target;
      const stage = node.getStage();
      const pointerPos = stage.getPointerPosition();
      
      if (pointerPos) {
        // 使用统一的坐标转换函数
        const boardPos = screenToBoard(pointerPos.x, pointerPos.y, stageWidth, stageHeight);
        
        if (boardPos) {
          // 先验证移动是否合法
          // 如果移动成功，onDragEnd 会返回 true，然后通过 position prop 更新来移动棋子
          // 如果移动失败，onDragEnd 会返回 false，棋子会保持在原位置
          const moveSuccess = onDragEnd(piece, boardPos);
          
          if (moveSuccess) {
            // 移动成功，对齐到交叉点（position prop 会更新，useEffect 会处理动画）
            const snapPos = boardToScreen(boardPos.x, boardPos.y, stageWidth, stageHeight);
            node.position({ x: snapPos.x, y: snapPos.y });
          } else {
            // 移动失败，立即移回原位置
            const originalPos = boardToScreen(position.x, position.y, stageWidth, stageHeight);
            node.position({ x: originalPos.x, y: originalPos.y });
          }
        } else {
          // 超出范围，移回原位置
          const originalPos = boardToScreen(position.x, position.y, stageWidth, stageHeight);
          node.position({ x: originalPos.x, y: originalPos.y });
          onDragEnd(piece, null);
        }
      } else {
        // 没有指针位置，移回原位置
        const originalPos = boardToScreen(position.x, position.y, stageWidth, stageHeight);
        node.position({ x: originalPos.x, y: originalPos.y });
        onDragEnd(piece, null);
      }
    },
    [onDragEnd, piece, position, stageWidth, stageHeight]
  );

  // 动画：移动到新位置（仅在位置真正改变时）
  useEffect(() => {
    if (groupRef.current && !isDragging) {
      const newPos = boardToScreen(position.x, position.y, stageWidth, stageHeight);
      const currentPos = groupRef.current.position();
      
      // 计算位置差异
      const dx = Math.abs(currentPos.x - newPos.x);
      const dy = Math.abs(currentPos.y - newPos.y);
      
      // 只有当位置真正改变时才动画或更新
      if (dx > 1 || dy > 1) {
        // 如果差异很大，可能是移动失败需要恢复，使用动画
        groupRef.current.to({
          x: newPos.x,
          y: newPos.y,
          duration: 0.2,
          easing: (t: number) => {
            // 缓动函数 (ease-out)
            return t * (2 - t);
          },
        });
      } else if (dx > 0.1 || dy > 0.1) {
        // 小差异，直接设置位置（避免不必要的动画）
        groupRef.current.position({ x: newPos.x, y: newPos.y });
      }
    }
  }, [position, stageWidth, stageHeight, isDragging]);

  // 棋子半径
  const radius = 24;

  // 棋子颜色
  const fillColor = isRed
    ? ['#EF4444', '#DC2626'] // 红色渐变
    : ['#1F2937', '#111827']; // 黑色渐变

  return (
    <Group
      ref={groupRef}
      x={screenPos.x}
      y={screenPos.y}
      draggable
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      opacity={isDragging ? 0.7 : 1}
      scaleX={isDragging ? 1.1 : 1}
      scaleY={isDragging ? 1.1 : 1}
    >
      {/* 选中状态的外圈 */}
      {isSelected && (
        <Circle
          x={0}
          y={0}
          radius={radius + 6}
          stroke="#3B82F6"
          strokeWidth={4}
          fill="transparent"
          listening={false}
        />
      )}

      {/* 棋子背景（圆形） */}
      <Circle
        x={0}
        y={0}
        radius={radius}
        fill={fillColor[0]}
        shadowColor="rgba(0, 0, 0, 0.3)"
        shadowBlur={8}
        shadowOffset={{ x: 2, y: 2 }}
        shadowOpacity={0.6}
      />

      {/* 棋子边框 */}
      <Circle
        x={0}
        y={0}
        radius={radius}
        stroke={fillColor[1]}
        strokeWidth={3}
        listening={false}
      />

      {/* 棋子文字 */}
      <Text
        x={0}
        y={0}
        text={pieceName}
        fontSize={20}
        fontStyle="bold"
        fill="white"
        align="center"
        verticalAlign="middle"
        offsetX={10}
        offsetY={10}
        listening={false}
      />
    </Group>
  );
}

export default memo(PieceComponent);
