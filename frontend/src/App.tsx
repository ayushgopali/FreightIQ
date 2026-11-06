import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { CommandCentre } from './pages/CommandCentre';
import { CharteringDecision } from './pages/CharteringDecision';
import { PortIntelligence } from './pages/PortIntelligence';
import { HistoricalReplay } from './pages/HistoricalReplay';
import { BacktestAnalytics } from './pages/BacktestAnalytics';
import { Methodology } from './pages/Methodology';
import { Settings } from './pages/Settings';
import { api } from './api/client';
import { Origin, PortName, ShipClass, MetadataResponse } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('command');

  // Shared Global Context Parameters
  const [origin, setOrigin] = useState<Origin>('South Africa');
  const [port, setPort] = useState<PortName>('Paradip');
  const [shipClass, setShipClass] = useState<ShipClass>('Capesize');
  const [cargoT, setCargoT] = useState<number>(150000);

  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadMetadata = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.getMetadata();
      setMetadata(data);
    } catch (err) {
      console.error('Metadata fetch error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  const getPageTitleAndSubtitle = () => {
    switch (activeTab) {
      case 'command':
        return {
          title: 'FreightIQ Commercial Command',
          subtitle: 'Maritime forward freight curve & probabilistic rate trajectories (East Coast Coal Corridors)',
        };
      case 'decision':
        return {
          title: 'Chartering Decision Engine',
          subtitle: 'Monte Carlo asymmetric cost simulation & risk-adjusted fixture optimization (Book Now vs Wait)',
        };
      case 'ports':
        return {
          title: 'Port Facility Screening',
          subtitle: 'Physical berth envelope, draft limit & UKC screening across 7 Indian East Coast terminals',
        };
      case 'replay':
        return {
          title: 'Historical Walk-Forward Audit',
          subtitle: 'Strict zero-lookahead hindsight validation on verified benchmark fixtures (Win vs Loss Cases)',
        };
      case 'backtest':
        return {
          title: 'Quantitative Backtest Performance',
          subtitle: '738 walk-forward decisions (2021–2026) · Conformal coverage & sensitivity matrix',
        };
      case 'methodology':
        return {
          title: 'Mathematical Architecture Specification',
          subtitle: 'HistGradientBoosting quantile models, CQR conformal intervals & Monte Carlo simulation formulas',
        };
      case 'settings':
        return {
          title: 'System Parameters & Fleet Specifications',
          subtitle: 'Standard dry-bulk vessel dimensions, under-keel clearance (0.60m) & operational constants',
        };
      default:
        return {
          title: 'FreightIQ Terminal',
          subtitle: 'Maritime Decision Intelligence Engine',
        };
    }
  };

  const { title, subtitle } = getPageTitleAndSubtitle();

  return (
    <div className="flex h-screen bg-dark-bg text-slate-200 font-sans overflow-hidden">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dataSource={metadata?.data_source || 'synthetic'}
      />

      {/* Main Analytical View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Persistent Top Navigation Bar */}
        <TopBar
          title={title}
          subtitle={subtitle}
          selectedOrigin={origin}
          selectedPort={port}
          cargoT={cargoT}
          asofDate={metadata?.latest_date || '2026-11-01'}
          dataSource={metadata?.data_source || 'synthetic'}
          onRefresh={loadMetadata}
          isRefreshing={isRefreshing}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-3.5 bg-dark-bg">
          <div className="w-full max-w-[1750px] mx-auto">
            {activeTab === 'command' && (
              <CommandCentre
                origin={origin}
                setOrigin={setOrigin}
                port={port}
                setPort={setPort}
                shipClass={shipClass}
                setShipClass={setShipClass}
                cargoT={cargoT}
                setCargoT={setCargoT}
                onNavigateToDecision={() => setActiveTab('decision')}
              />
            )}

            {activeTab === 'decision' && (
              <CharteringDecision
                origin={origin}
                setOrigin={setOrigin}
                port={port}
                setPort={setPort}
                cargoT={cargoT}
                setCargoT={setCargoT}
              />
            )}

            {activeTab === 'ports' && (
              <PortIntelligence
                port={port}
                setPort={setPort}
                cargoT={cargoT}
                setCargoT={setCargoT}
              />
            )}

            {activeTab === 'replay' && <HistoricalReplay />}

            {activeTab === 'backtest' && <BacktestAnalytics />}

            {activeTab === 'methodology' && <Methodology />}

            {activeTab === 'settings' && <Settings />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
