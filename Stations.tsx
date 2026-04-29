import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Modal, Alert, ProgressBar, StatCard } from '../components/shared/index';
import { Button, Card, Badge, Chip } from '../design-system';
import { useAppStore } from '../store/useAppStore';
import type { ChargingStation } from '../types';
import { Zap, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { pricingConfig } from '../mock/data';

const statusLabel: Record<string, string> = {
  free: 'Livre',
  occupied: 'Ocupada',
  reserved: 'Reservada',
  maintenance: 'Manutenção',
};

const isPeakHour = (hour: number) => [7, 8, 9, 17, 18, 19, 20].includes(hour);

export const Stations: React.FC = () => {
  const { stations, reserveStation, currentUser } = useAppStore();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selected, setSelected] = useState<ChargingStation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [schedTime, setSchedTime] = useState('');
  const [useFree, setUseFree] = useState(false);
  const [toast, setToast] = useState('');

  const freeLeft = (currentUser?.freeChargesPerWeek ?? 0) - (currentUser?.usedChargesThisWeek ?? 0);

  const getDynamicPrice = (station: ChargingStation, timeStr: string) => {
    if (!timeStr) return station.pricePerKwh;
    const hour = new Date(timeStr).getHours();
    const peak = isPeakHour(hour);
    return peak
      ? +(station.pricePerKwh * pricingConfig.peakMultiplier).toFixed(2)
      : +(station.pricePerKwh * (1 - pricingConfig.offPeakDiscount)).toFixed(2);
  };

  const estimatedCost = selected && schedTime && !useFree
    ? +(getDynamicPrice(selected, schedTime) * 40).toFixed(2)
    : 0;

  const handleReserve = () => {
    if (!selected || !schedTime) return;
    const result = reserveStation(selected.id, schedTime, useFree);
    setToast(result.message);
    setModalOpen(false);
    setSelected(null);
    setSchedTime('');
    setUseFree(false);
    setTimeout(() => setToast(''), 4000);
  };

  const openModal = (station: ChargingStation) => {
    setSelected(station);
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    setSchedTime(now.toISOString().slice(0, 16));
    setUseFree(freeLeft > 0);
    setModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto page-enter">
      <Header title="Estações de Recarga" subtitle="Agende sua recarga com desconto inteligente" />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Estações livres"
            value={`${stations.filter(s => s.status === 'free').length}`}
            icon={<Zap size={16} className="text-success" />}
            accent
          />
          <StatCard
            label="Recargas gratuitas"
            value={`${freeLeft}`}
            icon={<span>⚡</span>}
            sub="disponíveis esta semana"
          />
          <StatCard
            label="Economia off-peak"
            value="37%"
            icon={<span>💸</span>}
            sub="entre 23h e 6h"
          />
          <StatCard
            label="Preço de pico"
            value={`+55%`}
            icon={<AlertTriangle size={16} className="text-warning" />}
            sub="7–9h e 17–20h"
          />
        </div>

        {/* Dynamic pricing info */}
        <Card className="border-2 border-success_light bg-success_light bg-opacity-20">
          <div className="flex items-start gap-3">
            <Zap size={18} className="text-success mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-success">Preço Dinâmico Ativo</p>
              <p className="text-xs mt-1 text-text-secondary">
                Horários de pico (7–9h, 17–20h): +55% • Horários livres (23h–6h): –37%
                {isPeakHour(new Date().getHours()) ? ' • ⚠️ Você está em horário de pico agora!' : ' • ✅ Agora é horário econômico!'}
              </p>
            </div>
          </div>
        </Card>

        {/* View toggle */}
        <div className="flex gap-2">
          {(['list', 'map'] as const).map(v => (
            <Chip
              key={v}
              active={view === v}
              onClick={() => setView(v)}
            >
              {v === 'list' ? '☰ Lista' : '🗺️ Mapa (mock)'}
            </Chip>
          ))}
        </div>

        {/* List view */}
        {view === 'list' && (
          <div className="space-y-4">
            {stations.map(s => {
              const currentHour = new Date().getHours();
              const peak = isPeakHour(currentHour);
              const displayPrice = peak
                ? +(s.pricePerKwh * pricingConfig.peakMultiplier).toFixed(2)
                : +(s.pricePerKwh * (1 - pricingConfig.offPeakDiscount)).toFixed(2);

              return (
                <Card key={s.id} interactive>
                  <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
                    <div className="flex-1 w-full">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="text-3xl">⚡</span>
                        <div className="flex-1">
                          <p className="font-semibold text-lg text-primary-dark">{s.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin size={12} className="text-gray-400" />
                            <p className="text-xs text-text-tertiary">{s.address}</p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            s.status === 'free'
                              ? 'success'
                              : s.status === 'occupied'
                                ? 'danger'
                                : s.status === 'reserved'
                                  ? 'info'
                                  : 'warning'
                          }
                        >
                          {statusLabel[s.status]}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Conectores</p>
                          <p className="font-semibold text-primary-dark">{s.availableConnectors}/{s.connectors} livres</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Preço/kWh agora</p>
                          <p className={`font-semibold ${peak ? 'text-warning' : 'text-success'}`}>
                            R$ {displayPrice.toFixed(2)} {peak ? '🔥' : '💚'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Horário</p>
                          <p className="font-semibold text-primary-dark text-xs">{s.operatingHours}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Ocupação</p>
                          <ProgressBar value={s.utilizationRate} color={s.utilizationRate > 80 ? '#FF6B6B' : 'var(--success)'} />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant={s.status === 'free' || s.status === 'reserved' ? 'primary' : 'secondary'}
                      disabled={s.status === 'occupied' || s.status === 'maintenance'}
                      onClick={() => openModal(s)}
                      className="w-full lg:w-auto whitespace-nowrap"
                      icon={<Zap size={16} />}
                    >
                      {s.status === 'free' ? 'Agendar' : s.status === 'reserved' ? 'Ver horários' : 'Indisponível'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Mock map view */}
        {view === 'map' && (
          <Card className="relative rounded-2xl overflow-hidden" style={{ height: 400 }}>
            <div className="absolute inset-0 grid-bg opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
              <span className="text-5xl">🗺️</span>
              <p className="font-semibold text-primary-dark">Mapa integrado</p>
              <p className="text-sm text-text-secondary">
                Integrar com Google Maps API ou Mapbox em produção
              </p>
            </div>
            {/* Mock pins */}
            {stations.map((s, i) => (
              <div
                key={s.id}
                className="absolute flex flex-col items-center cursor-pointer group"
                style={{ left: `${15 + i * 16}%`, top: `${20 + (i % 3) * 20}%` }}
                onClick={() => openModal(s)}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-125 ${
                    s.status === 'free'
                      ? 'border-success bg-success bg-opacity-20'
                      : s.status === 'occupied'
                        ? 'border-red-400 bg-red-400 bg-opacity-20'
                        : 'border-warning bg-warning bg-opacity-20'
                  }`}
                >
                  ⚡
                </div>
                <p className="text-xs mt-1 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-primary-dark">
                  {s.name}
                </p>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Schedule Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSelected(null); }} title="Agendar recarga">
        {selected && (
          <div className="space-y-5">
            <Card>
              <p className="font-semibold text-primary-dark">{selected.name}</p>
              <p className="text-xs mt-1 text-text-tertiary">{selected.address}</p>
            </Card>

            <div>
              <label className="block text-xs font-semibold mb-2 text-text-secondary uppercase">Data e hora</label>
              <input
                type="datetime-local"
                value={schedTime}
                onChange={e => setSchedTime(e.target.value)}
                className="input-field w-full"
              />
              {schedTime && (
                <p className={`text-xs mt-2 font-semibold ${isPeakHour(new Date(schedTime).getHours()) ? 'text-warning' : 'text-success'}`}>
                  {isPeakHour(new Date(schedTime).getHours())
                    ? '⚠️ Horário de pico — preço +55%'
                    : '✅ Horário econômico — preço –37%'}
                </p>
              )}
            </div>

            {freeLeft > 0 && (
              <div
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  useFree
                    ? 'border-success bg-success_light bg-opacity-20'
                    : 'border-gray-200 hover:border-success'
                }`}
                onClick={() => setUseFree(!useFree)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    useFree ? 'border-success bg-success' : 'border-gray-300'
                  }`}
                >
                  {useFree && <span className="text-xs text-white font-bold">✓</span>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary-dark">Usar recarga gratuita semanal</p>
                  <p className="text-xs text-text-tertiary">{freeLeft} restante(s) esta semana</p>
                </div>
                <Badge variant="success">GRÁTIS</Badge>
              </div>
            )}

            {!useFree && schedTime && (
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Custo estimado (~40 kWh)</span>
                  <span className="font-semibold text-lg text-success">R$ {estimatedCost.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Alert type="warning">
              Ao reservar, você concorda com a cobrança mesmo em caso de não comparecimento (no-show).
              Cancelamento gratuito até {pricingConfig.freeCancelHours}h antes.
            </Alert>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleReserve}
                disabled={!schedTime}
                icon={<Zap size={16} />}
              >
                {useFree ? 'Agendar grátis' : `Agendar R$ ${estimatedCost.toFixed(2)}`}
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
