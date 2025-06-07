import React, { useState, useEffect } from 'react';

interface Animal {
  id: string;
  name: string;
  type: 'cat' | 'dog' | 'rabbit';
  requiredVaccine: string;
  emoji: string;
}

interface Vaccine {
  id: string;
  name: string;
  target: string[];
  emoji: string;
}

interface VaccineGameProps {
  onBack: () => void;
}

/**
 * ワクチンパズルゲーム
 * 動物に適切なワクチンを選択するパズルゲーム
 */
export const VaccineGame: React.FC<VaccineGameProps> = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [selectedVaccine, setSelectedVaccine] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<'playing' | 'correct' | 'wrong' | 'gameOver'>('playing');
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(5);
  
  const animals: Animal[] = [
    { id: '1', name: 'ミケ', type: 'cat', requiredVaccine: 'feline', emoji: '🐱' },
    { id: '2', name: 'ポチ', type: 'dog', requiredVaccine: 'canine', emoji: '🐶' },
    { id: '3', name: 'モフモフ', type: 'rabbit', requiredVaccine: 'rabbit', emoji: '🐰' },
    { id: '4', name: 'シロ', type: 'cat', requiredVaccine: 'feline', emoji: '🐱' },
    { id: '5', name: 'チョコ', type: 'dog', requiredVaccine: 'canine', emoji: '🐶' },
  ];

  const vaccines: Vaccine[] = [
    { id: 'feline', name: '猫用混合ワクチン', target: ['cat'], emoji: '💉' },
    { id: 'canine', name: '犬用混合ワクチン', target: ['dog'], emoji: '💊' },
    { id: 'rabbit', name: 'うさぎ用ワクチン', target: ['rabbit'], emoji: '🧪' },
  ];

  /**
   * ゲーム初期化
   */
  useEffect(() => {
    setScore(0);
    setCurrentAnimal(animals[0]);
  }, []);

  /**
   * ワクチン選択ハンドラー
   */
  const handleVaccineSelect = (vaccineId: string) => {
    if (gamePhase !== 'playing' || !currentAnimal) return;
    
    setSelectedVaccine(vaccineId);
    
    if (vaccineId === currentAnimal.requiredVaccine) {
      setGamePhase('correct');
      setScore(prev => prev + 100);
      
      setTimeout(() => {
        if (round >= maxRounds) {
          setGamePhase('gameOver');
        } else {
          const nextRound = round + 1;
          setRound(nextRound);
          setCurrentAnimal(animals[nextRound - 1]);
          setGamePhase('playing');
          setSelectedVaccine(null);
        }
      }, 1500);
    } else {
      setGamePhase('wrong');
      setTimeout(() => {
        setGamePhase('playing');
        setSelectedVaccine(null);
      }, 1500);
    }
  };

  /**
   * ゲームリスタート
   */
  const handleRestart = () => {
    setScore(0);
    setRound(1);
    setCurrentAnimal(animals[0]);
    setGamePhase('playing');
    setSelectedVaccine(null);
  };

  if (gamePhase === 'gameOver') {
    return (
      <div className="game-container">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            🎉 ゲームクリア！
          </h2>
          <p className="text-xl text-gray-700 mb-4">
            最終スコア: {score}点
          </p>
          <p className="text-gray-600 mb-6">
            すべての動物にワクチンを接種できました！
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={handleRestart}
              className="btn-primary"
            >
              もう一度プレイ
            </button>
            <button 
              onClick={onBack}
              className="btn-secondary"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onBack}
            className="btn-secondary"
          >
            ← 戻る
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">💉 ワクチンパズル</h1>
            <p className="text-gray-600">ラウンド {round}/{maxRounds} | スコア: {score}</p>
          </div>
          <div></div>
        </div>

        {currentAnimal && (
          <div className="bg-white rounded-xl p-8 shadow-lg">
            {/* 現在の動物 */}
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">{currentAnimal.emoji}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {currentAnimal.name}
              </h2>
              <p className="text-gray-600">
                どのワクチンが必要でしょうか？
              </p>
            </div>

            {/* ワクチン選択肢 */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {vaccines.map((vaccine) => (
                <button
                  key={vaccine.id}
                  onClick={() => handleVaccineSelect(vaccine.id)}
                  disabled={gamePhase !== 'playing'}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                    selectedVaccine === vaccine.id
                      ? gamePhase === 'correct'
                        ? 'border-green-500 bg-green-50'
                        : gamePhase === 'wrong'
                        ? 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-4xl mb-3">{vaccine.emoji}</div>
                  <h3 className="font-semibold text-gray-800">{vaccine.name}</h3>
                </button>
              ))}
            </div>

            {/* フィードバック */}
            {gamePhase === 'correct' && (
              <div className="text-center">
                <div className="text-green-600 text-xl font-bold">
                  ✅ 正解！+100点
                </div>
              </div>
            )}
            {gamePhase === 'wrong' && (
              <div className="text-center">
                <div className="text-red-600 text-xl font-bold">
                  ❌ 間違いです。もう一度選んでください。
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 