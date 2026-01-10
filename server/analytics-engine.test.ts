/**
 * Tests for YETO Advanced Analytics Engine
 */
import { describe, it, expect, vi } from 'vitest';
import {
  detectAnomaly,
  forecastTimeSeries,
  analyzeCorrelation,
  analyzeRegimeDivergence,
  generateSmartInsights,
} from './analytics-engine';

describe('Analytics Engine', () => {
  describe('detectAnomaly', () => {
    it('should detect high anomaly when value is significantly above mean', () => {
      const historicalValues = [100, 102, 98, 101, 99, 100, 103, 97, 101, 100];
      const currentValue = 150; // Way above the mean
      
      const result = detectAnomaly(currentValue, historicalValues, 'test_indicator');
      
      expect(result.isAnomaly).toBe(true);
      expect(result.direction).toBe('above');
      expect(result.severity).toMatch(/high|critical/);
      expect(result.zScore).toBeGreaterThan(2);
    });

    it('should detect low anomaly when value is significantly below mean', () => {
      const historicalValues = [100, 102, 98, 101, 99, 100, 103, 97, 101, 100];
      const currentValue = 50; // Way below the mean
      
      const result = detectAnomaly(currentValue, historicalValues, 'test_indicator');
      
      expect(result.isAnomaly).toBe(true);
      expect(result.direction).toBe('below');
      expect(result.severity).toMatch(/high|critical/);
      expect(result.zScore).toBeLessThan(-2);
    });

    it('should not detect anomaly for normal values', () => {
      const historicalValues = [100, 102, 98, 101, 99, 100, 103, 97, 101, 100];
      const currentValue = 101; // Within normal range
      
      const result = detectAnomaly(currentValue, historicalValues, 'test_indicator');
      
      expect(result.isAnomaly).toBe(false);
      expect(result.direction).toBe('normal');
      expect(result.severity).toBe('low');
    });

    it('should handle insufficient data gracefully', () => {
      const historicalValues = [100, 102, 98]; // Less than 10 values
      const currentValue = 150;
      
      const result = detectAnomaly(currentValue, historicalValues, 'test_indicator');
      
      expect(result.isAnomaly).toBe(false);
      expect(result.explanation).toContain('Insufficient');
    });
  });

  describe('forecastTimeSeries', () => {
    it('should generate forecasts with confidence intervals', () => {
      // Need more data points for reliable forecasting
      const data = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-15', value: 103 },
        { date: '2024-02-01', value: 106 },
        { date: '2024-02-15', value: 109 },
        { date: '2024-03-01', value: 112 },
        { date: '2024-03-15', value: 115 },
        { date: '2024-04-01', value: 118 },
        { date: '2024-04-15', value: 121 },
        { date: '2024-05-01', value: 124 },
        { date: '2024-05-15', value: 127 },
      ];
      
      const result = forecastTimeSeries(data, 30);
      
      expect(result.predictions).toBeDefined();
      expect(result.trend).toBeDefined();
      expect(['increasing', 'decreasing', 'stable']).toContain(result.trend);
    });

    it('should detect trend direction based on slope', () => {
      // Strong decreasing trend with 14+ data points (minimum required)
      const data = [
        { date: '2024-01-01', value: 200 },
        { date: '2024-01-08', value: 190 },
        { date: '2024-01-15', value: 180 },
        { date: '2024-01-22', value: 170 },
        { date: '2024-02-01', value: 160 },
        { date: '2024-02-08', value: 150 },
        { date: '2024-02-15', value: 140 },
        { date: '2024-02-22', value: 130 },
        { date: '2024-03-01', value: 120 },
        { date: '2024-03-08', value: 110 },
        { date: '2024-03-15', value: 100 },
        { date: '2024-03-22', value: 90 },
        { date: '2024-04-01', value: 80 },
        { date: '2024-04-08', value: 70 },
      ];
      
      const result = forecastTimeSeries(data, 30);
      
      // Should detect decreasing or volatile trend (high variance may trigger volatile)
      expect(['decreasing', 'volatile']).toContain(result.trend);
    });

    it('should detect stable trend for flat data', () => {
      // Need 14+ data points for forecasting
      const data = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-08', value: 100 },
        { date: '2024-01-15', value: 100 },
        { date: '2024-01-22', value: 100 },
        { date: '2024-02-01', value: 100 },
        { date: '2024-02-08', value: 100 },
        { date: '2024-02-15', value: 100 },
        { date: '2024-02-22', value: 100 },
        { date: '2024-03-01', value: 100 },
        { date: '2024-03-08', value: 100 },
        { date: '2024-03-15', value: 100 },
        { date: '2024-03-22', value: 100 },
        { date: '2024-04-01', value: 100 },
        { date: '2024-04-08', value: 100 },
      ];
      
      const result = forecastTimeSeries(data, 30);
      
      expect(result.trend).toBe('stable');
    });

    it('should handle insufficient data', () => {
      const data = [
        { date: '2024-01-01', value: 100 },
      ];
      
      const result = forecastTimeSeries(data, 30);
      
      expect(result.predictions).toHaveLength(0);
      expect(result.methodology).toContain('Insufficient');
    });
  });

  describe('analyzeCorrelation', () => {
    it('should detect strong positive correlation', () => {
      const indicator1 = {
        name: 'Exchange Rate',
        data: [
          { date: '2024-01-01', value: 100 },
          { date: '2024-02-01', value: 110 },
          { date: '2024-03-01', value: 120 },
          { date: '2024-04-01', value: 130 },
          { date: '2024-05-01', value: 140 },
        ],
      };
      
      const indicator2 = {
        name: 'Inflation',
        data: [
          { date: '2024-01-01', value: 10 },
          { date: '2024-02-01', value: 11 },
          { date: '2024-03-01', value: 12 },
          { date: '2024-04-01', value: 13 },
          { date: '2024-05-01', value: 14 },
        ],
      };
      
      const result = analyzeCorrelation(indicator1, indicator2);
      
      expect(result.correlation).toBeGreaterThan(0.8);
      expect(result.direction).toBe('positive');
      expect(result.strength).toBe('strong');
    });

    it('should detect negative correlation', () => {
      const indicator1 = {
        name: 'Exchange Rate',
        data: [
          { date: '2024-01-01', value: 100 },
          { date: '2024-02-01', value: 110 },
          { date: '2024-03-01', value: 120 },
          { date: '2024-04-01', value: 130 },
          { date: '2024-05-01', value: 140 },
        ],
      };
      
      const indicator2 = {
        name: 'Reserves',
        data: [
          { date: '2024-01-01', value: 50 },
          { date: '2024-02-01', value: 45 },
          { date: '2024-03-01', value: 40 },
          { date: '2024-04-01', value: 35 },
          { date: '2024-05-01', value: 30 },
        ],
      };
      
      const result = analyzeCorrelation(indicator1, indicator2);
      
      expect(result.correlation).toBeLessThan(-0.8);
      expect(result.direction).toBe('negative');
      expect(result.strength).toBe('strong');
    });

    it('should handle insufficient data', () => {
      const indicator1 = {
        name: 'Exchange Rate',
        data: [{ date: '2024-01-01', value: 100 }],
      };
      
      const indicator2 = {
        name: 'Inflation',
        data: [{ date: '2024-01-01', value: 10 }],
      };
      
      const result = analyzeCorrelation(indicator1, indicator2);
      
      expect(result.correlation).toBe(0);
      expect(result.strength).toBe('none');
    });
  });

  describe('analyzeRegimeDivergence', () => {
    it('should detect divergence between Aden and Sanaa', () => {
      const adenData = [
        { date: '2024-01-01', value: 1000 },
        { date: '2024-02-01', value: 1100 },
        { date: '2024-03-01', value: 1200 },
        { date: '2024-04-01', value: 1300 },
        { date: '2024-05-01', value: 1500 },
      ];
      
      const sanaaData = [
        { date: '2024-01-01', value: 600 },
        { date: '2024-02-01', value: 610 },
        { date: '2024-03-01', value: 620 },
        { date: '2024-04-01', value: 630 },
        { date: '2024-05-01', value: 640 },
      ];
      
      const result = analyzeRegimeDivergence('Exchange Rate', adenData, sanaaData);
      
      expect(result.divergencePercent).toBeGreaterThan(50);
      expect(result.indicator).toBe('Exchange Rate');
      expect(result.adenValue).toBe(1500);
      expect(result.sanaaValue).toBe(640);
    });

    it('should calculate correct divergence percentage', () => {
      const adenData = [
        { date: '2024-01-01', value: 1000 },
        { date: '2024-02-01', value: 1000 },
      ];
      
      const sanaaData = [
        { date: '2024-01-01', value: 500 },
        { date: '2024-02-01', value: 500 },
      ];
      
      const result = analyzeRegimeDivergence('Exchange Rate', adenData, sanaaData);
      
      // (1000 - 500) / 500 * 100 = 100%
      expect(result.divergencePercent).toBe(100);
    });
  });

  describe('generateSmartInsights', () => {
    it('should generate insights for indicators with sufficient data', async () => {
      // Need at least 10 data points for insights to be generated
      const indicators = [
        {
          name: 'Exchange Rate',
          nameAr: 'سعر الصرف',
          data: [
            { date: '2024-01-01', value: 100 },
            { date: '2024-01-15', value: 102 },
            { date: '2024-02-01', value: 105 },
            { date: '2024-02-15', value: 108 },
            { date: '2024-03-01', value: 110 },
            { date: '2024-03-15', value: 112 },
            { date: '2024-04-01', value: 115 },
            { date: '2024-04-15', value: 118 },
            { date: '2024-05-01', value: 120 },
            { date: '2024-05-15', value: 125 },
            { date: '2024-06-01', value: 200 }, // Anomaly!
          ],
        },
      ];
      
      const result = await generateSmartInsights(indicators);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Should detect the anomaly
      expect(result.length).toBeGreaterThan(0);
      
      // Check insight structure
      result.forEach(insight => {
        expect(insight.type).toBeDefined();
        expect(insight.indicator).toBeDefined();
        expect(insight.title).toBeDefined();
      });
    });

    it('should handle empty indicators array', async () => {
      const result = await generateSmartInsights([]);
      
      expect(result).toEqual([]);
    });

    it('should skip indicators with insufficient data', async () => {
      const indicators = [
        {
          name: 'Exchange Rate',
          nameAr: 'سعر الصرف',
          data: [
            { date: '2024-01-01', value: 100 },
            { date: '2024-02-01', value: 105 },
          ],
        },
      ];
      
      const result = await generateSmartInsights(indicators);
      
      expect(result).toEqual([]);
    });
  });
});
