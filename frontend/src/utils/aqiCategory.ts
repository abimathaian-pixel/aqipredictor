import { AQICategoryInfo } from '../types/aqi';

export function getAQICategory(aqi: number | null | undefined): AQICategoryInfo {
  if (aqi === null || aqi === undefined) {
    return {
      category: 'Unavailable',
      severity: 'Unknown',
      range: 'N/A',
      color: '#94a3b8',
      bg_color: '#f8fafc',
      text_color: '#475569',
      border_color: '#cbd5e1',
      description: 'Data currently unavailable',
      health_implication: 'Monitoring station offline or calibrating'
    };
  }

  const val = Math.round(aqi);

  if (val <= 50) {
    return {
      category: 'Good',
      severity: 'Low',
      range: '0–50',
      color: '#16a34a', // green-600
      bg_color: '#f0fdf4',
      text_color: '#15803d',
      border_color: '#86efac',
      description: 'Minimal health impact',
      health_implication: 'Clean air. Safe for outdoor activities.'
    };
  } else if (val <= 100) {
    return {
      category: 'Satisfactory',
      severity: 'Minor',
      range: '51–100',
      color: '#65a30d', // lime-600
      bg_color: '#f7fee7',
      text_color: '#4d7c0f',
      border_color: '#bef264',
      description: 'Minor breathing discomfort to sensitive people',
      health_implication: 'Acceptable quality; sensitive groups should take standard care.'
    };
  } else if (val <= 200) {
    return {
      category: 'Moderate',
      severity: 'Moderate',
      range: '101–200',
      color: '#d97706', // amber-600
      bg_color: '#fffbeb',
      text_color: '#b45309',
      border_color: '#fde68a',
      description: 'Breathing discomfort to people with lung/heart disease and children',
      health_implication: 'Sensitive individuals should reduce prolonged heavy exertion.'
    };
  } else if (val <= 300) {
    return {
      category: 'Poor',
      severity: 'High',
      range: '201–300',
      color: '#ea580c', // orange-600
      bg_color: '#fff7ed',
      text_color: '#c2410c',
      border_color: '#fed7aa',
      description: 'Breathing discomfort to most people on prolonged exposure',
      health_implication: 'Reduce heavy outdoor exertion; wear mask during transit.'
    };
  } else if (val <= 400) {
    return {
      category: 'Very Poor',
      severity: 'Very High',
      range: '301–400',
      color: '#dc2626', // red-600
      bg_color: '#fef2f2',
      text_color: '#b91c1c',
      border_color: '#fecaca',
      description: 'Respiratory illness to people on prolonged exposure',
      health_implication: 'Avoid prolonged outdoor exposure. Keep windows sealed.'
    };
  } else {
    return {
      category: 'Severe',
      severity: 'Critical',
      range: '401–500',
      color: '#7f1d1d', // red-950 maroon
      bg_color: '#450a0a',
      text_color: '#fecaca',
      border_color: '#991b1b',
      description: 'Affects healthy people and seriously impacts those with existing diseases',
      health_implication: 'Emergency health warning. Strictly remain indoors.'
    };
  }
}

export const CPCB_CATEGORIES = [
  { name: 'Good', range: '0–50', color: '#16a34a', bg: '#f0fdf4', text: '#15803d' },
  { name: 'Satisfactory', range: '51–100', color: '#65a30d', bg: '#f7fee7', text: '#4d7c0f' },
  { name: 'Moderate', range: '101–200', color: '#d97706', bg: '#fffbeb', text: '#b45309' },
  { name: 'Poor', range: '201–300', color: '#ea580c', bg: '#fff7ed', text: '#c2410c' },
  { name: 'Very Poor', range: '301–400', color: '#dc2626', bg: '#fef2f2', text: '#b91c1c' },
  { name: 'Severe', range: '401–500', color: '#7f1d1d', bg: '#450a0a', text: '#fecaca' }
];

export function getPollutantUnit(pollutant: string): string {
  if (pollutant.toUpperCase() === 'CO') return 'mg/m³';
  return 'µg/m³';
}
