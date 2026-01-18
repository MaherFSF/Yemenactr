# YETO Platform - Deployment & Operations Guide

## Production Deployment Checklist

### Pre-Deployment (Week Before)

#### Infrastructure
- [ ] PostgreSQL 14+ server provisioned
- [ ] TimescaleDB extension installed
- [ ] Backups configured (daily, weekly, monthly)
- [ ] Monitoring and alerting set up
- [ ] SSL certificates obtained
- [ ] CDN configured for static assets
- [ ] Load balancer configured

#### Application
- [ ] All 320+ tests passing
- [ ] Zero TypeScript errors
- [ ] Performance benchmarks met (<2s load time)
- [ ] Security audit completed
- [ ] Penetration testing passed
- [ ] Code review completed
- [ ] Dependencies audited

#### Data
- [ ] 1,000,000+ observations loaded
- [ ] Data integrity verified
- [ ] Backups tested
- [ ] Migration scripts validated
- [ ] Fallback procedures documented

#### Documentation
- [ ] Operations manual completed
- [ ] Runbooks for common scenarios
- [ ] Emergency procedures documented
- [ ] Team trained
- [ ] Stakeholders briefed

### Deployment Day

#### 1. Pre-Deployment Verification (2 hours before)

```bash
# Verify database connectivity
psql postgresql://yeto_user:password@prod-db.example.com:5432/yeto -c "SELECT version();"

# Verify application builds
pnpm build

# Run smoke tests
pnpm test

# Check disk space
df -h

# Check memory
free -h

# Verify backups
pg_dump -U yeto_user yeto | wc -l
```

#### 2. Database Migration (30 minutes)

```bash
# Create backup
pg_dump -U yeto_user yeto > /backups/yeto-pre-deploy-$(date +%Y%m%d-%H%M%S).sql

# Apply schema updates
psql postgresql://yeto_user:password@prod-db.example.com:5432/yeto -f drizzle/migrations/latest.sql

# Verify schema
psql postgresql://yeto_user:password@prod-db.example.com:5432/yeto -c "\dt yeto.*"

# Run data integrity checks
psql postgresql://yeto_user:password@prod-db.example.com:5432/yeto -f scripts/verify-integrity.sql
```

#### 3. Application Deployment (15 minutes)

```bash
# Build application
pnpm build

# Create deployment package
tar -czf yeto-deploy-$(date +%Y%m%d-%H%M%S).tar.gz dist/ node_modules/ package.json

# Deploy to production
scp yeto-deploy-*.tar.gz prod-server:/opt/yeto/
ssh prod-server "cd /opt/yeto && tar -xzf yeto-deploy-*.tar.gz"

# Start application
ssh prod-server "systemctl restart yeto"

# Verify application is running
curl -s https://yeto.example.com/api/health | jq .
```

#### 4. Post-Deployment Verification (30 minutes)

```bash
# Check application health
curl -s https://yeto.example.com/api/health
curl -s https://yeto.example.com/api/trpc/health.check

# Verify database connectivity
curl -s https://yeto.example.com/api/trpc/system.dbStatus

# Check ingestion status
curl -s https://yeto.example.com/api/trpc/ingestion.status

# Monitor error logs
tail -f /var/log/yeto/error.log

# Check performance metrics
curl -s https://yeto.example.com/api/metrics | jq .
```

#### 5. Smoke Tests (15 minutes)

```bash
# Test homepage
curl -s https://yeto.example.com/ | grep -q "YETO" && echo "✓ Homepage OK"

# Test API endpoints
curl -s https://yeto.example.com/api/trpc/sources.list | jq . && echo "✓ Sources API OK"
curl -s https://yeto.example.com/api/trpc/indicators.list | jq . && echo "✓ Indicators API OK"
curl -s https://yeto.example.com/api/trpc/observations.latest | jq . && echo "✓ Observations API OK"

# Test authentication
curl -s https://yeto.example.com/api/oauth/callback?code=test && echo "✓ Auth OK"

# Test data export
curl -s https://yeto.example.com/api/trpc/data.export?format=csv | head && echo "✓ Export OK"
```

### Post-Deployment (Week After)

#### Daily Monitoring
- [ ] Check ingestion status (all 14 Tier 1 connectors)
- [ ] Monitor error rates (<1%)
- [ ] Verify data quality metrics
- [ ] Check performance metrics
- [ ] Review user feedback

#### Weekly Review
- [ ] Analyze ingestion success rates
- [ ] Review data quality reports
- [ ] Check system performance
- [ ] Update source reliability scores
- [ ] Identify optimization opportunities

#### Monthly Review
- [ ] Comprehensive audit
- [ ] Security review
- [ ] Performance optimization
- [ ] Capacity planning
- [ ] Strategic planning

---

## Operations Manual

### Daily Operations

#### Morning Checklist (06:00 UTC)

```bash
#!/bin/bash
# Daily operations checklist

echo "=== YETO Daily Operations Checklist ==="
echo ""

# 1. Database health
echo "1. Database Health"
psql $DATABASE_URL -c "SELECT count(*) FROM yeto.observation;" || echo "✗ DB Connection Failed"

# 2. Ingestion status
echo "2. Ingestion Status"
psql $DATABASE_URL -c "
  SELECT 
    status, 
    COUNT(*) as count,
    MAX(updated_at) as last_update
  FROM yeto.ingestion_run
  WHERE started_at >= NOW() - INTERVAL '24 hours'
  GROUP BY status;
" || echo "✗ Ingestion Query Failed"

# 3. Error rate
echo "3. Error Rate"
psql $DATABASE_URL -c "
  SELECT 
    (SELECT COUNT(*) FROM yeto.ingestion_run WHERE status = 'FAILED' AND started_at >= NOW() - INTERVAL '24 hours') as failed,
    (SELECT COUNT(*) FROM yeto.ingestion_run WHERE started_at >= NOW() - INTERVAL '24 hours') as total
;" || echo "✗ Error Rate Query Failed"

# 4. Data freshness
echo "4. Data Freshness"
psql $DATABASE_URL -c "
  SELECT 
    indicator_code,
    MAX(observation_date) as latest_date,
    NOW() - MAX(observation_date) as age
  FROM yeto.observation o
  JOIN yeto.series s ON o.series_id = s.id
  JOIN yeto.indicator i ON s.indicator_id = i.id
  GROUP BY indicator_code
  ORDER BY age DESC
  LIMIT 10;
" || echo "✗ Freshness Query Failed"

# 5. Disk space
echo "5. Disk Space"
df -h | grep -E "^/dev/|Filesystem"

# 6. Memory usage
echo "6. Memory Usage"
free -h | grep -E "^Mem|total"

echo ""
echo "=== Checklist Complete ==="
```

#### Incident Response

**If ingestion fails:**

```bash
# 1. Check ingestion logs
tail -f /var/log/yeto/ingestion.log

# 2. Identify failed source
psql $DATABASE_URL -c "
  SELECT source_id, error_summary, ended_at
  FROM yeto.ingestion_task
  WHERE status = 'FAILED'
  ORDER BY ended_at DESC
  LIMIT 5;
"

# 3. Check source status
psql $DATABASE_URL -c "
  SELECT src_id, name_en, active, updated_at
  FROM yeto.source
  WHERE id = 'SOURCE_ID';
"

# 4. Retry ingestion
curl -X POST https://yeto.example.com/api/trpc/ingestion.retry \
  -H "Content-Type: application/json" \
  -d '{"sourceId": "SOURCE_ID"}'

# 5. If still failing, create Gap Ticket
psql $DATABASE_URL -c "
  INSERT INTO yeto.data_gap_ticket (
    source_id, indicator_id, date_range_start, date_range_end, 
    reason, severity, status
  ) VALUES (
    'SOURCE_ID', NULL, NOW() - INTERVAL '1 day', NOW(),
    'Ingestion failed - investigate', 'HIGH', 'OPEN'
  );
"
```

**If database is slow:**

```bash
# 1. Check slow queries
psql $DATABASE_URL -c "
  SELECT query, calls, mean_exec_time, max_exec_time
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;
"

# 2. Analyze table
ANALYZE yeto.observation;
ANALYZE yeto.series;

# 3. Reindex if needed
REINDEX TABLE yeto.observation;

# 4. Check index usage
psql $DATABASE_URL -c "
  SELECT schemaname, tablename, indexname, idx_scan
  FROM pg_stat_user_indexes
  WHERE idx_scan = 0
  ORDER BY idx_scan ASC;
"
```

**If API is unresponsive:**

```bash
# 1. Check application logs
tail -f /var/log/yeto/app.log

# 2. Check process status
ps aux | grep node

# 3. Check memory usage
top -b -n 1 | grep node

# 4. Check open connections
netstat -an | grep ESTABLISHED | wc -l

# 5. Restart application
systemctl restart yeto

# 6. Verify restart
curl -s https://yeto.example.com/api/health | jq .
```

---

## Monitoring & Alerting

### Key Metrics to Monitor

```yaml
Database:
  - Connection pool usage
  - Query execution time (p50, p95, p99)
  - Disk usage
  - Backup status
  - Replication lag

Application:
  - Request rate (requests/second)
  - Error rate (errors/second)
  - Response time (p50, p95, p99)
  - Memory usage
  - CPU usage

Ingestion:
  - Success rate (%)
  - Records ingested (per day)
  - Data freshness (hours old)
  - Gap ticket count
  - Source availability

Data Quality:
  - Observation count
  - Triangulation rate (%)
  - Anomaly detection rate
  - Confidence score (average)
  - Regime consistency
```

### Alert Thresholds

```yaml
Critical (Page on-call):
  - Database down
  - API error rate > 5%
  - Ingestion failed for 24 hours
  - Disk usage > 90%
  - Memory usage > 95%

High (Email alert):
  - API response time > 5s (p95)
  - Ingestion error rate > 1%
  - Data freshness > 48 hours old
  - Gap ticket count > 100
  - Source availability < 80%

Medium (Log alert):
  - API response time > 2s (p95)
  - Ingestion error rate > 0.1%
  - Data freshness > 24 hours old
  - Source reliability score < 70%
```

---

## Backup & Recovery

### Backup Strategy

```bash
# Daily backup (automated)
0 2 * * * pg_dump -U yeto_user yeto | gzip > /backups/yeto-daily-$(date +\%Y\%m\%d).sql.gz

# Weekly backup (full)
0 3 * * 0 pg_dump -U yeto_user yeto | gzip > /backups/yeto-weekly-$(date +\%Y\%m\%d).sql.gz

# Monthly backup (archive)
0 4 1 * * pg_dump -U yeto_user yeto | gzip > /backups/archive/yeto-monthly-$(date +\%Y\%m\%d).sql.gz

# Verify backups
0 5 * * * gunzip -t /backups/yeto-daily-*.sql.gz && echo "Backups OK" || echo "Backup verification failed"
```

### Recovery Procedure

```bash
# 1. Stop application
systemctl stop yeto

# 2. Backup current database
pg_dump -U yeto_user yeto > /backups/yeto-pre-recovery-$(date +%Y%m%d-%H%M%S).sql

# 3. Drop current database
psql -U postgres -c "DROP DATABASE yeto;"

# 4. Restore from backup
gunzip < /backups/yeto-daily-20260117.sql.gz | psql -U yeto_user -d yeto

# 5. Verify recovery
psql -U yeto_user yeto -c "SELECT COUNT(*) FROM yeto.observation;"

# 6. Start application
systemctl start yeto

# 7. Verify application
curl -s https://yeto.example.com/api/health | jq .
```

---

## Scaling & Performance

### Horizontal Scaling

```
Load Balancer
    ↓
┌───────────────────────────────────┐
│  API Servers (3-5 instances)      │
│  - Node.js + Express              │
│  - Stateless                       │
│  - Auto-scaling based on CPU/mem  │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│  PostgreSQL (Primary + Replicas)  │
│  - Primary: Write operations      │
│  - Replicas: Read operations      │
│  - Streaming replication          │
└───────────────────────────────────┘
```

### Vertical Scaling

| Component | Current | Recommended (1M observations) |
|-----------|---------|-------------------------------|
| API Server | 2 vCPU, 4GB RAM | 4 vCPU, 8GB RAM |
| Database | 4 vCPU, 16GB RAM | 8 vCPU, 32GB RAM |
| Storage | 100GB | 500GB |

### Caching Strategy

```typescript
// Redis caching for frequently accessed data
const cache = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

// Cache indicators (1 hour TTL)
const indicators = await cache.getex('indicators', { EX: 3600 }) ||
  await db.query.indicator.findMany();

// Cache sources (1 day TTL)
const sources = await cache.getex('sources', { EX: 86400 }) ||
  await db.query.source.findMany();

// Cache observations (5 minutes TTL)
const observations = await cache.getex(`obs:${seriesId}`, { EX: 300 }) ||
  await db.query.observation.findMany({ where: ... });
```

---

## Security Hardening

### Network Security
- [ ] Enable SSL/TLS for all connections
- [ ] Configure firewall rules
- [ ] Enable DDoS protection
- [ ] Set up WAF rules
- [ ] Enable VPN for admin access

### Application Security
- [ ] Enable CORS restrictions
- [ ] Implement rate limiting
- [ ] Enable CSRF protection
- [ ] Sanitize all inputs
- [ ] Implement output encoding

### Database Security
- [ ] Enable encryption at rest
- [ ] Enable encryption in transit
- [ ] Implement row-level security
- [ ] Enable audit logging
- [ ] Regular security updates

### Access Control
- [ ] Implement role-based access control
- [ ] Enable multi-factor authentication
- [ ] Audit all admin actions
- [ ] Rotate credentials regularly
- [ ] Implement principle of least privilege

---

## Troubleshooting Guide

### Common Issues

**Issue: Slow API responses**
```bash
# Check database query performance
EXPLAIN ANALYZE SELECT * FROM yeto.observation WHERE series_id = '...';

# Add missing indexes
CREATE INDEX idx_observation_series_date ON yeto.observation(series_id, observation_date DESC);

# Analyze table statistics
ANALYZE yeto.observation;
```

**Issue: High memory usage**
```bash
# Check for memory leaks
node --inspect server.js

# Monitor heap usage
node --max-old-space-size=4096 server.js

# Restart application
systemctl restart yeto
```

**Issue: Ingestion failures**
```bash
# Check connector logs
tail -f /var/log/yeto/connectors.log

# Verify API credentials
echo $WORLD_BANK_API_KEY

# Test connector manually
curl -s "https://api.worldbank.org/v2/country/YEM/indicator/NY.GDP.MKTP.CD?format=json"
```

---

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TimescaleDB Documentation](https://docs.timescale.com/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
