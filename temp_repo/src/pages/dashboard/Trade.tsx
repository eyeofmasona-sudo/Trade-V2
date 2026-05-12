import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TradingProvider, useTradingContext } from '../../contexts/TradingContext';
import { TradingChart } from '../../components/dashboard/TradingChart';
import { AdvancedOrderPanel as OrderPanel } from '../../components/dashboard/AdvancedOrderPanel';
import { PositionsAndOrdersPanel } from '../../components/dashboard/PositionsAndOrdersPanel';
import { useTradingStore } from '../../stores/tradingStore';
import { motion } from 'motion/react';

const TradeContent = () => {
  const [searchParams] = useSearchParams();
  const { setCurrentPair, currentPair } = useTradingContext();
  const prices = useTradingStore(s => s.prices);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== currentPair) {
      setCurrentPair(sym);
    }
  }, [searchParams, setCurrentPair, currentPair]);

  return (
    <div className="p-4 lg:p-6 h-[calc(100vh-64px)] flex flex-col gap-6 flex-1 overflow-x-hidden animate-in fade-in duration-500 custom-scrollbar">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 min-h-0 flex-1">
        
        {/* Chart Area */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 min-h-0 order-1">
          <div className="flex-1 min-h-[400px] lg:min-h-0 glass-card overflow-hidden relative">
             <TradingChart />
          </div>
        </div>

        {/* Order Panel */}
        <div className="lg:col-span-4 xl:col-span-3 lg:h-full order-2">
           <OrderPanel />
        </div>

        {/* Positions & Orders */}
        <div className="lg:col-span-8 xl:col-span-9 h-[400px] lg:h-[300px] order-3 lg:order-none lg:col-start-1 lg:row-start-2">
            <PositionsAndOrdersPanel />
        </div>

      </div>
    </div>
  );
};

export const Trade = () => {
  return (
    <TradingProvider>
      <TradeContent />
    </TradingProvider>
  );
};
