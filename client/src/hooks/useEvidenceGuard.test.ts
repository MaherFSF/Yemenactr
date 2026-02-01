/**
 * TRUTH-NATIVE Evidence Guard Hook Tests
 * 
 * Verifies that useEvidenceGuard:
 * 1. Returns GAP placeholder when evidence is missing
 * 2. Returns actual value when all conditions are met
 * 3. Generates deterministic GAP IDs
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEvidenceGuard, guardValue } from './useEvidenceGuard';

// Mock the language context
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en' }),
}));

describe('useEvidenceGuard - Truth-Native', () => {
  describe('Value Display Logic', () => {
    it('should return GAP placeholder when value is null', () => {
      const { result } = renderHook(() => useEvidenceGuard({
        value: null,
        evidencePackId: 'PACK-123',
        indicatorCode: 'GDP',
        sectorCode: 'MACRO',
      }));

      expect(result.current.hasEvidence).toBe(false);
      expect(result.current.displayValue).toContain('—');
      expect(result.current.gapId).toBeTruthy();
      expect(result.current.showGapWarning).toBe(true);
    });

    it('should return GAP placeholder when value is undefined', () => {
      const { result } = renderHook(() => useEvidenceGuard({
        value: undefined,
        evidencePackId: 'PACK-123',
      }));

      expect(result.current.hasEvidence).toBe(false);
      expect(result.current.displayValue).toContain('—');
    });

    it('should return GAP placeholder when value is empty string', () => {
      const { result } = renderHook(() => useEvidenceGuard({
        value: '',
        evidencePackId: 'PACK-123',
      }));

      expect(result.current.hasEvidence).toBe(false);
    });

    it('should return GAP placeholder when value is dash', () => {
      const { result } = renderHook(() => useEvidenceGuard({
        value: '-',
        evidencePackId: 'PACK-123',
      }));

      expect(result.current.hasEvidence).toBe(false);
    });

    it('should return GAP placeholder when evidencePackId is missing', () => {
      const { result } = renderHook(() => useEvidenceGuard({
        value: '100',
        evidencePackId: null,
      }));

      expect(result.current.hasEvidence).toBe(false);
      expect(result.current.displayValue).toContain('—');
    });

    it('should return GAP placeholder when evidencePackId is "unknown"', () => {
      const { result } = renderHook(() => useEvidenceGuard({
        value: '100',
        evidencePackId: 'unknown',
      }));

      expect(result.current.hasEvidence).toBe(false);
    });

    it('should return actual value when all conditions are met', () => {
      const { result } = renderHook(() => useEvidenceGuard({
        value: '3.5',
        evidencePackId: 'PACK-VALID-123',
        isDbDriven: true,
        licenseAllows: true,
      }));

      expect(result.current.hasEvidence).toBe(true);
      expect(result.current.displayValue).toBe('3.5');
      expect(result.current.gapId).toBeNull();
      expect(result.current.showGapWarning).toBe(false);
    });

    it('should return GAP placeholder when isDbDriven is false', () => {
      const { result } = renderHook(() => useEvidenceGuard({
        value: '100',
        evidencePackId: 'PACK-123',
        isDbDriven: false,
      }));

      expect(result.current.hasEvidence).toBe(false);
      expect(result.current.tooltipMessage).toContain('not from database');
    });

    it('should return GAP placeholder when licenseAllows is false', () => {
      const { result } = renderHook(() => useEvidenceGuard({
        value: '100',
        evidencePackId: 'PACK-123',
        licenseAllows: false,
      }));

      expect(result.current.hasEvidence).toBe(false);
      expect(result.current.tooltipMessage).toContain('License');
    });
  });

  describe('GAP ID Generation', () => {
    it('should generate deterministic GAP ID based on indicator and sector', () => {
      const { result: result1 } = renderHook(() => useEvidenceGuard({
        value: null,
        indicatorCode: 'GDP',
        sectorCode: 'MACRO',
      }));

      const { result: result2 } = renderHook(() => useEvidenceGuard({
        value: null,
        indicatorCode: 'GDP',
        sectorCode: 'MACRO',
      }));

      // Same inputs should produce same GAP ID
      expect(result1.current.gapId).toBe(result2.current.gapId);
    });

    it('should generate different GAP IDs for different indicators', () => {
      const { result: result1 } = renderHook(() => useEvidenceGuard({
        value: null,
        indicatorCode: 'GDP',
        sectorCode: 'MACRO',
      }));

      const { result: result2 } = renderHook(() => useEvidenceGuard({
        value: null,
        indicatorCode: 'CPI',
        sectorCode: 'MACRO',
      }));

      expect(result1.current.gapId).not.toBe(result2.current.gapId);
    });

    it('should generate GAP ID starting with GAP-', () => {
      const { result } = renderHook(() => useEvidenceGuard({
        value: null,
        indicatorCode: 'TEST',
      }));

      expect(result.current.gapId).toMatch(/^GAP-/);
    });
  });

  describe('Tooltip Messages', () => {
    it('should provide appropriate tooltip for missing value', () => {
      const { result } = renderHook(() => useEvidenceGuard({
        value: null,
        evidencePackId: 'PACK-123',
      }));

      expect(result.current.tooltipMessage).toContain('not available');
    });

    it('should provide appropriate tooltip for missing evidence pack', () => {
      const { result } = renderHook(() => useEvidenceGuard({
        value: '100',
        evidencePackId: null,
      }));

      expect(result.current.tooltipMessage).toContain('evidence pack');
    });

    it('should provide success tooltip when evidence exists', () => {
      const { result } = renderHook(() => useEvidenceGuard({
        value: '100',
        evidencePackId: 'PACK-VALID',
      }));

      expect(result.current.tooltipMessage).toContain('Verified');
    });
  });
});

describe('guardValue - Utility Function', () => {
  it('should return hasEvidence: false when value is null', () => {
    const result = guardValue(null, 'PACK-123');
    expect(result.hasEvidence).toBe(false);
    expect(result.display).toContain('—');
  });

  it('should return hasEvidence: true when value and pack exist', () => {
    const result = guardValue('100', 'PACK-123');
    expect(result.hasEvidence).toBe(true);
    expect(result.display).toBe('100');
    expect(result.gapId).toBeNull();
  });

  it('should generate GAP ID when evidence missing', () => {
    const result = guardValue(null, null, 'GDP', 'MACRO');
    expect(result.gapId).toMatch(/^GAP-/);
  });
});
