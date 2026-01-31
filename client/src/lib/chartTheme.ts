/**
 * YETO Chart Theme - Standardized colors and styles for all charts
 * Based on CauseWay brand colors: Moss Green (#2C3424), Cypress (#4C583E), Olive (#768064), Gold (#C9A227)
 */

// CauseWay Brand Colors
export const CAUSEWAY_COLORS = {
  moss: '#2C3424',      // Moss Green - Darkest
  cypress: '#4C583E',   // Cypress - Primary green
  olive: '#768064',     // Olive - Medium green
  cedar: '#959581',     // Cedar - Light green/gray
  aloe: '#DADED8',      // Aloe - Very light
  gold: '#C9A227',      // Old Gold - Accent
  goldLight: '#D4B84A', // Light gold
  white: '#FFFFFF',
};

// Primary brand colors (legacy compatibility)
export const YETO_COLORS = {
  navy: CAUSEWAY_COLORS.cypress,      // Use Cypress instead of navy
  navyLight: CAUSEWAY_COLORS.olive,   // Use Olive instead
  navyDark: CAUSEWAY_COLORS.moss,     // Use Moss instead
  green: CAUSEWAY_COLORS.cypress,
  greenLight: CAUSEWAY_COLORS.olive,
  greenDark: CAUSEWAY_COLORS.moss,
  gold: CAUSEWAY_COLORS.gold,
  goldLight: CAUSEWAY_COLORS.goldLight,
  goldDark: '#a08020',
  // Semantic colors
  positive: CAUSEWAY_COLORS.cypress,
  negative: '#dc2626',
  warning: CAUSEWAY_COLORS.gold,
  neutral: CAUSEWAY_COLORS.cedar,
  // Chart-specific
  aden: CAUSEWAY_COLORS.cypress,      // Green for Aden/IRG
  sanaa: CAUSEWAY_COLORS.moss,        // Dark green for Sana'a
  mixed: CAUSEWAY_COLORS.gold,        // Gold for mixed/comparison
};

// Chart color palettes for different use cases
export const CHART_PALETTES = {
  // Primary palette for most charts - CauseWay colors
  primary: [
    CAUSEWAY_COLORS.cypress,  // Cypress
    CAUSEWAY_COLORS.gold,     // Gold
    CAUSEWAY_COLORS.olive,    // Olive
    CAUSEWAY_COLORS.moss,     // Moss
    CAUSEWAY_COLORS.cedar,    // Cedar
    CAUSEWAY_COLORS.goldLight,// Light Gold
  ],
  // Sequential palette for heatmaps/gradients
  sequential: [
    CAUSEWAY_COLORS.aloe,     // Lightest
    '#c4ccc0',
    '#9caa90',
    CAUSEWAY_COLORS.olive,
    CAUSEWAY_COLORS.cypress,
    CAUSEWAY_COLORS.moss,     // Darkest
  ],
  // Diverging palette for positive/negative
  diverging: [
    '#dc2626', // Red (negative)
    '#ef4444',
    '#fca5a5',
    CAUSEWAY_COLORS.cedar,    // Neutral
    CAUSEWAY_COLORS.olive,
    CAUSEWAY_COLORS.cypress,
    CAUSEWAY_COLORS.moss,     // Green (positive)
  ],
  // Regime comparison
  regime: {
    aden: CAUSEWAY_COLORS.cypress,
    sanaa: CAUSEWAY_COLORS.moss,
    mixed: CAUSEWAY_COLORS.gold,
    comparison: CAUSEWAY_COLORS.gold,
  },
  // Sector colors - all using CauseWay palette
  sectors: {
    trade: CAUSEWAY_COLORS.moss,
    banking: CAUSEWAY_COLORS.cypress,
    poverty: CAUSEWAY_COLORS.gold,
    energy: CAUSEWAY_COLORS.olive,
    agriculture: CAUSEWAY_COLORS.cypress,
    conflict: '#dc2626',
    humanitarian: CAUSEWAY_COLORS.gold,
    infrastructure: CAUSEWAY_COLORS.cedar,
    macro: CAUSEWAY_COLORS.cypress,
    prices: CAUSEWAY_COLORS.olive,
    labor: CAUSEWAY_COLORS.moss,
  },
};

// Recharts theme configuration
export const RECHARTS_THEME = {
  // Axis styling
  axis: {
    stroke: CAUSEWAY_COLORS.cedar,
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
  return CHART_PALETTES.sectors[sectorKey] || CAUSEWAY_COLORS.cypress;
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
  causeway: CAUSEWAY_COLORS,
  palettes: CHART_PALETTES,
  recharts: RECHARTS_THEME,
  configs: CHART_CONFIGS,
};
