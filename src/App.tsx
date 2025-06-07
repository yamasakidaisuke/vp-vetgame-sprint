import { useState } from 'react';
import { PhaserVaccineGame } from './games/p01-vaccine-puzzle/PhaserVaccineGame';

/**
 * メインアプリケーションコンポーネント
 * ゲーム選択とナビゲーションを管理
 */
function App() {
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  /**
   * ゲーム選択ハンドラー
   */
  const handleGameSelect = (gameId: string) => {
    setCurrentGame(gameId);
  };

  /**
   * ホーム画面に戻る
   */
  const handleBackToHome = () => {
    setCurrentGame(null);
  };

  // ゲームが選択されている場合、そのゲームをレンダリング
  if (currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        {currentGame === 'p01-vaccine-puzzle' && (
          <PhaserVaccineGame onBack={handleBackToHome} />
        )}
      </div>
    );
  }

  // ホーム画面
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="game-container">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏥 VetGame Sprint
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            楽しく学べる獣医学習ゲーム集
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-xl font-semibold mb-2">ワクチン救急センター</h3>
              <p className="text-gray-600 mb-4">
                動物をドラッグして適切なワクチンまで運ぼう！時間制限ありのアクションゲーム
              </p>
              <button
                onClick={() => handleGameSelect('p01-vaccine-puzzle')}
                className="btn-primary w-full"
              >
                🎮 プレイ開始
              </button>
            </div>

            {/* 今後のゲーム用のプレースホルダー */}
            <div className="bg-gray-100 rounded-xl p-6 shadow-lg border border-gray-200 opacity-50">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-semibold mb-2">診断クイズ</h3>
              <p className="text-gray-600 mb-4">
                症状から正しい診断を見つけよう！
              </p>
              <button disabled className="btn-secondary w-full">
                準備中
              </button>
            </div>

            <div className="bg-gray-100 rounded-xl p-6 shadow-lg border border-gray-200 opacity-50">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-xl font-semibold mb-2">手術シミュレーター</h3>
              <p className="text-gray-600 mb-4">
                バーチャル手術で技術を磨こう！
              </p>
              <button disabled className="btn-secondary w-full">
                準備中
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 