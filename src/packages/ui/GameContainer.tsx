import React from 'react';

interface GameContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ゲーム用のコンテナコンポーネント
 * 共通のレイアウトとスタイリングを提供
 */
export const GameContainer: React.FC<GameContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`game-container ${className}`}>
      {children}
    </div>
  );
}; 