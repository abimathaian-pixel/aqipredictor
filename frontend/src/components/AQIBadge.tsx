import React from 'react';
import { getAQICategory } from '../utils/aqiCategory';

interface AQIBadgeProps {
  aqi?: number | null;
  category?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRange?: boolean;
}

export const AQIBadge: React.FC<AQIBadgeProps> = ({
  aqi,
  category,
  size = 'md',
  showRange = false
}) => {
  const catInfo = getAQICategory(aqi ?? (category === 'Good' ? 40 : category === 'Satisfactory' ? 80 : 150));
  const catName = category || catInfo.category;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5',
    xl: 'text-base font-bold px-4 py-2'
  }[size];

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
    xl: 'w-3 h-3'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${sizeClasses}`}
      style={{
        backgroundColor: catInfo.bg_color,
        borderColor: catInfo.border_color,
        color: catInfo.text_color
      }}
      title={`${catName} (${catInfo.range}): ${catInfo.description}`}
    >
      <span
        className={`rounded-full shrink-0 ${dotSizes}`}
        style={{ backgroundColor: catInfo.color }}
        aria-hidden="true"
      />
      <span>{catName}</span>
      {showRange && (
        <span className="opacity-70 text-[10px] font-normal">
          ({catInfo.range})
        </span>
      )}
    </span>
  );
};
