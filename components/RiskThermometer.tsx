import React from 'react';

interface RiskThermometerProps {
  value: number; // 0 to 100
  label: 'SAFE' | 'GRAY_ZONE' | 'AGGRESSIVE' | 'ILLEGAL';
}

const RiskThermometer: React.FC<RiskThermometerProps> = ({ value, label }) => {
  // Determine color based on value/label
  const getColor = () => {
    if (value < 30) return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'; // Safe
    if (value < 60) return 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]';  // Gray
    if (value < 90) return 'bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.5)]';   // Aggressive
    return 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse';       // Illegal
  };

  const getTextColor = () => {
      if (value < 30) return 'text-emerald-400';
      if (value < 60) return 'text-yellow-400';
      if (value < 90) return 'text-orange-400';
      return 'text-red-500';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
      <h3 className="text-slate-400 text-xs font-mono tracking-[0.2em] uppercase mb-4">Risk Threshold</h3>

      {/* Gauge Container */}
      <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        {/* Fill Bar */}
        <div
          className={`h-full transition-all duration-1000 ease-out ${getColor()}`}
          style={{ width: `${value}%` }}
        />

        {/* Ticks */}
        <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="w-[1px] h-full bg-slate-900/30"></div>
            ))}
        </div>
      </div>

      <div className="flex justify-between w-full mt-2 font-mono text-xs text-slate-500">
        <span>SAFE</span>
        <span>GRAY</span>
        <span>DANGER</span>
      </div>

      <div className={`mt-4 text-2xl font-bold tracking-widest ${getTextColor()}`}>
        {label}
      </div>
      <div className="text-slate-600 font-mono text-xs mt-1">
        AGGRESSION INDEX: {value}%
      </div>
    </div>
  );
};

export default RiskThermometer;
