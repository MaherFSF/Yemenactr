/**
 * YETO Stakeholder Engagement Engine
 * 
 * Manages outreach to data providers and stakeholders for:
 * - Access Needed requests (when data is missing)
 * - Partnership development
 * - Data sharing agreements
 */

import { getDb } from "../db";

// Outreach request types
export type OutreachType = 
  | "access_needed"
  | "data_update_request"
  | "partnership_inquiry"
  | "data_quality_feedback"
  | "collaboration_proposal";

// Outreach status
export type OutreachStatus = 
  | "draft"
  | "pending_review"
  | "approved"
  | "sent"
  | "responded"
  | "closed";

// Email template types
export type EmailTemplate = 
  | "access_request"
  | "data_update"
  | "partnership"
  | "feedback"
  | "thank_you";

// Outreach record
interface OutreachRecord {
  id: number;
  entityId: number;
  entityName: string;
  outreachType: OutreachType;
  status: OutreachStatus;
  subject: string;
  bodyEn: string;
  bodyAr: string;
  contactEmail: string;
  contactName?: string;
  datasetRequested?: string;
  indicatorCodes?: string[];
  dateRangeNeeded?: { start: string; end: string };
  gapTicketId?: number;
  createdBy: string;
  createdAt: Date;
  sentAt?: Date;
  respondedAt?: Date;
  responseNotes?: string;
}

// Email templates for different outreach types
const EMAIL_TEMPLATES: Record<EmailTemplate, { subjectEn: string; subjectAr: string; bodyEn: string; bodyAr: string }> = {
  access_request: {
    subjectEn: "YETO Data Access Request - {{dataset}}",
    subjectAr: "طلب الوصول إلى البيانات - يتو - {{dataset}}",
    bodyEn: `Dear {{contactName}},

I am writing on behalf of the Yemen Economic Transparency Observatory (YETO), an independent platform providing evidence-based economic data and analysis on Yemen.

We are seeking access to {{dataset}} data covering the period {{dateRange}}. This data would help us:
- Provide accurate economic indicators to researchers and policymakers
- Enable evidence-based analysis of Yemen's economic situation
- Support transparency and accountability in economic reporting

YETO is committed to:
- Proper attribution and citation of all data sources
- Compliance with any data sharing agreements
- Transparent methodology documentation

We would be grateful for the opportunity to discuss data access arrangements. Please let us know if you require any additional information.

Best regards,
YETO Team
Yemen Economic Transparency Observatory
https://yeto.org`,
    bodyAr: `السيد/السيدة {{contactName}} المحترم/ة،

أكتب إليكم نيابة عن مرصد الشفافية الاقتصادية اليمني (يتو)، وهو منصة مستقلة توفر بيانات وتحليلات اقتصادية قائمة على الأدلة حول اليمن.

نسعى للحصول على بيانات {{dataset}} للفترة {{dateRange}}. ستساعدنا هذه البيانات في:
- توفير مؤشرات اقتصادية دقيقة للباحثين وصناع السياسات
- تمكين التحليل القائم على الأدلة للوضع الاقتصادي في اليمن
- دعم الشفافية والمساءلة في التقارير الاقتصادية

يلتزم يتو بما يلي:
- الإسناد والاستشهاد الصحيح بجميع مصادر البيانات
- الامتثال لأي اتفاقيات مشاركة البيانات
- توثيق المنهجية بشفافية

سنكون ممتنين لفرصة مناقشة ترتيبات الوصول إلى البيانات. يرجى إعلامنا إذا كنتم بحاجة إلى أي معلومات إضافية.

مع أطيب التحيات،
فريق يتو
مرصد الشفافية الاقتصادية اليمني`
  },
  data_update: {
    subjectEn: "YETO Data Update Request - {{dataset}}",
    subjectAr: "طلب تحديث البيانات - يتو - {{dataset}}",
    bodyEn: `Dear {{contactName}},

We are writing to request updated data for {{dataset}}.

Our current data coverage ends at {{lastDate}}, and we would appreciate receiving updates through {{targetDate}}.

This data is used in YETO's economic monitoring and is properly attributed to your organization.

Thank you for your continued support of economic transparency in Yemen.

Best regards,
YETO Team`,
    bodyAr: `السيد/السيدة {{contactName}} المحترم/ة،

نكتب إليكم لطلب بيانات محدثة لـ {{dataset}}.

تنتهي تغطية بياناتنا الحالية في {{lastDate}}، ونقدر الحصول على تحديثات حتى {{targetDate}}.

تُستخدم هذه البيانات في رصد يتو الاقتصادي ويتم إسنادها بشكل صحيح إلى مؤسستكم.

شكراً لدعمكم المستمر للشفافية الاقتصادية في اليمن.

مع أطيب التحيات،
فريق يتو`
  },
  partnership: {
    subjectEn: "YETO Partnership Inquiry",
    subjectAr: "استفسار شراكة - يتو",
    bodyEn: `Dear {{contactName}},

The Yemen Economic Transparency Observatory (YETO) is exploring partnership opportunities with {{entityName}}.

We believe collaboration could benefit both organizations through:
- Shared data access and validation
- Joint analysis and publications
- Enhanced coverage of Yemen's economic landscape

We would welcome the opportunity to discuss potential collaboration.

Best regards,
YETO Team`,
    bodyAr: `السيد/السيدة {{contactName}} المحترم/ة،

يستكشف مرصد الشفافية الاقتصادية اليمني (يتو) فرص الشراكة مع {{entityName}}.

نعتقد أن التعاون يمكن أن يفيد كلتا المؤسستين من خلال:
- الوصول المشترك إلى البيانات والتحقق منها
- التحليل والمنشورات المشتركة
- تعزيز تغطية المشهد الاقتصادي في اليمن

نرحب بفرصة مناقشة التعاون المحتمل.

مع أطيب التحيات،
فريق يتو`
  },
  feedback: {
    subjectEn: "YETO Data Quality Feedback",
    subjectAr: "ملاحظات جودة البيانات - يتو",
    bodyEn: `Dear {{contactName}},

We are writing to share feedback regarding {{dataset}} data quality.

{{feedbackDetails}}

We value your data and want to ensure accurate representation. Please let us know if you have any questions or corrections.

Best regards,
YETO Team`,
    bodyAr: `السيد/السيدة {{contactName}} المحترم/ة،

نكتب لمشاركة ملاحظات حول جودة بيانات {{dataset}}.

{{feedbackDetails}}

نقدر بياناتكم ونريد ضمان التمثيل الدقيق. يرجى إعلامنا إذا كانت لديكم أي أسئلة أو تصحيحات.

مع أطيب التحيات،
فريق يتو`
  },
  thank_you: {
    subjectEn: "Thank You - YETO Data Partnership",
    subjectAr: "شكراً - شراكة بيانات يتو",
    bodyEn: `Dear {{contactName}},

Thank you for providing access to {{dataset}} data.

Your contribution helps YETO provide accurate, evidence-based economic information about Yemen.

We will ensure proper attribution and compliance with any data sharing terms.

Best regards,
YETO Team`,
    bodyAr: `السيد/السيدة {{contactName}} المحترم/ة،

شكراً لتوفير الوصول إلى بيانات {{dataset}}.

تساعد مساهمتكم يتو في توفير معلومات اقتصادية دقيقة قائمة على الأدلة حول اليمن.

سنضمن الإسناد الصحيح والامتثال لأي شروط مشاركة البيانات.

مع أطيب التحيات،
فريق يتو`
  }
};

// Helper function for raw SQL queries
async function rawQuery(query: string, params: any[] = []): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  const connection = (db as any).$client;
  if (connection && connection.execute) {
    const [rows] = await connection.execute(query, params);
    return rows || [];
  }
  return [];
}

/**
 * Create a new outreach request
 */
export async function createOutreachRequest(
  entityId: number,
  outreachType: OutreachType,
  template: EmailTemplate,
  variables: Record<string, string>,
  createdBy: string,
  gapTicketId?: number
): Promise<number> {
  // Get entity details
  const entities = await rawQuery(
    "SELECT * FROM entities WHERE id = ?",
    [entityId]
  );
  
  if (!entities || entities.length === 0) {
    throw new Error(`Entity ${entityId} not found`);
  }
  
  const entity = entities[0];
  
  // Get template
  const emailTemplate = EMAIL_TEMPLATES[template];
  if (!emailTemplate) {
    throw new Error(`Template ${template} not found`);
  }
  
  // Replace variables in template
  let subjectEn = emailTemplate.subjectEn;
  let subjectAr = emailTemplate.subjectAr;
  let bodyEn = emailTemplate.bodyEn;
  let bodyAr = emailTemplate.bodyAr;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    subjectEn = subjectEn.replace(new RegExp(placeholder, 'g'), value);
    subjectAr = subjectAr.replace(new RegExp(placeholder, 'g'), value);
    bodyEn = bodyEn.replace(new RegExp(placeholder, 'g'), value);
    bodyAr = bodyAr.replace(new RegExp(placeholder, 'g'), value);
  }
  
  // Also replace entity name
  subjectEn = subjectEn.replace(/{{entityName}}/g, entity.name);
  subjectAr = subjectAr.replace(/{{entityName}}/g, entity.nameAr || entity.name);
  bodyEn = bodyEn.replace(/{{entityName}}/g, entity.name);
  bodyAr = bodyAr.replace(/{{entityName}}/g, entity.nameAr || entity.name);
  
  // Insert outreach record
  const result = await rawQuery(
    `INSERT INTO stakeholder_outreach 
     (entityId, outreachType, status, subjectEn, subjectAr, bodyEn, bodyAr, 
      contactEmail, gapTicketId, createdBy, createdAt)
     VALUES (?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [entityId, outreachType, subjectEn, subjectAr, bodyEn, bodyAr, 
     entity.contactEmail || '', gapTicketId || null, createdBy]
  ) as any;
  
  return result.insertId || 0;
}

/**
 * Get outreach requests by status
 */
export async function getOutreachRequests(
  status?: OutreachStatus,
  entityId?: number,
  limit: number = 50
): Promise<OutreachRecord[]> {
  let query = `
    SELECT so.*, e.name as entityName, e.nameAr as entityNameAr
    FROM stakeholder_outreach so
    JOIN entities e ON so.entityId = e.id
    WHERE 1=1
  `;
  const params: any[] = [];
  
  if (status) {
    query += " AND so.status = ?";
    params.push(status);
  }
  
  if (entityId) {
    query += " AND so.entityId = ?";
    params.push(entityId);
  }
  
  query += " ORDER BY so.createdAt DESC LIMIT ?";
  params.push(limit);
  
  return await rawQuery(query, params);
}

/**
 * Update outreach status
 */
export async function updateOutreachStatus(
  outreachId: number,
  status: OutreachStatus,
  notes?: string
): Promise<void> {
  let query = "UPDATE stakeholder_outreach SET status = ?";
  const params: any[] = [status];
  
  if (status === "sent") {
    query += ", sentAt = NOW()";
  } else if (status === "responded") {
    query += ", respondedAt = NOW()";
    if (notes) {
      query += ", responseNotes = ?";
      params.push(notes);
    }
  }
  
  query += " WHERE id = ?";
  params.push(outreachId);
  
  await rawQuery(query, params);
}

/**
 * Create access needed request from gap ticket
 */
export async function createAccessNeededFromGap(
  gapTicketId: number,
  createdBy: string
): Promise<number | null> {
  // Get gap ticket details
  const gaps = await rawQuery(
    "SELECT * FROM data_gap_tickets WHERE id = ?",
    [gapTicketId]
  );
  
  if (!gaps || gaps.length === 0) {
    return null;
  }
  
  const gap = gaps[0];
  
  // Find or create entity for the data source
  // For now, create a generic outreach
  const variables = {
    dataset: gap.indicatorCode || gap.description || "Economic Data",
    dateRange: `${gap.startDate || '2010-01-01'} to ${gap.endDate || 'present'}`,
    contactName: "Data Team"
  };
  
  // If we have a source entity, use it
  if (gap.suggestedSourceId) {
    return await createOutreachRequest(
      gap.suggestedSourceId,
      "access_needed",
      "access_request",
      variables,
      createdBy,
      gapTicketId
    );
  }
  
  return null;
}

/**
 * Get partnership matrix (all entities with outreach status)
 */
export async function getPartnershipMatrix(): Promise<any[]> {
  return await rawQuery(`
    SELECT 
      e.id,
      e.name,
      e.nameAr,
      e.entityType,
      e.category,
      e.regimeTag,
      (SELECT COUNT(*) FROM stakeholder_outreach WHERE entityId = e.id) as totalOutreach,
      (SELECT COUNT(*) FROM stakeholder_outreach WHERE entityId = e.id AND status = 'sent') as sentCount,
      (SELECT COUNT(*) FROM stakeholder_outreach WHERE entityId = e.id AND status = 'responded') as respondedCount,
      (SELECT MAX(respondedAt) FROM stakeholder_outreach WHERE entityId = e.id) as lastResponse,
      (SELECT COUNT(*) FROM time_series ts 
       JOIN sources s ON ts.sourceId = s.id 
       WHERE s.publisher LIKE CONCAT('%', e.name, '%')) as dataPointsProvided
    FROM entities e
    WHERE e.entityType IN ('multilateral', 'un_agency', 'national_authority', 'donor')
    ORDER BY e.name
  `);
}

/**
 * Generate outreach summary report
 */
export async function generateOutreachSummary(): Promise<{
  totalOutreach: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  recentActivity: any[];
  pendingFollowups: any[];
}> {
  const [totalResult] = await rawQuery(
    "SELECT COUNT(*) as total FROM stakeholder_outreach"
  );
  
  const statusCounts = await rawQuery(
    "SELECT status, COUNT(*) as count FROM stakeholder_outreach GROUP BY status"
  );
  
  const typeCounts = await rawQuery(
    "SELECT outreachType, COUNT(*) as count FROM stakeholder_outreach GROUP BY outreachType"
  );
  
  const recentActivity = await rawQuery(`
    SELECT so.*, e.name as entityName
    FROM stakeholder_outreach so
    JOIN entities e ON so.entityId = e.id
    ORDER BY so.createdAt DESC
    LIMIT 10
  `);
  
  const pendingFollowups = await rawQuery(`
    SELECT so.*, e.name as entityName,
           DATEDIFF(NOW(), so.sentAt) as daysSinceSent
    FROM stakeholder_outreach so
    JOIN entities e ON so.entityId = e.id
    WHERE so.status = 'sent' AND so.sentAt < DATE_SUB(NOW(), INTERVAL 7 DAY)
    ORDER BY so.sentAt ASC
    LIMIT 20
  `);
  
  return {
    totalOutreach: totalResult?.total || 0,
    byStatus: Object.fromEntries(statusCounts.map((r: any) => [r.status, r.count])),
    byType: Object.fromEntries(typeCounts.map((r: any) => [r.outreachType, r.count])),
    recentActivity,
    pendingFollowups
  };
}
