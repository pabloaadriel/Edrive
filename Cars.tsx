import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { BatteryIndicator, Modal, Alert, ProgressBar } from '../components/shared/index';
import { Button, Card, Badge, Input, Chip } from '../design-system';
import { useAppStore } from '../store/useAppStore';
import type { Car } from '../types';
import { Search, SlidersHorizontal, MapPin, Zap } from 'lucide-react';

const statusLabel: Record<string, string> = {
  available: 'Disponível',
  reserved: 'Reservado',
  in_use: 'Em uso',
  maintenance: 'Manutenção',
};

export const Cars: React.FC = () => {
  const { cars, reserveCar, currentUser } = useAppStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'available'>('available');
  const [minBattery, setMinBattery] = useState(0);
  const [selected, setSelected] = useState<Car | null>(null);
  const [weeks, setWeeks] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState('');

  const filtered = cars.filter(c => {
    const matchSearch = `${c.brand} ${c.model} ${c.location}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === 'available';
    const matchBattery = c.batteryLevel >= minBattery;
    return matchSearch && matchFilter && matchBattery;
  });

  const handleReserve = () => {
    if (!selected) return;
    const result = reserveCar(selected.id, weeks);
    setToast(result.message);
    setConfirmOpen(false);
    setSelected(null);
    setTimeout(() => setToast(''), 4000);
  };

  const cost = selected ? (weeks === 1 ? selected.pricePerWeek : selected.pricePerDay * weeks * 7) : 0;

  return (
    <div className="flex-1 overflow-y-auto page-enter">
      <Header title="Veículos" subtitle="Alugue o carro ideal para sua rotina" />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative flex-1 w-full lg:min-w-60">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar modelo, marca, localização..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm border-2 border-gray-200 outline-none transition-all font-body focus:border-success"
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            {(['all', 'available'] as const).map(f => (
              <Chip
                key={f}
                active={filter === f}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Todos' : 'Disponíveis'}
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <SlidersHorizontal size={16} className="text-gray-400" />
            <span className="text-xs font-medium text-text-secondary">Bateria mín:</span>
            <input
              type="range"
              min={0}
              max={80}
              step={10}
              value={minBattery}
              onChange={e => setMinBattery(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-xs font-semibold text-primary-dark">{minBattery}%</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(car => (
            <Card
              key={car.id}
              interactive
              className={`flex flex-col gap-4 ${car.status !== 'available' ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">{car.image}</span>
                <Badge variant={car.status === 'available' ? 'success' : car.status === 'in_use' ? 'danger' : 'info'}>
                  {statusLabel[car.status]}
                </Badge>
              </div>

              <div>
                <p className="font-semibold text-lg text-primary-dark leading-tight">{car.brand} {car.model}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={14} className="text-gray-400" />
                  <p className="text-xs text-text-tertiary">{car.location}</p>
                </div>
              </div>

              <BatteryIndicator level={car.batteryLevel} />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Autonomia</span>
                  <span className="font-semibold text-primary-dark">{car.autonomy} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Diária</span>
                  <span className="font-semibold text-primary-dark">R$ {car.pricePerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Semanal</span>
                  <span className="font-semibold text-success">R$ {car.pricePerWeek}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {car.features.map(f => (
                  <span
                    key={f}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 text-text-secondary"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div>
                <ProgressBar
                  value={car.utilizationRate}
                  label="Utilização"
                  color={car.utilizationRate > 80 ? '#FFA500' : 'var(--success)'}
                />
              </div>

              <Button
                variant={car.status === 'available' ? 'primary' : 'secondary'}
                disabled={car.status !== 'available'}
                className="w-full"
                onClick={() => {
                  setSelected(car);
                  setConfirmOpen(true);
                }}
                icon={car.status === 'available' ? <Zap size={16} /> : undefined}
              >
                {car.status === 'available' ? 'Reservar' : 'Indisponível'}
              </Button>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-text-secondary">Nenhum veículo encontrado com esses filtros.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reserve Modal */}
      <Modal open={confirmOpen} onClose={() => { setConfirmOpen(false); setSelected(null); }} title="Confirmar reserva">
        {selected && (
          <div className="space-y-5">
            <Card className="flex items-center gap-4">
              <span className="text-4xl">{selected.image}</span>
              <div className="flex-1">
                <p className="font-semibold text-primary-dark">{selected.brand} {selected.model}</p>
                <BatteryIndicator level={selected.batteryLevel} />
              </div>
            </Card>

            <div>
              <p className="text-sm font-semibold mb-3 text-text-secondary uppercase">Período</p>
              <div className="flex gap-2">
                {[1, 2, 4].map(w => (
                  <Chip
                    key={w}
                    active={weeks === w}
                    onClick={() => setWeeks(w)}
                  >
                    {w === 1 ? '1 semana' : `${w} semanas`}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Total a cobrar</span>
                <span className="font-semibold text-lg text-success">R$ {cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Saldo após reserva</span>
                <span className="font-semibold text-primary-dark">
                  {currentUser ? `R$ ${(currentUser.balance - cost).toFixed(2)}` : '-'}
                </span>
              </div>
            </div>

            <Alert type="warning">
              Ao reservar, você concorda com a cobrança antecipada de <strong>R$ {cost.toFixed(2)}</strong>.
              Cancelamento gratuito até 4h antes. Após esse prazo, multa de 50%.
            </Alert>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleReserve}
                icon={<Zap size={16} />}
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg z-50 bg-success text-white">
          {toast}
        </div>
      )}
    </div>
  );
};
