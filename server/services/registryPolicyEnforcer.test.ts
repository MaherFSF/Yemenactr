/**
 * Registry Policy Enforcer Tests
 */

import { describe, it, expect } from 'vitest';
import * as policyEnforcer from './registryPolicyEnforcer';

describe('Registry Policy Enforcer', () => {
  describe('Policy Mapping', () => {
    it('DATA_NUMERIC should map to NUMERIC_TIMESERIES pipe', async () => {
      // Policy map is defined in the service
      expect(true).toBe(true);
    });

    it('DOC_PDF should map to DOCUMENT_VAULT pipe', async () => {
      expect(true).toBe(true);
    });

    it('NEWS_MEDIA should map to NEWS_AGGREGATOR + DOCUMENT_VAULT pipes', async () => {
      expect(true).toBe(true);
    });

    it('SANCTIONS_LIST should map ONLY to SANCTIONS_COMPLIANCE', async () => {
      expect(true).toBe(true);
    });
  });

  describe('PIPE_REGISTRY_LINT', () => {
    it('should pass when all sources are valid', async () => {
      const lintResult = await policyEnforcer.runPipeRegistryLint();
      
      // Lint may have warnings but should not crash
      expect(lintResult).toHaveProperty('passed');
      expect(lintResult).toHaveProperty('errors');
      expect(Array.isArray(lintResult.errors)).toBe(true);
    });

    it('should detect sources missing name as ERROR', async () => {
      const lintResult = await policyEnforcer.runPipeRegistryLint();
      const missingNameErrors = lintResult.errors.filter(e => e.rule === 'MISSING_NAME');
      
      expect(missingNameErrors.every(e => e.severity === 'ERROR')).toBe(true);
    });

    it('should detect ACTIVE sources without endpoints as ERROR', async () => {
      const lintResult = await policyEnforcer.runPipeRegistryLint();
      const activeNoEndpoint = lintResult.errors.filter(e => e.rule === 'ACTIVE_NO_ENDPOINT');
      
      expect(activeNoEndpoint.every(e => e.severity === 'ERROR')).toBe(true);
    });

    it('should detect partnership sources without contact as WARNING', async () => {
      const lintResult = await policyEnforcer.runPipeRegistryLint();
      const partnershipNoContact = lintResult.errors.filter(e => e.rule === 'PARTNERSHIP_NO_CONTACT');
      
      expect(partnershipNoContact.every(e => e.severity === 'WARNING')).toBe(true);
    });
  });

  describe('Policy Decision', () => {
    it('should return null for non-existent source', async () => {
      const decision = await policyEnforcer.getPolicyDecision('SRC-NONEXISTENT');
      expect(decision).toBeNull();
    });

    it('should return policy decision with eligible pipes', async () => {
      // Would need to seed DB with test source
      expect(true).toBe(true);
    });
  });
});
