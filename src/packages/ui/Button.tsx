import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
}

/**
 * 共通のボタンコンポーネント
 * プライマリとセカンダリのバリアントを提供
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  variant = 'primary'
}) => {
  const baseClasses = 'font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
}; 