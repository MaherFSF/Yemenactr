# YETO Platform - System Architecture

## Overview

The Yemen Economic Transparency Observatory (YETO) is a full-stack web application providing comprehensive economic data, analysis, and tools for understanding Yemen's fragmented economy.

```
┌─────────────────────────────────────────────────────────────────┐
│                         YETO Platform                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Frontend   │  │   Backend    │  │   Database   │          │
│  │   (React)    │◄─┤   (Express)  │◄─┤   (MySQL)    │          │
│  │              │  │   + tRPC     │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                                     │
│         │                 │                                     │
│  ┌──────▼──────┐  ┌───────▼───────┐                            │
│  │  shadcn/ui  │  │  LLM Service  │                            │
│  │  Tailwind   │  │  (AI Assist)  │                            │
│  └─────────────┘  └───────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 19** - UI framework with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Wouter** - Lightweight routing
- **React Query** - Server state management (via tRPC)
- **Recharts** - Data visualization

### Backend
- **Express 4** - HTTP server
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - Database queries
- **Superjson** - Extended JSON serialization
- **Manus OAuth** - Authentication

### Database
- **MySQL/TiDB** - Relational database
- **Drizzle Kit** - Schema migrations

### External Services
- **LLM Service** - AI assistant (via invokeLLM)
- **S3 Storage** - File storage
- **Manus Auth** - OAuth provider

## Directory Structure

```
yeto-platform/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── contexts/       # React contexts
│   │   │   ├── LanguageContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   │   └── trpc.ts     # tRPC client
│   │   ├── pages/          # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── sectors/    # Sector pages
│   │   │   └── ...
│   │   ├── App.tsx         # Router & layout
│   │   └── main.tsx        # Entry point
│   └── index.html
├── server/                 # Backend application
│   ├── _core/              # Framework internals
│   │   ├── context.ts      # Request context
│   │   ├── trpc.ts         # tRPC setup
│   │   ├── llm.ts          # LLM integration
│   │   └── env.ts          # Environment config
│   ├── db.ts               # Database queries
│   ├── routers.ts          # tRPC procedures
│   ├── storage.ts          # S3 helpers
│   └── *.test.ts           # Test files
├── drizzle/                # Database schema
│   └── schema.ts           # Table definitions
├── shared/                 # Shared types/constants
└── docs/                   # Documentation
```

## Data Model

### Core Entities

```
┌─────────────────┐     ┌─────────────────┐
│   indicators    │     │    sources      │
├─────────────────┤     ├─────────────────┤
│ code (PK)       │     │ id (PK)         │
│ nameEn/nameAr   │     │ nameEn/nameAr   │
│ unit            │     │ type            │
│ sector          │     │ url             │
│ frequency       │     │ reliabilityScore│
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    ┌──────────────────┘
         │    │
         ▼    ▼
┌─────────────────────────────────────────┐
│            time_series                  │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ indicatorCode (FK)                      │
│ sourceId (FK)                           │
│ regimeTag (aden_irg|sanaa_defacto|...)  │
│ date                                    │
│ value                                   │
│ confidenceRating (A|B|C|D)              │
└─────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐
│ economic_events │     │   documents     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ titleEn/titleAr │     │ titleEn/titleAr │
│ eventDate       │     │ category        │
│ category        │     │ sourceId (FK)   │
│ regimeTag       │     │ publishDate     │
│ impactLevel     │     │ fileUrl         │
│ linkedIndicators│     │ confidenceRating│
└─────────────────┘     └─────────────────┘
```

### Regime Tag System

All data entities include a `regimeTag` field:

| Value | Description |
|-------|-------------|
| `aden_irg` | IRG-controlled areas (Aden, southern governorates) |
| `sanaa_defacto` | DFA-controlled areas (Sana'a, northern governorates) |
| `mixed` | Data covering both areas |
| `unknown` | Unclear regime attribution |

## API Architecture

### tRPC Router Structure

```typescript
appRouter
├── auth
│   ├── me          // Get current user
│   └── logout      // End session
├── timeSeries
│   ├── getByIndicator
│   ├── getLatest
│   └── getAllIndicators
├── geospatial
│   └── getByIndicator
├── events
│   └── list
├── sources
│   ├── getById
│   └── list
├── documents
│   ├── getByCategory
│   └── search
├── glossary
│   ├── list
│   └── search
├── dashboard
│   └── getKeyMetrics
├── sectors
│   └── getMetrics
├── comparison
│   └── getIndicators
├── platform
│   └── getStats
└── ai
    ├── chat        // AI assistant
    └── suggestQueries
```

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Server  │────▶│  OAuth   │
│          │     │          │     │  Server  │
└──────────┘     └──────────┘     └──────────┘
     │                │                │
     │  1. Login      │                │
     │  redirect      │                │
     │───────────────▶│                │
     │                │  2. OAuth      │
     │                │  redirect      │
     │                │───────────────▶│
     │                │                │
     │                │  3. Callback   │
     │                │  with code     │
     │                │◀───────────────│
     │                │                │
     │  4. Set cookie │                │
     │  & redirect    │                │
     │◀───────────────│                │
```

## Frontend Architecture

### Context Providers

```tsx
<ThemeProvider defaultTheme="light">
  <LanguageProvider defaultLanguage="en">
    <TRPCProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </TRPCProvider>
  </LanguageProvider>
</ThemeProvider>
```

### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         Header                              │
│  ┌─────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ ┌────┐  │
│  │Logo │ │Sectors▼│ │ Tools▼ │ │Research│ │About │ │ AR │  │
│  └─────┘ └────────┘ └────────┘ └────────┘ └──────┘ └────┘  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      Page Content                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Hero Section                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │   Card 1      │  │   Card 2      │  │   Card 3      │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                         Footer                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐   │
│  │ About   │ │ Sectors │ │ Tools   │ │ Legal & Contact │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### RTL Support

The platform supports Right-to-Left (RTL) layout for Arabic:

```tsx
// LanguageContext.tsx
const [language, setLanguage] = useState<"en" | "ar">("en");

// Applied via document direction
useEffect(() => {
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = language;
}, [language]);
```

## Security Considerations

### Authentication
- OAuth 2.0 via Manus Auth
- HTTP-only session cookies
- CSRF protection via SameSite cookies

### Authorization
- Public procedures for data viewing
- Protected procedures for AI assistant and submissions
- Admin procedures for data management

### Data Protection
- Input validation via Zod schemas
- SQL injection prevention via Drizzle ORM
- XSS prevention via React's default escaping

## Performance Optimizations

### Frontend
- Code splitting via dynamic imports
- React Query caching for API responses
- Lazy loading for sector pages
- Image optimization for logos/icons

### Backend
- Database connection pooling
- Query result caching (planned)
- Pagination for large datasets
- Rate limiting for AI endpoints

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Manus Platform                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Load Balancer                       │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                 │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │              Application Server                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │   Vite      │  │   Express   │  │   tRPC      │   │  │
│  │  │   (Dev)     │  │   Server    │  │   Router    │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │                    TiDB Database                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    S3 Storage                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Monitoring & Observability

### Logging
- Server-side console logging
- Error tracking via error boundaries
- Request/response logging (planned)

### Metrics (Planned)
- API response times
- Database query performance
- User engagement analytics

## Future Enhancements

1. **Real-time Data Feeds** - WebSocket connections for live market data
2. **Offline Support** - Service worker for offline data access
3. **API Access Tiers** - Rate-limited API for external developers
4. **Advanced Visualizations** - D3.js charts for complex data
5. **Mobile App** - React Native companion app
6. **Data Pipeline** - Automated data ingestion from sources
