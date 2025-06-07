# 🎮 VetGame Sprint - 獣医教育ゲームプラットフォーム

獣医学生・実習生向けの教育用ゲームプラットフォーム。楽しく学習しながら実践的なスキルを身につけることができます。

## 🌐 ライブデモ

**🎮 [今すぐプレイ！](https://yamasakidaisuke.github.io/vp-vetgame-sprint/)**

※ スマートフォン・タブレット・PC すべて対応

## 🌟 特徴

- 📱 **スマホファースト**: すべてのゲームがスマートフォンに最適化
- 🎯 **教育重視**: 実際の獣医学知識に基づいたゲーム設計
- 🚀 **モダン技術**: React + TypeScript + Vite で高速開発
- 🎨 **統一UI**: 一貫したデザインシステムで直感的な操作
- ⚡ **リアルタイム**: 60FPSの滑らかなゲーム体験

## 🎮 搭載ゲーム

### 1. ワクチン救急センター 🏥
**動物をドラッグして適切なワクチンで治療するアクションゲーム**

- 🐱 猫、🐶 犬、🐰 うさぎの治療
- ⏰ 60秒の時間制限
- 📈 レベルアップシステム
- 💯 スコアランキング
- 📱 タッチ・ドラッグ操作対応

**操作方法:**
- **スマホ**: タップ&ドラッグで動物を移動
- **PC**: クリック&ドラッグで動物を移動

## 🚀 クイックスタート

### 必要な環境
- Node.js 18以上
- npm または yarn

### インストール & 実行
```bash
# リポジトリをクローン
git clone <repository-url>
cd vp-vetgame-sprint

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:5173 にアクセス
```

### ビルド & デプロイ
```bash
# プロダクション用ビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## 📁 プロジェクト構造

```
vp-vetgame-sprint/
├── src/
│   ├── components/          # 共通コンポーネント
│   │   ├── ui/             # UIコンポーネント
│   │   └── layout/         # レイアウトコンポーネント
│   ├── games/              # ゲーム実装
│   │   └── p01-vaccine-puzzle/
│   │       └── PhaserVaccineGame.tsx
│   ├── stores/             # 状態管理（Zustand）
│   ├── types/              # TypeScript型定義
│   └── App.tsx             # メインアプリ
├── docs/                   # ドキュメント
│   └── game-development-guide.md  # 開発ガイド
├── public/                 # 静的ファイル
└── package.json
```

## 🛠️ 技術スタック

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Game Engine**: HTML5 Canvas + Custom Engine
- **Package Manager**: npm

## 📱 レスポンシブ対応

すべてのゲームは以下の画面サイズに対応：

| デバイス | 画面サイズ | スケール |
|---------|----------|---------|
| スマートフォン | 350×500px | 0.4375 |
| タブレット | 768×600px | 0.8 |
| デスクトップ | 800×600px | 1.0 |

### スマホ最適化機能
- タッチイベント対応
- スクロール防止 (`touchAction: 'none'`)
- 自動スケーリング
- レスポンシブUIレイアウト

## 🎯 ゲーム開発ガイド

新しいゲームを開発する際は、[ゲーム開発ガイドライン](./docs/game-development-guide.md)を参照してください。

### 基本テンプレート
```typescript
// スマホ対応の基本設定
const isMobile = window.innerWidth < 768;
const scale = isMobile ? 0.4375 : 1;
canvas.width = isMobile ? 350 : 800;
canvas.height = isMobile ? 500 : 600;
canvas.style.touchAction = 'none';

// タッチ・マウス統一イベント処理
function getEventPos(e: MouseEvent | TouchEvent) {
  const rect = canvas.getBoundingClientRect();
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
}
```

### 必須機能チェックリスト
- [ ] 60秒タイマー
- [ ] スコアシステム
- [ ] レベル進行
- [ ] スマホ対応
- [ ] タッチ操作
- [ ] ゲームオーバー画面
- [ ] リスタート機能

## 🎨 デザインシステム

### カラーパレット
```css
:root {
  --bg-sky: #87CEEB;        /* 背景 */
  --bg-game: #F0F8FF;       /* ゲームエリア */
  --success: #00ff00;       /* 成功 */
  --error: #ff0000;         /* 失敗 */
  --levelup: #FFD700;       /* レベルアップ */
}
```

### レスポンシブクラス
```tsx
// Tailwind CSS クラス例
<button className="px-4 py-2 text-sm md:text-base">
<h1 className="text-lg md:text-2xl">
<div className="p-2 md:p-4">
```

## 🧪 テスト

```bash
# 単体テスト実行
npm run test

# テストカバレッジ確認
npm run test:coverage

# E2Eテスト（開発中）
npm run test:e2e
```

## 📈 パフォーマンス

- **フレームレート**: 60 FPS
- **初期読み込み**: <2秒
- **メモリ使用量**: <50MB
- **バンドルサイズ**: <500KB (gzipped)

## 🔧 開発者向け情報

### ホットリロード
開発中は自動リロードが有効です。ファイルを保存すると即座にブラウザに反映されます。

### デバッグ
```typescript
// ゲーム内でのデバッグ情報表示
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', { score, level, animals });
}
```

### VSCode拡張推奨
- ESLint
- Prettier
- TypeScript Importer
- Tailwind CSS IntelliSense

## 🤝 貢献ガイド

1. Forkしてブランチを作成
2. [開発ガイドライン](./docs/game-development-guide.md)に従って実装
3. テストを追加/実行
4. プルリクエストを作成

### コミット規則
```
feat(game/[name]): add new feature
fix(game/[name]): fix bug
docs: update documentation
style: format code
test: add tests
```

## 📄 ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) ファイルを参照

## 🆘 サポート

- **Issues**: GitHub Issues で問題を報告
- **Discussion**: GitHub Discussions で質問・提案
- **Wiki**: プロジェクトWikiで詳細情報

---

**🎮 獣医教育をゲームで革新し、次世代の獣医師を育成しましょう！** 