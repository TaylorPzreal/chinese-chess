# 中国象棋项目架构设计文档

## 项目概述

这是一个基于 React + TypeScript 开发的在线中国象棋游戏，支持人机对战和双人对战模式。项目使用 Konva 进行 2D 图形渲染，实现了完整的象棋规则引擎、AI 对手、主题系统、音效反馈等功能。

## 技术栈

- **前端框架**: React 19.2.0
- **类型系统**: TypeScript 5.9.3
- **图形渲染**: Konva 10.0.12 + react-konva 19.2.1
- **样式方案**: Tailwind CSS 4.1.17
- **构建工具**: Vite 7.2.4
- **包管理**: Yarn

## 项目结构

```
src/
├── components/          # UI 组件层
│   ├── AIConfig.tsx    # AI 配置界面
│   ├── Board.tsx       # 棋盘组件
│   ├── EffectOverlay.tsx # 动效覆盖层
│   ├── GameControls.tsx  # 游戏控制按钮
│   ├── GameInfo.tsx    # 游戏信息显示
│   ├── GameModeSelector.tsx # 游戏模式选择器
│   ├── MoveHistory.tsx # 走棋历史记录
│   ├── Piece.tsx       # 棋子组件
│   └── SettingsMenu.tsx # 设置菜单
├── hooks/              # React Hooks
│   └── useChessGame.ts # 游戏状态管理核心 Hook
├── types/              # TypeScript 类型定义
│   ├── chess.ts        # 游戏核心类型
│   ├── pieceTheme.ts   # 棋子主题类型
│   └── boardTheme.ts   # 棋盘主题类型
├── utils/              # 工具函数层
│   ├── ai.ts           # AI 算法实现
│   ├── rules.ts        # 象棋规则引擎
│   ├── coordinates.ts  # 坐标转换工具
│   ├── notation.ts     # 中文记谱法
│   ├── sounds.ts       # 音效和语音
│   ├── pieceThemes.tsx # 棋子主题实现
│   └── boardThemes.ts  # 棋盘主题实现
├── assets/             # 静态资源
│   └── dalishi.png     # 大理石纹理
├── App.tsx             # 应用主组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## 核心架构设计

### 1. 数据模型层 (`types/chess.ts`)

定义了游戏的核心数据结构：

- **Piece**: 棋子对象（类型、颜色、位置、ID）
- **Position**: 棋盘坐标（x: 0-8, y: 0-9）
- **Move**: 移动记录（起始位置、目标位置、棋子、被吃棋子）
- **GameState**: 游戏状态（棋盘、当前玩家、游戏状态、移动历史、选中位置、合法移动）
- **GameStatus**: 游戏状态枚举（playing, redWin, blackWin, draw）

### 2. 规则引擎层 (`utils/rules.ts`)

实现了完整的中国象棋规则验证系统：

#### 核心功能
- **棋子移动规则**: 为每种棋子类型（将、士、象、马、车、炮、兵）实现了专门的移动算法
- **特殊规则处理**:
  - 将帅对脸（飞将）
  - 蹩马腿检测
  - 塞象眼检测
  - 炮的翻山吃子
  - 兵的过河规则
  - 九宫格限制（将、士）
  - 己方区域限制（象）

#### 关键函数
- `getValidMoves()`: 获取棋子的所有合法移动（不考虑将军检查）
- `isValidMove()`: 验证移动是否合法（包括将军检查）
- `isInCheck()`: 检查是否被将军
- `isCheckmate()`: 检查是否将死
- `wouldBeInCheck()`: 检查移动后是否会被将军

### 3. AI 引擎层 (`utils/ai.ts`)

实现了三种难度的 AI 对手：

#### 难度级别
1. **简单 (simple)**: 随机选择合法移动
2. **中等 (medium)**: 贪心算法，选择评估值最高的移动
3. **困难 (hard)**: Minimax 算法 + Alpha-Beta 剪枝，搜索深度为 3

#### 评估函数
- 棋子价值评估（将、车、马、炮、兵、士、象）
- 位置价值评估
- 将军/将死状态评估
- 吃子奖励机制

### 4. 状态管理层 (`hooks/useChessGame.ts`)

核心游戏状态管理 Hook，提供完整的游戏逻辑：

#### 状态管理
- 棋子数组 (`pieces`)
- 当前玩家 (`currentPlayer`)
- 选中位置 (`selectedPosition`)
- 移动历史 (`moveHistory`)
- 游戏状态 (`status`)
- AI 配置（模式、难度、颜色、思考状态）
- 动效触发状态

#### 核心方法
- `makeMove()`: 执行移动，包含规则验证、状态更新、音效触发
- `selectPosition()`: 选择位置/棋子
- `undoMove()`: 悔棋
- `resetGame()`: 重置游戏
- `saveGame()` / `loadGame()`: 游戏保存/加载（localStorage）
- AI 自动走棋逻辑（通过 `useEffect` 监听）

### 5. UI 组件层

#### 核心组件

**App.tsx** - 应用主组件
- 管理应用模式（选择、AI配置、游戏）
- 响应式布局计算
- 事件处理（点击、拖拽）
- 主题状态管理

**Board.tsx** - 棋盘组件
- 绘制棋盘网格（横线、竖线、九宫格斜线）
- 显示"楚河汉界"文字
- 显示行列数字标记
- 高亮选中位置和合法移动
- 支持多种棋盘主题（纸张、石头、大理石）

**Piece.tsx** - 棋子组件
- 支持拖拽操作
- 点击选择
- 位置动画
- 支持多种棋子主题（新拟态、经典、木质、石头）

**GameInfo.tsx** - 游戏信息显示
- 当前玩家提示
- AI 状态显示
- 游戏状态提示

**GameControls.tsx** - 游戏控制
- 悔棋按钮
- 重置按钮
- 保存/加载按钮

**MoveHistory.tsx** - 走棋历史
- 显示中文记谱法
- 按回合组织显示

**EffectOverlay.tsx** - 动效覆盖层
- 将军动效
- 将死动效

**SettingsMenu.tsx** - 设置菜单
- 棋子主题选择
- 棋盘主题选择
- 棋子大小调整

**GameModeSelector.tsx** - 游戏模式选择
- 双人对战
- AI 对战
- 加载游戏

**AIConfig.tsx** - AI 配置界面
- 难度选择
- 颜色选择（红方/黑方）

### 6. 工具函数层

#### 坐标转换 (`utils/coordinates.ts`)
- `boardToScreen()`: 棋盘坐标转屏幕坐标
- `screenToBoard()`: 屏幕坐标转棋盘坐标
- `getBoardArea()`: 计算棋盘绘制区域
- `getIntersectionPosition()`: 获取交叉点位置

#### 记谱系统 (`utils/notation.ts`)
- `moveToNotation()`: 将移动转换为中文记谱法
  - 支持"进"、"退"、"平"三种方向
  - 支持列号标记（一至九）
  - 支持吃子标记
- `formatMoveRecord()`: 格式化移动记录

#### 音效系统 (`utils/sounds.ts`)
- **音效**: 使用 Web Audio API 生成音调
  - 移动音效
  - 吃子音效
  - 选择音效
  - 将军音效
  - 将死音效
- **语音**: 使用 Web Speech API
  - "将军"语音提示
  - "绝杀"语音提示
  - 自动检测中文语音

#### 主题系统
- **棋子主题** (`utils/pieceThemes.tsx`): 实现多种视觉风格的棋子
- **棋盘主题** (`utils/boardThemes.ts`): 实现多种棋盘背景和样式

## 数据流设计

### 游戏状态流转

```
用户操作 → App.tsx 事件处理
    ↓
useChessGame Hook
    ↓
规则验证 (rules.ts)
    ↓
状态更新 (pieces, currentPlayer, etc.)
    ↓
AI 检测 (如果是 AI 回合)
    ↓
AI 计算 (ai.ts)
    ↓
执行移动 (makeMove)
    ↓
UI 更新 (React 重新渲染)
    ↓
音效/动效触发
```

### 移动执行流程

1. **用户选择棋子** → `selectPosition()` → 更新 `selectedPosition` → 计算 `validMoves`
2. **用户点击目标位置** → `selectPosition()` → 调用 `makeMove()`
3. **规则验证** → `isValidMove()` → 检查移动合法性
4. **执行移动** → 更新 `pieces` 数组 → 更新 `moveHistory`
5. **状态检查** → `isInCheck()` / `isCheckmate()` → 更新 `status` → 触发动效
6. **切换玩家** → 更新 `currentPlayer`
7. **AI 检测** → 如果是 AI 回合，触发 AI 计算

## 关键设计决策

### 1. 状态管理
- 使用 React Hooks (`useState`, `useCallback`, `useMemo`, `useEffect`) 进行状态管理
- 将游戏逻辑封装在 `useChessGame` Hook 中，实现关注点分离
- 使用 `useMemo` 优化性能（棋盘计算、合法移动计算）

### 2. 渲染方案
- 使用 Konva 进行 2D 图形渲染，提供高性能的 Canvas 渲染
- 分层渲染：棋盘层 + 棋子层，便于管理和优化
- 使用 `memo` 优化组件重渲染

### 3. 坐标系统
- 棋盘坐标：`(x: 0-8, y: 0-9)`
- 屏幕坐标：基于 Stage 尺寸动态计算
- 统一的坐标转换函数，确保点击和拖拽的一致性

### 4. AI 设计
- 三种难度级别，满足不同水平玩家
- Minimax 算法使用固定深度（3层），平衡性能和强度
- Alpha-Beta 剪枝优化搜索效率

### 5. 主题系统
- 可扩展的主题架构，支持自定义棋子/棋盘样式
- 主题配置存储在 localStorage，持久化用户选择

### 6. 音效设计
- 使用 Web Audio API 生成程序化音效，无需外部音频文件
- 使用 Web Speech API 提供中文语音提示
- 优雅降级：音频不可用时静默失败

## 性能优化

1. **组件优化**
   - 使用 `React.memo` 防止不必要的重渲染
   - 使用 `useMemo` 缓存计算结果（棋盘、合法移动）

2. **渲染优化**
   - 分层渲染，减少重绘范围
   - 使用 Konva 的批量渲染能力

3. **事件处理**
   - 使用 `useCallback` 缓存事件处理函数
   - 防抖处理 AI 移动，避免重复触发

## 扩展性设计

### 易于扩展的功能
1. **新增棋子主题**: 在 `utils/pieceThemes.tsx` 中添加新的主题配置
2. **新增棋盘主题**: 在 `utils/boardThemes.ts` 中添加新的主题配置
3. **调整 AI 难度**: 修改 `ai.ts` 中的评估函数或搜索深度
4. **新增游戏模式**: 在 `App.tsx` 中添加新的模式分支
5. **自定义规则**: 在 `rules.ts` 中扩展规则验证逻辑

### 未来可能的改进方向
1. 在线对战功能（WebSocket）
2. 棋谱导入/导出（PGN 格式）
3. 回放功能
4. 更强大的 AI（深度学习模型）
5. 移动端适配优化
6. 多语言支持

## 依赖关系图

```
App.tsx
├── useChessGame (hooks)
│   ├── rules.ts (规则验证)
│   ├── ai.ts (AI 计算)
│   └── sounds.ts (音效)
├── Board.tsx
│   ├── coordinates.ts (坐标转换)
│   └── boardThemes.ts (主题)
├── Piece.tsx
│   ├── coordinates.ts (坐标转换)
│   └── pieceThemes.tsx (主题)
├── GameInfo.tsx
├── GameControls.tsx
├── MoveHistory.tsx
│   └── notation.ts (记谱)
└── SettingsMenu.tsx
```

