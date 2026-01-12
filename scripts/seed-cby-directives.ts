/**
 * Seed Central Bank of Yemen Publications and Directives
 * Adds CBY timeline events and stakeholder data to the database
 */

import mysql from 'mysql2/promise';

// Timeline events for key CBY directives
const cbyTimelineEvents = [
  { year: 1998, month: 6, day: 15, titleAr: 'صدور قانون البنك المركزي اليمني رقم 14', title: 'CBY Law No. 14 Enacted', description: 'Establishment of the legal framework for the Central Bank of Yemen', category: 'banking', level: 'high' },
  { year: 2003, month: 9, day: 1, titleAr: 'صدور قانون البنوك رقم 38', title: 'Banking Law No. 38 Enacted', description: 'Comprehensive banking regulation law establishing modern banking standards', category: 'banking', level: 'high' },
  { year: 2010, month: 3, day: 15, titleAr: 'صدور قانون مكافحة غسل الأموال وتمويل الإرهاب', title: 'AML/CFT Law Enacted', description: 'Anti-Money Laundering and Counter-Terrorism Financing Law No. 1 of 2010', category: 'banking', level: 'high' },
  { year: 2016, month: 9, day: 18, titleAr: 'نقل البنك المركزي اليمني إلى عدن', title: 'CBY Relocated to Aden', description: 'Central Bank of Yemen headquarters moved from Sanaa to Aden', category: 'banking', level: 'critical' },
  { year: 2020, month: 3, day: 20, titleAr: 'إجراءات البنك المركزي لمواجهة كوفيد-19', title: 'CBY COVID-19 Emergency Measures', description: 'Special banking measures implemented in response to COVID-19 pandemic', category: 'banking', level: 'high' },
  { year: 2021, month: 1, day: 10, titleAr: 'إصدار العملة الجديدة', title: 'New Currency Issuance', description: 'CBY-Aden issues new banknotes rejected by Sanaa authorities', category: 'currency', level: 'critical' },
];

// CBY Stakeholders
const cbyStakeholders = [
  { name: 'Central Bank of Yemen - Aden', nameAr: 'البنك المركزي اليمني - عدن', type: 'central_bank' },
  { name: 'Central Bank of Yemen - Sanaa', nameAr: 'البنك المركزي اليمني - صنعاء', type: 'central_bank' },
  { name: 'Ministry of Finance - IRG', nameAr: 'وزارة المالية - الحكومة الشرعية', type: 'government' },
  { name: 'Ministry of Finance - DFA', nameAr: 'وزارة المالية - سلطات الأمر الواقع', type: 'government' },
];

async function main() {
  console.log("=== Starting CBY Publications Seeding ===\n");
  
  const db = await mysql.createConnection(process.env.DATABASE_URL!);
  
  try {
    // Seed timeline events
    console.log("Seeding CBY Timeline Events...");
    for (const event of cbyTimelineEvents) {
      const eventDate = event.year + "-" + String(event.month).padStart(2, '0') + "-" + String(event.day).padStart(2, '0');
      await db.execute(
        "INSERT INTO economic_events (title, titleAr, description, eventDate, category, impactLevel, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE updatedAt = NOW()",
        [event.title, event.titleAr, event.description, eventDate, event.category, event.level]
      );
      console.log("  Seeded: " + event.title + " (" + event.year + ")");
    }
    
    // Seed CBY stakeholder data
    console.log("\nSeeding CBY Stakeholder Data...");
    for (const stakeholder of cbyStakeholders) {
      await db.execute(
        "INSERT INTO research_organizations (name, nameAr, type, country, createdAt) VALUES (?, ?, ?, 'Yemen', NOW()) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)",
        [stakeholder.name, stakeholder.nameAr, stakeholder.type]
      );
      console.log("  Seeded: " + stakeholder.name);
    }
    
    // Summary
    console.log("\n=== CBY Publications Seeding Complete ===");
    console.log("Total Timeline Events: " + cbyTimelineEvents.length);
    console.log("Total Stakeholders: " + cbyStakeholders.length);
    
  } finally {
    await db.end();
  }
}

main().catch(console.error);
