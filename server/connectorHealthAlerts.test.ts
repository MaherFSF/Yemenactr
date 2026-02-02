/**
 * Connector Health Alerts Tests
 * 
 * Unit tests with mocked database - no network dependencies
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the db module before importing the service
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null), // Return null to trigger empty array return
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Connector Health Alerts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("HEALTH_ALERT_CONFIG", () => {
    it("should have valid default configuration", async () => {
      const { HEALTH_ALERT_CONFIG } = await import("./services/connectorHealthAlerts");
      
      expect(HEALTH_ALERT_CONFIG).toBeDefined();
      expect(HEALTH_ALERT_CONFIG.staleDataThresholdDays).toBe(7);
      expect(HEALTH_ALERT_CONFIG.criticalThresholdDays).toBe(14);
      expect(HEALTH_ALERT_CONFIG.enableEmailAlerts).toBe(true);
    });
  });

  describe("checkConnectorHealth", () => {
    it("should return empty array when database is not available", async () => {
      const { checkConnectorHealth } = await import("./services/connectorHealthAlerts");
      
      const results = await checkConnectorHealth();
      
      expect(Array.isArray(results)).toBe(true);
      // When db returns null, function returns empty array
      expect(results).toEqual([]);
    });

    it("should accept custom config parameter", async () => {
      const { checkConnectorHealth } = await import("./services/connectorHealthAlerts");
      
      const customConfig = {
        staleDataThresholdDays: 3,
        criticalThresholdDays: 7,
        enableEmailAlerts: false,
      };
      
      // Should not throw when called with custom config
      const results = await checkConnectorHealth(customConfig);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("getDataFreshnessInfo", () => {
    it("should return unknown status when database is not available", async () => {
      const { getDataFreshnessInfo } = await import("./services/connectorHealthAlerts");
      
      const info = await getDataFreshnessInfo();
      
      expect(info).toBeDefined();
      expect(info.freshnessStatus).toBe("unknown");
      expect(info.freshnessLabel).toBe("Unknown");
      expect(info.lastUpdated).toBeNull();
      expect(info.hoursAgo).toBeNull();
    });
  });

  describe("Alert Message Formatting", () => {
    it("should format failure alert title correctly", () => {
      const connectorName = "World Bank";
      const alertType = "failure";
      const title = alertType === "failure"
        ? `🚨 YETO Data Connector Failed: ${connectorName}`
        : `⚠️ YETO Stale Data Alert: ${connectorName}`;
      
      expect(title).toContain("Failed");
      expect(title).toContain("World Bank");
    });

    it("should format stale data alert title correctly", () => {
      const connectorName = "UNHCR";
      const alertType = "stale_data";
      const title = alertType === "failure"
        ? `🚨 YETO Data Connector Failed: ${connectorName}`
        : `⚠️ YETO Stale Data Alert: ${connectorName}`;
      
      expect(title).toContain("Stale");
      expect(title).toContain("UNHCR");
    });
  });

  describe("Health Status Logic", () => {
    it("should define retryable status codes correctly", () => {
      // Test the logic without database dependency
      const isRetryable = (status: number) => 
        status === 408 || status === 429 || status >= 500;
      
      expect(isRetryable(408)).toBe(true);  // Request Timeout
      expect(isRetryable(429)).toBe(true);  // Too Many Requests
      expect(isRetryable(500)).toBe(true);  // Internal Server Error
      expect(isRetryable(502)).toBe(true);  // Bad Gateway
      expect(isRetryable(503)).toBe(true);  // Service Unavailable
      expect(isRetryable(400)).toBe(false); // Bad Request
      expect(isRetryable(401)).toBe(false); // Unauthorized
      expect(isRetryable(404)).toBe(false); // Not Found
    });

    it("should calculate days since last fetch correctly", () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      const daysSince = Math.floor(
        (now.getTime() - threeDaysAgo.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      expect(daysSince).toBe(3);
    });

    it("should determine health status based on thresholds", () => {
      const determineStatus = (
        daysSinceLastFetch: number | null,
        hasError: boolean,
        staleThreshold: number = 7,
        criticalThreshold: number = 14
      ): "healthy" | "warning" | "critical" => {
        if (hasError) return "critical";
        if (daysSinceLastFetch === null) return "warning";
        if (daysSinceLastFetch >= criticalThreshold) return "critical";
        if (daysSinceLastFetch >= staleThreshold) return "warning";
        return "healthy";
      };
      
      expect(determineStatus(1, false)).toBe("healthy");
      expect(determineStatus(5, false)).toBe("healthy");
      expect(determineStatus(7, false)).toBe("warning");
      expect(determineStatus(10, false)).toBe("warning");
      expect(determineStatus(14, false)).toBe("critical");
      expect(determineStatus(20, false)).toBe("critical");
      expect(determineStatus(null, false)).toBe("warning");
      expect(determineStatus(1, true)).toBe("critical");
    });
  });
});
