import React from 'react';

type StatusType = 'available' | 'busy' | 'reserved';

interface ChargingStatusProps {
  status: StatusType;
  label?: string;
}

const statusConfig = {
  available: {
    class: 'status-available',
    label: 'Disponível',
  },
  busy: {
    class: 'status-busy',
    label: 'Ocupado',
  },
  reserved: {
    class: 'status-reserved',
    label: 'Reservado',
  },
};

export const ChargingStatus: React.FC<ChargingStatusProps> = ({
  status,
  label,
}) => {
  const config = statusConfig[status];
  
  return (
    <div className={config.class}>
      {label || config.label}
    </div>
  );
};
