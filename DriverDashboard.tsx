import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Zap, TrendingUp, Clock, ChevronRight, Award } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { BatteryIndicator, StatCard, ProgressBar } from '../components/shared/index';
import { Button, Card, Badge, PriceTag } from '../design-system';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const DriverDashboard: React.FC = () => {
  const { currentUser, reservations, cars } = useAppStore();

  const activeCarRes = reservations.find(r => r.type === 'car' && r.status === 'active' && r.userId === currentUser?.id);
  const activeCar = activeCarRes ? cars.find(c => c.id === activeCarRes.resourceId) : null;
  const pendingCharges = reservations.filter(r => r.type === 'station' && r.status === 'pending' && r.userId === currentUser?.id);
  const freeLeft = (currentUser?.freeChargesPerWeek ?? 0) - (currentUser?.usedChargesThisWeek ?? 0);

  // Smart suggestions
  const suggestions = [
    activeCar && activeCar.batteryLevel < 40
      ? `⚡ Bateria baixa! Recomendamos recarregar hoje. ${freeLeft > 0 ? 'Você tem recarga gratuita disponível!' : ''}`
      : null,
    '💡 Melhor horário para recarregar: entre 23h e 6h (economia de 37%)',
    activeCar ? `🏁 Com ${activeCar.batteryLevel}% de bateria, autonomia estimada: ${Math.round(activeCar.autonomy * activeCar.batteryLevel / 100)} km` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex-1 overflow-y-auto page-enter">
      <Header
        title={`Olá, ${currentUser?.name.split(' ')[0]} 👋`}
        subtitle={format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
      />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Saldo disponível"
            value={`R$ ${currentUser?.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<span className="text-2xl">💰</span>}
            accent
          />
          <StatCard
            label="Economia total"
            value={`R$ ${currentUser?.totalSaved.toLocaleString('pt-BR')}`}
            icon={<TrendingUp size={16} className="text-primary" />}
            sub="vs combustível"
          />
          <StatCard
            label="Recargas gratuitas"
            value={`${freeLeft}/${currentUser?.freeChargesPerWeek}`}
            icon={<Zap size={16} className="text-success" />}
            sub="restantes esta semana"
          />
          <StatCard
            label="Reservas ativas"
            value={`${reservations.filter(r => r.status === 'active' && r.userId === currentUser?.id).length}`}
            icon={<Clock size={16} className="text-primary" />}
            sub="em andamento"
          />
        </div>

        {/* Active car */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card interactive className={activeCar ? 'border-2 border-success_light' : ''}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-primary-dark">
                <Car size={18} className="text-success" />
                Veículo atual
              </h2>
              {activeCar && <Badge variant="success">Em uso</Badge>}
            </div>

            {activeCar && activeCarRes ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{activeCar.image}</span>
                  <div>
                    <p className="font-semibold text-lg text-primary-dark">{activeCar.brand} {activeCar.model}</p>
                    <p className="text-sm text-text-secondary font-mono">{activeCar.plate}</p>
                    <p className="text-xs mt-1 text-text-tertiary">📍 {activeCar.location}</p>
                  </div>
                </div>
                <BatteryIndicator level={activeCar.batteryLevel} size="lg" />
                <ProgressBar value={activeCar.batteryLevel} />
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Autonomia estimada</span>
                  <span className="font-semibold text-primary-dark">~{Math.round(activeCar.autonomy * activeCar.batteryLevel / 100)} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Devolução</span>
                  <span className="font-semibold text-primary-dark">{format(new Date(activeCarRes.endTime), 'dd/MM/yyyy')}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🚫</p>
                <p className="text-text-secondary text-sm mb-4">Nenhum veículo alugado</p>
                <Link to="/cars">
                  <Button variant="primary" size="sm">Alugar agora</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Free charge status */}
          <Card>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary-dark">
              <Zap size={18} className="text-success" />
              Status de recarga
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl border-2 border-success_light bg-success_light bg-opacity-20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-primary-dark">Recargas gratuitas restantes</p>
                  <span className="text-2xl font-bold text-success">{freeLeft}</span>
                </div>
                <ProgressBar
                  value={((currentUser?.usedChargesThisWeek ?? 0) / (currentUser?.freeChargesPerWeek ?? 1)) * 100}
                  color="var(--success)"
                />
              </div>

              {pendingCharges.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-3 text-text-secondary uppercase">Próximas recargas</p>
                  {pendingCharges.slice(0, 2).map(r => (
                    <div key={r.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-primary-dark">{r.resourceName}</p>
                        <p className="text-xs text-text-tertiary font-mono">
                          {format(new Date(r.startTime), 'dd/MM HH:mm')}
                        </p>
                      </div>
                      {r.isFreeCharge ? (
                        <Badge variant="success">Grátis ⚡</Badge>
                      ) : (
                        <PriceTag value={r.totalCost} size="sm" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Link to="/stations" className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-100 transition-colors group">
                <span className="text-sm font-semibold text-primary-dark">Agendar recarga</span>
                <ChevronRight size={16} className="text-success group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Smart suggestions */}
        <Card>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary-dark">
            <Award size={18} className="text-warning" />
            Sugestões inteligentes
          </h2>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-gray-100">
                <p className="text-sm text-text-secondary">{s}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Plan upgrade */}
        {currentUser?.plan === 'basic' && (
          <Card className="border-2 border-warning bg-yellow-50">
            <div className="absolute -right-6 -top-6 text-8xl opacity-10">⭐</div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg text-primary-dark">Faça upgrade para Pro</p>
                <p className="text-sm mt-1 text-text-secondary">3 recargas gratuitas/semana + prioridade nas reservas</p>
              </div>
              <Button variant="primary" size="sm">
                Upgrade ⭐
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
