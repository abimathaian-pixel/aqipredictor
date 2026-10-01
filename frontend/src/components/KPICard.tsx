import React, { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: ReactNode;
  icon: ReactNode;
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  accentColor?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  badge,
  icon,
  trendText,
  trendDirection,
  accentColor = '#0f766e',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden flex flex-col justify-between h-[138px] w-full ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      {/* Top subtle accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: accentColor }}
      />

      {/* Top Row: Title & Icon */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </span>
        <div
          className="w-7 h-7 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0"
          style={{ color: accentColor }}
        >
          {icon}
        </div>
      </div>

      {/* Middle: Big Metric & Badge */}
      <div className="flex items-baseline gap-2 my-auto">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono truncate">
          {value}
        </span>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Bottom Row: Subtitle & Trend */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
        <span className="truncate max-w-[130px]" title={subtitle}>
          {subtitle || ''}
        </span>
        {trendText && (
          <span
            className={`font-semibold shrink-0 ml-1 ${
              trendDirection === 'up'
                ? 'text-amber-600'
                : trendDirection === 'down'
                ? 'text-emerald-600'
                : 'text-slate-600'
            }`}
          >
            {trendText}
          </span>
        )}
      </div>
    </div>
  );
};
