import React from 'react';

interface PriceTagProps {
  value: number;
  currency?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceTag: React.FC<PriceTagProps> = ({
  value,
  currency = 'R$',
  label,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex flex-col items-start gap-1">
      {label && (
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      )}
      <div className={`${sizeClasses[size]} font-bold text-success`}>
        {currency} {value.toFixed(2).replace('.', ',')}
      </div>
    </div>
  );
};
