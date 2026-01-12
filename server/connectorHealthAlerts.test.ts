/**
 * Connector Health Alerts Tests
 */

import { describe, it, expect, vi } from "vitest";
import {
  checkConnectorHealth,
  getDataFreshnessInfo,
  HEALTH_ALERT_CONFIG,
} from "./services/connectorHealthAlerts";

describe("Connector Health Alerts", () => {
  describe("checkConnectorHealth", () => {
    it("should return health status for all connectors", async () => {
      const results = await checkConnectorHealth();
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // Each result should have required fields
      for (const result of results) {
        expect(result).toHaveProperty("connectorId");
        expect(result).toHaveProperty("connectorName");
        expect(result).toHaveProperty("status");
        expect(["healthy", "warning", "critical"]).toContain(result.status);
        expect(result).toHaveProperty("recordCount");
        expect(typeof result.recordCount).toBe("number");
      }
    });

    it("should use default config when none provided", async () => {
      const results = await checkConnectorHealth();
      expect(results).toBeDefined();
    });

    it("should respect custom threshold config", async () => {
      const customConfig = {
        staleDataThresholdDays: 3,
        criticalThresholdDays: 7,
        enableEmailAlerts: false,
      };
      
      const results = await checkConnectorHealth(customConfig);
      expect(results).toBeDefined();
    });
  });

  describe("getDataFreshnessInfo", () => {
    it("should return freshness info object", async () => {
      const info = await getDataFreshnessInfo();
      
      expect(info).toHaveProperty("lastUpdated");
      expect(info).toHaveProperty("hoursAgo");
      expect(info).toHaveProperty("freshnessLabel");
      expect(info).toHaveProperty("freshnessStatus");
      expect(["fresh", "recent", "stale", "unknown"]).toContain(info.freshnessStatus);
    });

    it("should return valid freshness labels", async () => {
      const info = await getDataFreshnessInfo();
      
      // Label should be a non-empty string
      expect(typeof info.freshnessLabel).toBe("string");
      expect(info.freshnessLabel.length).toBeGreaterThan(0);
    });
  });

  describe("HEALTH_ALERT_CONFIG", () => {
    it("should have valid default configuration", () => {
      expect(HEALTH_ALERT_CONFIG).toBeDefined();
      expect(HEALTH_ALERT_CONFIG.staleDataThresholdDays).toBe(7);
      expect(HEALTH_ALERT_CONFIG.criticalThresholdDays).toBe(14);
      expect(HEALTH_ALERT_CONFIG.enableEmailAlerts).toBe(true);
    });
  });

  describe("Health Status Determination", () => {
    it("should mark connectors with errors as critical", async () => {
      const results = await checkConnectorHealth();
      
      // Find any connector with an error
      const errorConnector = results.find(r => r.lastError !== null);
      if (errorConnector) {
        expect(errorConnector.status).toBe("critical");
      }
    });

    it("should include all expected connectors", async () => {
      const results = await checkConnectorHealth();
      const connectorIds = results.map(r => r.connectorId);
      
      // Check for key connectors
      expect(connectorIds).toContain("world-bank");
      expect(connectorIds).toContain("unhcr");
      expect(connectorIds).toContain("who-gho");
    });
  });
});
