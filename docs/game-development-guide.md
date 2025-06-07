# 🎮 VetGame Sprint - ゲーム開発ガイドライン

## 📋 概要
獣医教育用ゲームプラットフォームの統一開発ガイドライン。すべてのゲームは**スマートフォンの縦画面**を前提として設計し、一貫したユーザー体験を提供する。

## 🎯 基本原則

### 1. スマホ縦画面ファースト設計 📱
- **画面サイズ**: 320px × 568px（スマホ縦画面）、800px × 600px（PC）
- **タッチ操作**: すべてのインタラクションをタップ・ドラッグで実装
- **レスポンシブ**: `window.innerWidth < 768` でスマホ判定
- **縦画面最適化**: UI要素を縦に配置、ワクチンエリアは2×2または縦並び

### 2. UI/UX統一規則
```typescript
// スマホ縦画面対応の基本テンプレート
const isMobile = window.innerWidth < 768;
canvas.width = isMobile ? 320 : 800;
canvas.height = isMobile ? 568 : 600;
canvas.style.touchAction = 'none';
canvas.style.maxWidth = '100%';
canvas.style.height = 'auto';

// スマホ用UI配置
if (isMobile) {
  // ワクチンエリアを縦画面用に配置
  vaccines = [
    { x: 80, y: 400, type: 'cat' },
    { x: 240, y: 400, type: 'dog' },
    { x: 160, y: 480, type: 'rabbit' }
  ];
}
```

### 3. イベント処理統一
```typescript
// 正確なタッチ座標取得（キャンバスサイズ考慮）
function getEventPos(e: MouseEvent | TouchEvent) {
  const rect = canvas.getBoundingClientRect();
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}

// スマホ用のタッチターゲット拡大
const hitboxSize = isMobile ? 60 : 40;
const dropZoneSize = isMobile ? 70 : 50;
```

## 🎨 デザインシステム

### 画面レイアウト（縦画面対応）
```
┌─────────────────┐ ← 320px
│   🏥 タイトル    │
├─────────────────┤
│ スコア｜時間｜Lv │ ← 50px
├─────────────────┤
│  動物をワクチン  │
│  までドラッグ！  │ ← 説明エリア
├─────────────────┤
│                 │
│   ゲームエリア   │ ← 300px
│    (動物移動)    │
│                 │
├─────────────────┤
│  💉   💊       │ ← ワクチンエリア
│     💉         │   (2×2配置)
└─────────────────┘
      568px
```

### カラーパレット
- **背景**: `#87CEEB` (スカイブルー)
- **ゲームエリア**: `#F0F8FF` (アリスブルー)
- **成功**: `#00ff00` (緑)
- **失敗**: `#ff0000` (赤)
- **レベルアップ**: `#FFD700` (ゴールド)

### フォントサイズ（デバイス別）
```typescript
const fontSize = {
  title: isMobile ? 18 : 24,
  ui: isMobile ? 12 : 18,
  instruction: isMobile ? 10 : 16,
  emoji: isMobile ? 30 : 40,
  effect: isMobile ? 14 : 20,
  vaccineLabel: isMobile ? 8 : 14,
  vaccineIcon: isMobile ? 20 : 30
};
```

### レイアウト構造
```tsx
return (
  <div className="flex flex-col items-center p-2 md:p-6 min-h-screen bg-gray-50">
    <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6 w-full max-w-sm md:max-w-none">
      <button className="px-3 py-2 md:px-4 md:py-2 bg-gray-500 text-white rounded text-sm md:text-base flex-shrink-0">
        ← 戻る
      </button>
      <h1 className="text-base md:text-2xl font-bold text-center flex-1">ゲームタイトル</h1>
    </div>
    
    <div className="bg-white p-1 md:p-4 rounded-lg shadow-lg w-full max-w-sm md:max-w-none flex justify-center">
      <div ref={gameRef}></div>
    </div>
    
    <div className="mt-3 md:mt-4 text-center text-gray-600 text-xs md:text-base px-4 max-w-sm md:max-w-none">
      <p className="mb-1">🎯 ゲーム説明</p>
      <div className="text-xs md:text-sm text-gray-500 space-y-1">
        <p>📱 スマホ: タップ&ドラッグ</p>
        <p>💻 PC: クリック&ドラッグ</p>
      </div>
    </div>
  </div>
);
```

## 🎮 ゲーム機能要件

### 必須機能
1. **タイマー**: 60秒制限時間
2. **スコアシステム**: 正解+100〜110点、誤答-25点
3. **レベル進行**: 500点毎にレベルアップ
4. **動物スポーン**: 15%確率で毎秒チェック、スマホ最大3匹、PC最大4匹
5. **エフェクト**: 浮遊テキストで結果表示
6. **ゲームオーバー**: 統計表示とリスタート機能

### スマホ専用最適化
```typescript
// ゲームエリアサイズ調整
const gameAreaWidth = isMobile ? 280 : 600;
const gameAreaX = isMobile ? 20 : 100;
const gameAreaY = isMobile ? 120 : 200;
const gameAreaHeight = isMobile ? 300 : 250;

// 動物速度調整
const animalSpeed = isMobile ? 0.3 : 0.5;

// エフェクト速度調整
const effectSpeed = isMobile ? 0.5 : 1;
```

### UI表示要素（スマホ対応）
```typescript
// スマホ用コンパクトUI
if (isMobile) {
  ctx.fillText(`スコア: ${score}`, 10, 50);
  ctx.fillText(`時間: ${timeLeft}秒`, canvas.width / 2, 50);
  ctx.fillText(`Lv: ${level}`, canvas.width - 10, 50);
  
  // 説明テキストを2行に分割
  ctx.fillText('動物をワクチンまで', canvas.width / 2, 90);
  ctx.fillText('ドラッグしよう！', canvas.width / 2, 105);
}
```

## 📁 ファイル構造

```
src/
├── games/
│   └── [game-name]/
│       ├── [GameName].tsx     # メインゲームコンポーネント
│       ├── components/        # ゲーム専用コンポーネント
│       ├── types.ts          # 型定義
│       └── utils.ts          # ユーティリティ関数
├── components/
│   ├── ui/                   # 共通UIコンポーネント
│   └── layout/               # レイアウトコンポーネント
└── stores/                   # 状態管理（Zustand）
```

## 🚀 実装チェックリスト

### 初期設定
- [ ] スマホ縦画面サイズ設定（320×568px）
- [ ] タッチイベント対応
- [ ] 座標変換処理実装
- [ ] レスポンシブクラス適用

### ゲーム機能
- [ ] 60秒タイマー実装
- [ ] スコアシステム実装
- [ ] レベル進行システム
- [ ] 動物/オブジェクトスポーン（デバイス別制限）
- [ ] ドラッグ&ドロップ操作（拡大タッチターゲット）
- [ ] エフェクト表示（デバイス別速度）
- [ ] ゲームオーバー処理

### UI/UX（縦画面対応）
- [ ] ワクチンエリア縦画面配置
- [ ] UI要素縦配置
- [ ] フォントサイズ調整
- [ ] スマホ用説明テキスト
- [ ] 操作説明表示
- [ ] 戻るボタン実装
- [ ] レスポンシブレイアウト

### テスト
- [ ] スマホ縦画面での動作確認
- [ ] タッチターゲットサイズ確認
- [ ] 画面内収まり確認
- [ ] PC/タブレットでの動作確認
- [ ] パフォーマンス確認

## 🔧 よくある実装パターン

### 縦画面用ワクチンエリア配置
```typescript
// スマホ用2×2+1配置
const vaccines = isMobile ? [
  { x: 80, y: 400, type: 'cat', emoji: '💉', label: '猫用' },
  { x: 240, y: 400, type: 'dog', emoji: '💊', label: '犬用' },
  { x: 160, y: 480, type: 'rabbit', emoji: '💉', label: 'うさぎ用' }
] : [
  // PC用横並び配置
  { x: 150, y: 450, type: 'cat', emoji: '💉', label: '猫用' },
  { x: 400, y: 450, type: 'dog', emoji: '💊', label: '犬用' },
  { x: 650, y: 450, type: 'rabbit', emoji: '💉', label: 'うさぎ用' }
];
```

### 動物移動境界設定
```typescript
const gameAreaLeft = isMobile ? 20 : 100;
const gameAreaRight = isMobile ? 300 : 700;
const gameAreaTop = isMobile ? 120 : 220;
const gameAreaBottom = isMobile ? 350 : 350;

// 境界チェック
if (animal.x < gameAreaLeft || animal.x > gameAreaRight) {
  animal.direction = Math.PI - animal.direction;
}
if (animal.y < gameAreaTop || animal.y > gameAreaBottom) {
  animal.direction = -animal.direction;
}
```

### ワクチンボックス描画
```typescript
const boxSize = isMobile ? 60 : 100;
const boxHeight = isMobile ? 40 : 60;

ctx.fillRect(vaccine.x - boxSize/2, vaccine.y - boxHeight/2, boxSize, boxHeight);
ctx.strokeRect(vaccine.x - boxSize/2, vaccine.y - boxHeight/2, boxSize, boxHeight);
```

## 📝 コミット規則

```
feat(game/[game-name]): add [feature description]
fix(game/[game-name]): fix [bug description]
style(game/[game-name]): update [styling changes]
docs(game): update [documentation changes]
```

## 🎯 獣医教育コンテンツ指針

### テーマ例
- **ワクチン接種**: 動物と適切なワクチンマッチング
- **診断ゲーム**: 症状から病気を特定
- **手術シミュレーション**: 手順の正確性テスト
- **薬剤管理**: 正しい投薬量計算
- **動物ケア**: 動物の世話と健康管理

### 教育要素
- 実際の獣医学知識の組み込み
- 段階的難易度設計
- 間違いからの学習促進
- 実践的スキル向上
- 動物への愛情育成

---

**このガイドラインに従って開発することで、スマホ縦画面に完全対応した高品質なゲームを効率的に制作できます。** 