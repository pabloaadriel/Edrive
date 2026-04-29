import React from 'react';
import { Zap } from 'lucide-react';

interface BatteryIndicatorProps {
  percentage: number;
  label?: string;
  showIcon?: boolean;
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({
  percentage,
  label = 'Bateria',
  showIcon = true,
}) => {
  const getLevel = (percent: number) => {
    if (percent >= 60) return 'high';
    if (percent >= 30) return 'medium';
    return 'low';
  };

  const level = getLevel(percentage);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {showIcon && (
            <Zap className="w-4 h-4 text-success" />
          )}
          <span className="text-sm font-semibold text-primary-dark">{label}</span>
        </div>
        <span className="text-sm font-bold text-success">{percentage}%</span>
      </div>
      <div className="battery-bar">
        <div
          className={`battery-fill ${level}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
