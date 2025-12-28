/**
 * YETO Chart Theme - Standardized colors and styles for all charts
 * Based on YETO brand colors: Navy (#103050), Green (#107040), Gold (#C0A030)
 */

// Primary brand colors
export const YETO_COLORS = {
  navy: '#103050',
  navyLight: '#1a4a6e',
  navyDark: '#0a2030',
  green: '#107040',
  greenLight: '#15a060',
  greenDark: '#0a5030',
  gold: '#C0A030',
  goldLight: '#e0c050',
  goldDark: '#a08020',
  // Semantic colors
  positive: '#107040',
  negative: '#dc2626',
  warning: '#C0A030',
  neutral: '#6b7280',
  // Chart-specific
  aden: '#107040',      // Green for Aden/IRG
  sanaa: '#103050',     // Navy for Sana'a
  mixed: '#C0A030',     // Gold for mixed/comparison
};

// Chart color palettes for different use cases
export const CHART_PALETTES = {
  // Primary palette for most charts
  primary: [
    '#107040', // Green
    '#103050', // Navy
    '#C0A030', // Gold
    '#15a060', // Light Green
    '#1a4a6e', // Light Navy
    '#e0c050', // Light Gold
  ],
  // Sequential palette for heatmaps/gradients
  sequential: [
    '#e8f5e9', // Lightest green
    '#a5d6a7',
    '#66bb6a',
    '#43a047',
    '#2e7d32',
    '#107040', // Darkest green
  ],
  // Diverging palette for positive/negative
  diverging: [
    '#dc2626', // Red (negative)
    '#ef4444',
    '#fca5a5',
    '#d1d5db', // Neutral
    '#86efac',
    '#22c55e',
    '#107040', // Green (positive)
  ],
  // Regime comparison
  regime: {
    aden: '#107040',
    sanaa: '#103050',
    mixed: '#C0A030',
    comparison: '#C0A030',
  },
  // Sector colors
  sectors: {
    trade: '#103050',
    banking: '#107040',
    poverty: '#C0A030',
    energy: '#1a4a6e',
    agriculture: '#15a060',
    conflict: '#dc2626',
    humanitarian: '#e0c050',
    infrastructure: '#6b7280',
  },
};

// Recharts theme configuration
export const RECHARTS_THEME = {
  // Axis styling
  axis: {
    stroke: '#9ca3af',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    tickLine: false,
  },
  // Grid styling
  grid: {
    stroke: '#e5e7eb',
    strokeDasharray: '3 3',
  },
  // Tooltip styling
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  // Legend styling
  legend: {
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
  },
};

// Chart type configurations
export const CHART_CONFIGS = {
  line: {
    strokeWidth: 2,
    dot: { r: 4, strokeWidth: 2 },
    activeDot: { r: 6, strokeWidth: 2 },
  },
  bar: {
    radius: [4, 4, 0, 0],
    maxBarSize: 60,
  },
  area: {
    fillOpacity: 0.3,
    strokeWidth: 2,
  },
  pie: {
    innerRadius: '40%',
    outerRadius: '80%',
    paddingAngle: 2,
  },
};

// Helper function to get color by index
export function getChartColor(index: number, palette: string[] = CHART_PALETTES.primary): string {
  return palette[index % palette.length];
}

// Helper function to get regime color
export function getRegimeColor(regime: 'aden' | 'sanaa' | 'mixed' | 'comparison'): string {
  const regimeColors: Record<string, string> = CHART_PALETTES.regime;
  return regimeColors[regime] || YETO_COLORS.neutral;
}

// Helper function to get sector color
export function getSectorColor(sector: string): string {
  const sectorKey = sector.toLowerCase().replace(/[^a-z]/g, '') as keyof typeof CHART_PALETTES.sectors;
  return CHART_PALETTES.sectors[sectorKey] || YETO_COLORS.navy;
}

// Format number for chart display
export function formatChartNumber(value: number, type: 'currency' | 'percent' | 'number' = 'number'): string {
  if (type === 'currency') {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  }
  if (type === 'percent') {
    return `${value.toFixed(1)}%`;
  }
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
}

// Arabic number formatting
export function formatChartNumberAr(value: number, type: 'currency' | 'percent' | 'number' = 'number'): string {
  const formatted = formatChartNumber(value, type);
  // Replace B/M/K with Arabic equivalents
  return formatted
    .replace('B', ' مليار')
    .replace('M', ' مليون')
    .replace('K', ' ألف')
    .replace('$', '');
}

// Export default theme
export default {
  colors: YETO_COLORS,
  palettes: CHART_PALETTES,
  recharts: RECHARTS_THEME,
  configs: CHART_CONFIGS,
};
