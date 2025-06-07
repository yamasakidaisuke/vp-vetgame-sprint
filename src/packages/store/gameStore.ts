import { create } from 'zustand';

interface GameState {
  score: number;
  level: number;
  lives: number;
  isGameOver: boolean;
  isGameWon: boolean;
  currentGameId: string | null;
}

interface GameActions {
  updateScore: (score: number) => void;
  addScore: (points: number) => void;
  setLevel: (level: number) => void;
  loseLife: () => void;
  gainLife: () => void;
  setGameOver: (isOver: boolean) => void;
  setGameWon: (isWon: boolean) => void;
  setCurrentGame: (gameId: string | null) => void;
  resetGame: () => void;
}

type GameStore = GameState & GameActions;

const initialState: GameState = {
  score: 0,
  level: 1,
  lives: 3,
  isGameOver: false,
  isGameWon: false,
  currentGameId: null,
};

/**
 * ゲーム状態管理用のZustandストア
 * スコア、レベル、ライフなどの共通ゲーム状態を管理
 */
export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  updateScore: (score) => set({ score }),
  
  addScore: (points) => set((state) => ({ 
    score: state.score + points 
  })),
  
  setLevel: (level) => set({ level }),
  
  loseLife: () => set((state) => {
    const newLives = state.lives - 1;
    return {
      lives: newLives,
      isGameOver: newLives <= 0
    };
  }),
  
  gainLife: () => set((state) => ({ 
    lives: state.lives + 1 
  })),
  
  setGameOver: (isGameOver) => set({ isGameOver }),
  
  setGameWon: (isGameWon) => set({ isGameWon }),
  
  setCurrentGame: (currentGameId) => set({ currentGameId }),
  
  resetGame: () => set(initialState),
})); 