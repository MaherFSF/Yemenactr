/**
 * Access Needed Workflow Service
 * Handles sources that require API keys or partnerships
 * Creates GAP tickets and auto-drafts partnership emails
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export interface AccessNeededSource {
  sourceId: string;
  sourceName: string;
  sourceNameAr?: string;
  accessType: 'api_key' | 'partnership' | 'subscription' | 'credentials';
  contactEmail?: string;
  website?: string;
  notes?: string;
}

export interface EmailDraft {
  id: string;
  sourceId: string;
  sourceName: string;
  to: string;
  cc: string[];
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'archived';
  createdAt: Date;
}

export interface GapTicket {
  id: string;
  sourceId: string;
  sourceName: string;
  ticketType: 'access_needed' | 'data_gap' | 'quality_issue';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'wont_fix';
  description: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Email template for partnership requests
const PARTNERSHIP_EMAIL_TEMPLATE = (source: AccessNeededSource) => `
Dear ${source.sourceName} Data Team,

I am writing on behalf of the Yemen Economic Transparency Observatory (YETO), a non-partisan platform dedicated to providing accurate, evidence-based economic data and analysis for Yemen.

YETO serves as a critical resource for:
- International organizations (UN agencies, World Bank, IMF)
- Humanitarian actors (WFP, OCHA, UNHCR)
- Academic researchers and policy analysts
- Yemeni government institutions
- Private sector stakeholders

We are interested in establishing a data partnership to integrate ${source.sourceName} data into our platform. This would enable:

1. **Wider Reach**: Your data would be accessible to our diverse user base
2. **Enhanced Context**: Integration with Yemen-specific economic indicators
3. **Attribution**: Full source attribution and compliance with your data policies
4. **Quality Assurance**: Our rigorous data governance ensures accuracy

We would be grateful for the opportunity to discuss:
- API access or data sharing arrangements
- Terms of use and attribution requirements
- Technical integration specifications

Please let us know if you would be open to a brief call to explore this partnership.

Best regards,

YETO Data Partnerships Team
partnerships@causewaygrp.com

---
Yemen Economic Transparency Observatory (YETO)
https://yeto.causewaygrp.com
A Causeway Group Initiative
`.trim();

// Email addresses for CC
const CC_ADDRESSES = [
  'archive@causewaygrp.com',
  'ceo@causewaygrp.com',
  'coo@causewaygrp.com',
];

/**
 * Scan registry for sources needing access
 */
export async function scanForAccessNeededSources(): Promise<AccessNeededSource[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [rows] = await db.execute(sql`
    SELECT 
      sourceId,
      name,
      nameAr,
      accessType,
      contactEmail,
      website,
      notes
    FROM evidence_sources
    WHERE authRequired = 1 
      OR needsKey = 1 
      OR partnershipRequired = 1
    ORDER BY name ASC
  `) as any;
  
  return (rows || []).map((row: any) => ({
    sourceId: row.sourceId,
    sourceName: row.name,
    sourceNameAr: row.nameAr,
    accessType: row.accessType || 'api_key',
    contactEmail: row.contactEmail,
    website: row.website,
    notes: row.notes,
  }));
}

/**
 * Create GAP ticket for access-needed source
 */
export async function createAccessGapTicket(source: AccessNeededSource): Promise<GapTicket> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ticketId = `GAP-ACCESS-${source.sourceId}-${Date.now()}`;
  
  const ticket: GapTicket = {
    id: ticketId,
    sourceId: source.sourceId,
    sourceName: source.sourceName,
    ticketType: 'access_needed',
    priority: 'high',
    status: 'open',
    description: `Access required for ${source.sourceName}. Type: ${source.accessType}. ${source.notes || ''}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Insert into database
  await db.execute(sql`
    INSERT INTO data_gap_tickets (
      id, sourceId, sourceName, ticketType, priority, status, description, createdAt, updatedAt
    ) VALUES (
      ${ticket.id},
      ${ticket.sourceId},
      ${ticket.sourceName},
      ${ticket.ticketType},
      ${ticket.priority},
      ${ticket.status},
      ${ticket.description},
      ${ticket.createdAt.toISOString()},
      ${ticket.updatedAt.toISOString()}
    )
    ON DUPLICATE KEY UPDATE
      status = VALUES(status),
      updatedAt = VALUES(updatedAt)
  `);
  
  return ticket;
}

/**
 * Generate email draft for partnership request
 */
export async function generatePartnershipEmailDraft(source: AccessNeededSource): Promise<EmailDraft> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const emailId = `EMAIL-${source.sourceId}-${Date.now()}`;
  
  const draft: EmailDraft = {
    id: emailId,
    sourceId: source.sourceId,
    sourceName: source.sourceName,
    to: 'partnerships@causewaygrp.com',
    cc: CC_ADDRESSES,
    subject: `[YETO] Data Partnership Request - ${source.sourceName}`,
    body: PARTNERSHIP_EMAIL_TEMPLATE(source),
    status: 'draft',
    createdAt: new Date(),
  };
  
  // Store in admin outbox
  await db.execute(sql`
    INSERT INTO admin_email_outbox (
      id, sourceId, sourceName, toAddress, ccAddresses, subject, body, status, createdAt
    ) VALUES (
      ${draft.id},
      ${draft.sourceId},
      ${draft.sourceName},
      ${draft.to},
      ${JSON.stringify(draft.cc)},
      ${draft.subject},
      ${draft.body},
      ${draft.status},
      ${draft.createdAt.toISOString()}
    )
    ON DUPLICATE KEY UPDATE
      status = VALUES(status)
  `);
  
  return draft;
}

/**
 * Get all email drafts from outbox
 */
export async function getEmailOutbox(): Promise<EmailDraft[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [rows] = await db.execute(sql`
    SELECT 
      id, sourceId, sourceName, toAddress, ccAddresses, subject, body, status, createdAt
    FROM admin_email_outbox
    ORDER BY createdAt DESC
    LIMIT 100
  `) as any;
  
  return (rows || []).map((row: any) => ({
    id: row.id,
    sourceId: row.sourceId,
    sourceName: row.sourceName,
    to: row.toAddress,
    cc: JSON.parse(row.ccAddresses || '[]'),
    subject: row.subject,
    body: row.body,
    status: row.status,
    createdAt: new Date(row.createdAt),
  }));
}

/**
 * Get all GAP tickets
 */
export async function getGapTickets(filters?: {
  status?: string;
  ticketType?: string;
  priority?: string;
}): Promise<GapTicket[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let query = `
    SELECT 
      id, sourceId, sourceName, ticketType, priority, status, description, assignedTo, createdAt, updatedAt
    FROM data_gap_tickets
    WHERE 1=1
  `;
  
  if (filters?.status) {
    query += ` AND status = '${filters.status}'`;
  }
  if (filters?.ticketType) {
    query += ` AND ticketType = '${filters.ticketType}'`;
  }
  if (filters?.priority) {
    query += ` AND priority = '${filters.priority}'`;
  }
  
  query += ` ORDER BY 
    CASE priority 
      WHEN 'critical' THEN 1 
      WHEN 'high' THEN 2 
      WHEN 'medium' THEN 3 
      WHEN 'low' THEN 4 
    END,
    createdAt DESC
    LIMIT 200
  `;
  
  const [rows] = await db.execute(sql.raw(query)) as any;
  
  return (rows || []).map((row: any) => ({
    id: row.id,
    sourceId: row.sourceId,
    sourceName: row.sourceName,
    ticketType: row.ticketType,
    priority: row.priority,
    status: row.status,
    description: row.description,
    assignedTo: row.assignedTo,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }));
}

/**
 * Update GAP ticket status
 */
export async function updateGapTicketStatus(
  ticketId: string, 
  status: GapTicket['status'],
  assignedTo?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.execute(sql`
    UPDATE data_gap_tickets
    SET 
      status = ${status},
      assignedTo = ${assignedTo || null},
      updatedAt = ${new Date().toISOString()}
    WHERE id = ${ticketId}
  `);
}

/**
 * Process all access-needed sources
 * Creates GAP tickets and email drafts for each
 */
export async function processAccessNeededSources(): Promise<{
  sourcesProcessed: number;
  ticketsCreated: number;
  emailsGenerated: number;
}> {
  const sources = await scanForAccessNeededSources();
  let ticketsCreated = 0;
  let emailsGenerated = 0;
  
  for (const source of sources) {
    try {
      // Create GAP ticket
      await createAccessGapTicket(source);
      ticketsCreated++;
      
      // Generate email draft if partnership required
      if (source.accessType === 'partnership' || source.accessType === 'subscription') {
        await generatePartnershipEmailDraft(source);
        emailsGenerated++;
      }
    } catch (error) {
      console.error(`Error processing source ${source.sourceId}:`, error);
    }
  }
  
  return {
    sourcesProcessed: sources.length,
    ticketsCreated,
    emailsGenerated,
  };
}

/**
 * Get access workflow summary
 */
export async function getAccessWorkflowSummary(): Promise<{
  totalSourcesNeedingAccess: number;
  openTickets: number;
  pendingEmails: number;
  resolvedThisMonth: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!db) {
    return { totalSourcesNeedingAccess: 0, openTickets: 0, pendingEmails: 0, resolvedThisMonth: 0 };
  }
  
  const [sourcesResult] = await db.execute(sql`
    SELECT COUNT(*) as count FROM evidence_sources
    WHERE authRequired = 1 OR needsKey = 1 OR partnershipRequired = 1
  `) as any;
  
  const [ticketsResult] = await db.execute(sql`
    SELECT COUNT(*) as count FROM data_gap_tickets
    WHERE status = 'open' AND ticketType = 'access_needed'
  `) as any;
  
  const [emailsResult] = await db.execute(sql`
    SELECT COUNT(*) as count FROM admin_email_outbox
    WHERE status = 'draft'
  `) as any;
  
  const [resolvedResult] = await db.execute(sql`
    SELECT COUNT(*) as count FROM data_gap_tickets
    WHERE status = 'resolved' 
      AND ticketType = 'access_needed'
      AND updatedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `) as any;
  
  return {
    totalSourcesNeedingAccess: sourcesResult?.[0]?.count || 0,
    openTickets: ticketsResult?.[0]?.count || 0,
    pendingEmails: emailsResult?.[0]?.count || 0,
    resolvedThisMonth: resolvedResult?.[0]?.count || 0,
  };
}
