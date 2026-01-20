# YETO Platform - QA Review Mode Specification

**Status:** STAGING-ONLY (Never enable in production)  
**Access:** Super-Admin only  
**Audit:** Full immutable audit trail of all actions  
**Purpose:** Safe inspection and testing of all platform features without weakening security

---

## Overview

QA Review Mode is a staging-only feature that enables super-administrators to thoroughly inspect and test the YETO platform without bypassing production security controls. This mode provides visibility into all routes, features, and data while maintaining a complete audit trail of all actions.

**Key Principle:** QA Review Mode enables inspection, not bypass. Security controls remain in place; they are simply made visible and testable.

---

## Enabling QA Review Mode

### Environment Variable

```bash
# .env (staging only)
QA_REVIEW_MODE=true
QA_REVIEW_MODE_SECRET=<super-secret-key>
```

### Verification

QA Review Mode is automatically disabled in production:

```typescript
// server/_core/env.ts
export const QA_REVIEW_MODE = process.env.QA_REVIEW_MODE === 'true' && 
  process.env.NODE_ENV === 'staging';

if (process.env.QA_REVIEW_MODE === 'true' && process.env.NODE_ENV === 'production') {
  throw new Error('QA_REVIEW_MODE cannot be enabled in production');
}
```

---

## Feature 1: Super-Admin Route Index

### Purpose

Provides a comprehensive list of all routes with live health checks, data verification, and access control testing.

### Implementation

**Endpoint:** `GET /api/admin/qa/routes`

**Response:**

```json
{
  "routes": [
    {
      "path": "/sectors/banking",
      "component": "Banking",
      "purpose": "Banking sector indicators",
      "accessLevel": "Public",
      "status": "OK",
      "healthCheck": {
        "httpStatus": 200,
        "responseTime": 245,
        "dataCheck": "OK",
        "lastChecked": "2026-01-18T23:45:00Z"
      },
      "dataQuality": {
        "hasRealData": true,
        "mockDataDetected": false,
        "dataFreshness": "2 hours",
        "recordCount": 1245
      },
      "accessControl": {
        "requiresAuth": false,
        "requiresRole": null,
        "requiresSubscription": null,
        "tested": true
      },
      "tests": {
        "total": 12,
        "passing": 11,
        "failing": 1
      }
    }
  ],
  "summary": {
    "totalRoutes": 80,
    "healthyRoutes": 58,
    "partialRoutes": 14,
    "brokenRoutes": 8,
    "averageResponseTime": 312,
    "mockDataDetected": 5
  }
}
```

### UI Component

**Path:** `client/src/pages/QARouteIndex.tsx`

**Features:**
- List all routes with status indicators
- Live health check button (runs HTTP request and data validation)
- Filter by status (OK, PARTIAL, BROKEN)
- Filter by access level
- Search routes by path or component name
- View detailed health information
- Run individual route health checks
- Export route inventory as CSV/JSON

---

## Feature 2: Feature Flag Inspector

### Purpose

View and toggle feature flags in staging to test feature rollout and access control.

### Implementation

**Endpoint:** `GET/POST /api/admin/qa/feature-flags`

**Feature Flag Schema:**

```typescript
interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetRoles: string[];
  targetTiers: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  auditLog: AuditEntry[];
}
```

**Available Feature Flags:**

| Flag | Purpose | Default | Rollout |
|------|---------|---------|---------|
| `ai_evidence_packs` | AI evidence pack generation | true | 100% |
| `research_full_text_search` | Full-text search in research | true | 50% |
| `scenario_simulator` | Economic scenario modeling | false | 0% |
| `data_exchange_hub` | Data exchange integration | false | 0% |
| `corporate_registry` | Corporate entity registry | false | 0% |
| `regional_zones` | Regional zone analysis | false | 0% |
| `economic_actors` | Economic actors dashboard | false | 0% |
| `advanced_visualizations` | Advanced chart types | true | 75% |
| `institutional_tier` | Institutional subscription tier | true | 100% |
| `api_key_management` | API key management | true | 100% |
| `custom_dashboards` | Saved custom dashboards | true | 50% |
| `alerts_system` | Real-time alerts | true | 75% |

### UI Component

**Path:** `client/src/pages/QAFeatureFlagInspector.tsx`

**Features:**
- List all feature flags with status
- Toggle flags on/off (staging only)
- Set rollout percentage
- Target specific roles/tiers
- View flag history and audit trail
- Test flag behavior with different user roles
- Export flag configuration

---

## Feature 3: Seeded Test Users

### Purpose

Provide deterministic test users for all subscription tiers to verify access control and feature availability.

### Test Users (Staging Only)

```typescript
const TEST_USERS = {
  public: {
    email: 'test-public@yeto.staging',
    password: 'TestPublic123!',
    tier: 'Public',
    role: 'user',
    verified: true,
  },
  registered: {
    email: 'test-registered@yeto.staging',
    password: 'TestRegistered123!',
    tier: 'Registered',
    role: 'user',
    verified: true,
  },
  pro: {
    email: 'test-pro@yeto.staging',
    password: 'TestPro123!',
    tier: 'Pro',
    role: 'user',
    verified: true,
  },
  institutional: {
    email: 'test-institutional@yeto.staging',
    password: 'TestInstitutional123!',
    tier: 'Institutional',
    role: 'user',
    verified: true,
    organization: 'Test Organization',
  },
  admin: {
    email: 'test-admin@yeto.staging',
    password: 'TestAdmin123!',
    tier: 'Institutional',
    role: 'admin',
    verified: true,
  },
  super_admin: {
    email: 'test-super-admin@yeto.staging',
    password: 'TestSuperAdmin123!',
    tier: 'Institutional',
    role: 'super_admin',
    verified: true,
  },
};
```

### Endpoint

**GET** `/api/admin/qa/test-users`

**Response:**

```json
{
  "testUsers": [
    {
      "email": "test-public@yeto.staging",
      "tier": "Public",
      "role": "user",
      "createdAt": "2026-01-01T00:00:00Z",
      "lastLogin": "2026-01-18T23:45:00Z",
      "loginUrl": "https://yeto.staging/login?email=test-public@yeto.staging"
    }
  ],
  "note": "These credentials are for staging testing only and are reset daily"
}
```

---

## Feature 4: Super-Admin Impersonate User

### Purpose

Allow super-administrators to view exactly what each user tier sees, with full audit logging.

### Implementation

**Endpoint:** `POST /api/admin/qa/impersonate`

**Request:**

```json
{
  "userId": "user-id",
  "reason": "Testing Pro tier access to advanced features",
  "duration": 3600
}
```

**Response:**

```json
{
  "impersonationToken": "imp_...",
  "userId": "user-id",
  "userTier": "Pro",
  "userRole": "user",
  "expiresAt": "2026-01-18T23:45:00Z",
  "auditId": "audit-..."
}
```

### Impersonation Session

Once impersonation is active:
- Super-admin sees exactly what the target user sees
- All actions are logged with impersonation marker
- Session expires after configured duration (default 1 hour)
- Cannot impersonate another super-admin
- Cannot impersonate production users (staging only)

### Audit Log Entry

```json
{
  "id": "audit-...",
  "type": "IMPERSONATION_START",
  "superAdminId": "admin-id",
  "superAdminEmail": "admin@yeto.staging",
  "targetUserId": "user-id",
  "targetUserEmail": "user@yeto.staging",
  "targetUserTier": "Pro",
  "reason": "Testing Pro tier access to advanced features",
  "startTime": "2026-01-18T23:45:00Z",
  "endTime": null,
  "status": "ACTIVE",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

### UI Component

**Path:** `client/src/pages/QAUserImpersonation.tsx`

**Features:**
- Search users by email/ID
- Select user to impersonate
- Provide reason for impersonation
- Set impersonation duration
- View active impersonations
- End impersonation session
- View impersonation audit log
- Automatic session expiration warning

---

## Feature 5: Subscription Simulator

### Purpose

Simulate different subscription tiers and entitlements without modifying production billing logic.

### Implementation

**Endpoint:** `POST /api/admin/qa/simulate-subscription`

**Request:**

```json
{
  "userId": "user-id",
  "simulatedTier": "Pro",
  "simulatedFeatures": [
    "advanced_analytics",
    "custom_dashboards",
    "api_access",
    "data_export"
  ],
  "duration": 3600
}
```

**Response:**

```json
{
  "simulationId": "sim-...",
  "userId": "user-id",
  "actualTier": "Registered",
  "simulatedTier": "Pro",
  "simulatedFeatures": ["advanced_analytics", "custom_dashboards", "api_access", "data_export"],
  "startTime": "2026-01-18T23:45:00Z",
  "expiresAt": "2026-01-19T00:45:00Z",
  "note": "This is a simulation only. Actual subscription remains unchanged."
}
```

### Simulation Behavior

- User sees all Pro tier features
- User can access Pro-only routes and APIs
- Billing is NOT affected (simulation only)
- All actions are logged with simulation marker
- Simulation expires after configured duration
- Cannot simulate higher tier than user's actual tier in production

### Audit Log Entry

```json
{
  "id": "audit-...",
  "type": "SUBSCRIPTION_SIMULATION",
  "userId": "user-id",
  "actualTier": "Registered",
  "simulatedTier": "Pro",
  "simulatedFeatures": ["advanced_analytics", "custom_dashboards"],
  "startTime": "2026-01-18T23:45:00Z",
  "endTime": null,
  "status": "ACTIVE",
  "createdBy": "admin-id"
}
```

### UI Component

**Path:** `client/src/pages/QASubscriptionSimulator.tsx`

**Features:**
- Select user
- Choose simulated tier
- Select features to simulate
- Set simulation duration
- View active simulations
- End simulation
- View simulation audit log
- Test feature access with simulated tier

---

## QA Review Mode Dashboard

### Purpose

Central hub for all QA Review Mode features.

### Implementation

**Path:** `client/src/pages/QAReviewModeDashboard.tsx`

**Components:**
- Route Index (with live health checks)
- Feature Flag Inspector
- Test User Management
- User Impersonation Tool
- Subscription Simulator
- Audit Log Viewer
- QA Mode Status

### Features

- Real-time health monitoring
- Quick access to all QA tools
- Audit trail of all QA actions
- System status and statistics
- Feature flag rollout dashboard
- Test user login links
- Quick actions (impersonate, simulate, test)

---

## Audit Trail

All QA Review Mode actions are logged with full context:

```typescript
interface QAAuditEntry {
  id: string;
  timestamp: Date;
  action: 'ROUTE_HEALTH_CHECK' | 'FEATURE_FLAG_TOGGLE' | 'IMPERSONATION_START' | 'IMPERSONATION_END' | 'SUBSCRIPTION_SIMULATION' | 'TEST_USER_LOGIN';
  superAdminId: string;
  superAdminEmail: string;
  targetUserId?: string;
  targetUserEmail?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
}
```

### Audit Log Endpoints

**List QA audit entries:**
```
GET /api/admin/qa/audit-log?limit=100&offset=0&action=IMPERSONATION_START
```

**Export audit log:**
```
GET /api/admin/qa/audit-log/export?format=csv&startDate=2026-01-01&endDate=2026-01-31
```

---

## Security Considerations

### QA Review Mode Cannot

- ❌ Modify production data
- ❌ Bypass authentication
- ❌ Weaken encryption
- ❌ Access production secrets
- ❌ Modify billing records
- ❌ Delete audit logs
- ❌ Impersonate production users (staging only)
- ❌ Disable security controls

### QA Review Mode Can

- ✅ View all routes and features
- ✅ Test access controls
- ✅ Simulate user experiences
- ✅ Toggle feature flags
- ✅ Run health checks
- ✅ View audit trails
- ✅ Test subscription tiers
- ✅ Generate test data

### Access Control

QA Review Mode is only accessible to:
- Super-Admin role
- In staging environment only
- With valid QA_REVIEW_MODE_SECRET
- With audit logging enabled

---

## Implementation Checklist

- [ ] Create QA Review Mode environment variable
- [ ] Implement production safety checks
- [ ] Build Route Index component and API
- [ ] Build Feature Flag Inspector component and API
- [ ] Create seeded test users
- [ ] Implement User Impersonation feature
- [ ] Implement Subscription Simulator
- [ ] Build QA Dashboard component
- [ ] Implement audit logging for all QA actions
- [ ] Write E2E tests for QA features
- [ ] Document QA Review Mode usage
- [ ] Add QA mode indicator to UI (staging only)
- [ ] Create QA mode user guide

---

## Testing QA Review Mode

### E2E Test Suite

```typescript
describe('QA Review Mode', () => {
  describe('Route Index', () => {
    it('should list all routes with health status');
    it('should run live health checks');
    it('should detect mock data');
    it('should verify access controls');
  });

  describe('Feature Flag Inspector', () => {
    it('should toggle feature flags');
    it('should set rollout percentages');
    it('should target specific roles/tiers');
    it('should log flag changes');
  });

  describe('User Impersonation', () => {
    it('should impersonate user and see their view');
    it('should log impersonation with reason');
    it('should expire impersonation session');
    it('should prevent super-admin impersonation');
  });

  describe('Subscription Simulator', () => {
    it('should simulate subscription tier');
    it('should grant simulated features');
    it('should not affect actual billing');
    it('should expire simulation');
  });

  describe('Audit Trail', () => {
    it('should log all QA actions');
    it('should include full context');
    it('should be immutable');
    it('should be exportable');
  });
});
```

---

## Usage Guide

### For QA Engineers

1. **Access QA Dashboard:** Navigate to `/admin/qa` (super-admin only)
2. **Run Route Health Checks:** Click "Health Check All Routes"
3. **Inspect Features:** Use Feature Flag Inspector to toggle flags
4. **Test User Tiers:** Use Subscription Simulator to test different tiers
5. **Impersonate Users:** Use User Impersonation to see user views
6. **Review Audit Log:** Check all actions in audit trail

### For Super-Administrators

1. **Monitor System Health:** View Route Index for overall status
2. **Investigate Issues:** Use Impersonation to reproduce user issues
3. **Test Rollouts:** Use Feature Flag Inspector to test rollouts
4. **Verify Access Control:** Test subscription tiers with Simulator
5. **Audit QA Actions:** Review QA audit log for compliance

---

## Disabling QA Review Mode

To disable QA Review Mode:

```bash
# Remove environment variable
unset QA_REVIEW_MODE

# Or set to false
QA_REVIEW_MODE=false
```

QA Review Mode is automatically disabled in production regardless of environment variables.

---

## References

- [Route Health Report](./ROUTE_HEALTH_REPORT.md)
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
- [API Documentation](./API_DOCUMENTATION.md)
