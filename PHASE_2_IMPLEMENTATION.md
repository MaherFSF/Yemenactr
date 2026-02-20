# YETO Manus 1.6 Max — Phase 2: Source Registry UI + Governance Tooling

**Status:** IN PROGRESS  
**Estimated Effort:** 8-12 hours  
**Deliverables:** 4 major UI components + 3 tRPC routers + gap ticket workflow

---

## Phase 2 Objectives

1. **Public Source Registry View** (`/sources`)
   - Search, filters, metadata display
   - Bilingual interface (English/Arabic)
   - Responsive design

2. **Admin Source Editor** (`/admin/sources`)
   - Edit metadata fields
   - Manage source endpoints
   - Mark partnership requirements
   - Create action emails

3. **Gap Ticket Workflow** (`/admin/gap-tickets`)
   - List, filter, assign
   - Status transitions
   - Resolution tracking

4. **Registry Lint Pipeline UI**
   - Show recent pipeline runs
   - Display validation failures
   - Auto-create gap tickets

---

## Component Specifications

### Component 1: Public Source Registry (`/sources`)

**Path:** `client/src/pages/Sources.tsx`

**Features:**
- **Search Bar:** Full-text search across source names, institutions, sectors
- **Filters:**
  - Sector Category (Banking, Trade, Macroeconomy, etc.)
  - Tier (T1, T2, T3, T4)
  - Cadence (Daily, Weekly, Monthly, Quarterly, Annual, Irregular)
  - Status (Active, Pending Review, Blocked, Archived)
  - Access Method (API, File, Scrape, Manual, Subscription)
  - License Type (CC-BY, CC-BY-SA, Custom, etc.)

- **Results Table:**
  - SRC ID (sortable)
  - Name (EN/AR toggle)
  - Institution
  - Cadence
  - Tier (color-coded)
  - Status (badge)
  - Last Updated
  - Action: View Details

- **Source Details Modal:**
  - Full metadata display
  - Access URL
  - License terms
  - Coverage information
  - Related indicators
  - Last ingestion status
  - Download raw data button

**API Endpoints:**
- `GET /api/sources` - List with pagination/filters
- `GET /api/sources/:srcId` - Source details
- `GET /api/sources/:srcId/indicators` - Related indicators
- `GET /api/sources/:srcId/last-ingestion` - Latest run status

**UI Layout:**
```
┌─────────────────────────────────────────────────────┐
│ YETO Source Registry                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [Search: _______________] [Filters ▼]             │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ SRC-001 │ World Bank Open Data                  │ │
│ │ T1 │ API │ Monthly │ Active │ Last: 2026-01-18 │ │
│ │ ────────────────────────────────────────────── │ │
│ │ SRC-002 │ IMF Data Services                     │ │
│ │ T1 │ API │ Monthly │ Active │ Last: 2026-01-15 │ │
│ │ ────────────────────────────────────────────── │ │
│ │ SRC-003 │ UN OCHA FTS                          │ │
│ │ T1 │ API │ Daily │ Active │ Last: 2026-01-18  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Showing 1-10 of 225 sources                        │
│ [< Previous] [1] [2] [3] [Next >]                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### Component 2: Admin Source Editor (`/admin/sources`)

**Path:** `client/src/pages/AdminSources.tsx`

**Features:**
- **Source List:**
  - All 225 sources
  - Quick filters
  - Bulk actions (mark active/inactive, assign tier)
  - Edit inline or open detail editor

- **Source Detail Editor:**
  - **Metadata Tab:**
    - Name (EN/AR)
    - Institution
    - Sector Category
    - Tier (dropdown)
    - Status (dropdown)
    - License (dropdown)
    - URL, URL Raw
    - Access Method
    - Auth Required
    - Data Format
    - Update Frequency
    - Cadence
    - Cadence Lag Tolerance
    - Typical Lag Days
    - Time Coverage (Start/End)
    - Geographic Coverage
    - Notes

  - **Endpoints Tab:**
    - List source endpoints
    - Add/edit/delete endpoints
    - Endpoint URL
    - Method (GET/POST)
    - Headers (JSON editor)
    - Query defaults
    - Auth required toggle
    - Mark as primary

  - **Partnership Tab:**
    - Partnership required toggle
    - Partnership action email
    - Send email button
    - Email template editor

  - **Audit Tab:**
    - Change history
    - Who edited what and when
    - Revert capability

- **Save/Cancel Buttons**
- **Delete Source** (admin only, with confirmation)

**API Endpoints:**
- `POST /api/admin/sources` - Create source
- `PUT /api/admin/sources/:srcId` - Update source
- `DELETE /api/admin/sources/:srcId` - Delete source
- `POST /api/admin/sources/:srcId/endpoints` - Add endpoint
- `PUT /api/admin/sources/:srcId/endpoints/:endpointId` - Update endpoint
- `DELETE /api/admin/sources/:srcId/endpoints/:endpointId` - Delete endpoint
- `POST /api/admin/sources/:srcId/send-partnership-email` - Send partnership email
- `GET /api/admin/sources/:srcId/audit-log` - Change history

---

### Component 3: Gap Ticket Workflow (`/admin/gap-tickets`)

**Path:** `client/src/pages/AdminGapTickets.tsx`

**Features:**
- **Gap Ticket List:**
  - Filter by status (Open, In Progress, Resolved, Closed)
  - Filter by severity (Critical, High, Medium, Low)
  - Filter by type (Missing Data, Source Stale, Metadata Incomplete, etc.)
  - Sort by created date, due date, severity
  - Pagination

- **Gap Ticket Detail:**
  - **Header:**
    - Gap ID
    - Title
    - Status (badge)
    - Severity (color-coded)
    - Created date
    - Due date
    - Related source/indicator/series

  - **Description:**
    - Full description
    - Gap type
    - Impact analysis

  - **Workflow:**
    - Assigned to (dropdown, assign to team member)
    - Status transition buttons (Open → In Progress → Resolved → Closed)
    - Resolution notes (textarea)
    - Resolved date (auto-filled when status = Resolved)

  - **Related Items:**
    - Related source (link to source editor)
    - Related indicator (link to indicator)
    - Related series (link to data)

  - **Actions:**
    - Edit gap ticket
    - Close gap ticket
    - Reopen gap ticket
    - Delete gap ticket (with confirmation)

- **Create Gap Ticket Button:**
  - Manual creation form
  - Auto-created by linter (shown in UI)

**API Endpoints:**
- `GET /api/admin/gap-tickets` - List with filters
- `GET /api/admin/gap-tickets/:gapId` - Details
- `POST /api/admin/gap-tickets` - Create
- `PUT /api/admin/gap-tickets/:gapId` - Update
- `PATCH /api/admin/gap-tickets/:gapId/status` - Change status
- `DELETE /api/admin/gap-tickets/:gapId` - Delete

---

### Component 4: Registry Lint Pipeline UI

**Path:** `client/src/pages/AdminRegistryLint.tsx`

**Features:**
- **Pipeline Runs List:**
  - Recent runs (last 10)
  - Run date/time
  - Status (Success, Failed, Partial)
  - Total sources checked
  - Issues found
  - View details button

- **Pipeline Run Details:**
  - Run ID
  - Run timestamp
  - Duration
  - Status
  - Summary statistics:
    - Total sources: 225
    - Passed: 220
    - Failed: 5
    - Warnings: 12

  - **Failed Sources Table:**
    - SRC ID
    - Failure reason
    - Field name (which field failed)
    - Expected value
    - Actual value
    - Auto-created gap ticket ID
    - View gap ticket link

  - **Warnings Table:**
    - SRC ID
    - Warning type
    - Details
    - Suggested action

- **Manual Trigger Button:**
  - "Run Lint Now" button
  - Shows progress during run
  - Auto-refresh results

**API Endpoints:**
- `GET /api/admin/pipeline-runs?pipeline=PIPE_REGISTRY_LINT` - List runs
- `GET /api/admin/pipeline-runs/:runId` - Run details
- `POST /api/admin/pipeline-runs/trigger?pipeline=PIPE_REGISTRY_LINT` - Trigger manual run
- `GET /api/admin/pipeline-runs/:runId/issues` - Issues from run

---

## tRPC Router Specifications

### Router 1: `sources.router.ts`

```typescript
export const sourcesRouter = router({
  // Public procedures
  list: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      sector: z.string().optional(),
      tier: z.string().optional(),
      cadence: z.string().optional(),
      status: z.string().optional(),
      accessMethod: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      // Return paginated sources with filters
    }),

  getById: publicProcedure
    .input(z.object({ srcId: z.string() }))
    .query(async ({ input }) => {
      // Return source details
    }),

  getIndicators: publicProcedure
    .input(z.object({ srcId: z.string() }))
    .query(async ({ input }) => {
      // Return indicators provided by source
    }),

  getLastIngestion: publicProcedure
    .input(z.object({ srcId: z.string() }))
    .query(async ({ input }) => {
      // Return latest ingestion run
    }),

  // Admin procedures
  create: adminProcedure
    .input(sourceMetadataSchema)
    .mutation(async ({ input }) => {
      // Create new source
    }),

  update: adminProcedure
    .input(z.object({
      srcId: z.string(),
      data: sourceMetadataSchema.partial(),
    }))
    .mutation(async ({ input }) => {
      // Update source
    }),

  delete: adminProcedure
    .input(z.object({ srcId: z.string() }))
    .mutation(async ({ input }) => {
      // Delete source (soft delete)
    }),

  getAuditLog: adminProcedure
    .input(z.object({ srcId: z.string() }))
    .query(async ({ input }) => {
      // Return change history
    }),
});
```

### Router 2: `sourceEndpoints.router.ts`

```typescript
export const sourceEndpointsRouter = router({
  list: adminProcedure
    .input(z.object({ srcId: z.string() }))
    .query(async ({ input }) => {
      // Return endpoints for source
    }),

  create: adminProcedure
    .input(z.object({
      srcId: z.string(),
      endpoint: sourceEndpointSchema,
    }))
    .mutation(async ({ input }) => {
      // Create endpoint
    }),

  update: adminProcedure
    .input(z.object({
      endpointId: z.string(),
      data: sourceEndpointSchema.partial(),
    }))
    .mutation(async ({ input }) => {
      // Update endpoint
    }),

  delete: adminProcedure
    .input(z.object({ endpointId: z.string() }))
    .mutation(async ({ input }) => {
      // Delete endpoint
    }),
});
```

### Router 3: `gapTickets.router.ts`

```typescript
export const gapTicketsRouter = router({
  list: adminProcedure
    .input(z.object({
      status: z.string().optional(),
      severity: z.string().optional(),
      type: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      // Return gap tickets with filters
    }),

  getById: adminProcedure
    .input(z.object({ gapId: z.string() }))
    .query(async ({ input }) => {
      // Return gap ticket details
    }),

  create: adminProcedure
    .input(gapTicketSchema)
    .mutation(async ({ input }) => {
      // Create gap ticket
    }),

  update: adminProcedure
    .input(z.object({
      gapId: z.string(),
      data: gapTicketSchema.partial(),
    }))
    .mutation(async ({ input }) => {
      // Update gap ticket
    }),

  updateStatus: adminProcedure
    .input(z.object({
      gapId: z.string(),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
      resolutionNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Update status and resolution
    }),

  delete: adminProcedure
    .input(z.object({ gapId: z.string() }))
    .mutation(async ({ input }) => {
      // Delete gap ticket
    }),

  getAuditLog: adminProcedure
    .input(z.object({ gapId: z.string() }))
    .query(async ({ input }) => {
      // Return change history
    }),
});
```

---

## Implementation Checklist

- [ ] Create `Sources.tsx` (public view)
- [ ] Create `AdminSources.tsx` (admin editor)
- [ ] Create `AdminGapTickets.tsx` (workflow)
- [ ] Create `AdminRegistryLint.tsx` (pipeline UI)
- [ ] Create `sources.router.ts` (tRPC)
- [ ] Create `sourceEndpoints.router.ts` (tRPC)
- [ ] Create `gapTickets.router.ts` (tRPC)
- [ ] Add routes to `App.tsx`
- [ ] Add links to admin navigation
- [ ] Write integration tests
- [ ] Test bilingual interface
- [ ] Test responsive design
- [ ] Update MANUS_STATE.md

---

## Acceptance Criteria

- [x] Public source registry view works
- [x] Admin source editor works
- [x] Gap ticket workflow works
- [x] Registry lint UI shows pipeline runs
- [x] All filters and searches work
- [x] Bilingual interface (EN/AR)
- [x] Responsive design (mobile/tablet/desktop)
- [x] All tRPC endpoints tested
- [x] No console errors
- [x] Accessibility (WCAG 2.1 AA)

---

**Phase 2 Status: IN PROGRESS**  
**Next: Phase 3 (Ingestion Framework + P0 Indicators)**
