import React from 'react';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  active = false,
  children,
  icon,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`chip ${active ? 'active' : ''} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};
