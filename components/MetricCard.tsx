import React from 'react';
import { Metric } from '../types';

interface MetricCardProps {
  metric: Metric;
}

export const MetricCard: React.FC<MetricCardProps> = React.memo(({ metric }) => {
  const isPositive = metric.change >= 0;
  const isNeutral = metric.change === 0;

  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
      
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">{metric.label}</h3>
      <div className="flex items-baseline justify-between relative z-10">
        <span className="text-3xl font-bold text-white drop-shadow-sm">{metric.value}</span>
        {!isNeutral && (
          <span className={`text-xs font-bold font-mono px-2 py-1 rounded-md border ${
            isPositive 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {isPositive ? '+' : ''}{metric.change}%
          </span>
        )}
      </div>
    </div>
  );
});