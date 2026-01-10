/**
 * Expand Research Organizations Database
 * Adds 50+ organizations that publish Yemen economic research
 */

import { getDb } from '../server/db';
import { researchOrganizations } from '../drizzle/schema';
import { sql } from 'drizzle-orm';

interface Organization {
  name: string;
  nameAr?: string;
  type: string;
  country?: string;
  website?: string;
  description?: string;
  descriptionAr?: string;
}

const newOrganizations: Organization[] = [
  // UN Agencies
  { name: 'United Nations Development Programme (UNDP)', nameAr: 'برنامج الأمم المتحدة الإنمائي', type: 'UN Agency', country: 'International', website: 'https://www.undp.org/yemen', description: 'UN agency focused on sustainable development in Yemen' },
  { name: 'UN Office for the Coordination of Humanitarian Affairs (OCHA)', nameAr: 'مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية', type: 'UN Agency', country: 'International', website: 'https://www.unocha.org/yemen', description: 'Coordinates humanitarian response in Yemen' },
  { name: 'UN Population Fund (UNFPA)', nameAr: 'صندوق الأمم المتحدة للسكان', type: 'UN Agency', country: 'International', website: 'https://yemen.unfpa.org', description: 'Focuses on reproductive health and population data' },
  { name: 'UN Children\'s Fund (UNICEF)', nameAr: 'منظمة الأمم المتحدة للطفولة', type: 'UN Agency', country: 'International', website: 'https://www.unicef.org/yemen', description: 'Child welfare and education programs' },
  { name: 'UN High Commissioner for Refugees (UNHCR)', nameAr: 'المفوضية السامية للأمم المتحدة لشؤون اللاجئين', type: 'UN Agency', country: 'International', website: 'https://www.unhcr.org/yemen', description: 'Refugee and displacement tracking' },
  { name: 'International Organization for Migration (IOM)', nameAr: 'المنظمة الدولية للهجرة', type: 'UN Agency', country: 'International', website: 'https://yemen.iom.int', description: 'Migration and displacement tracking' },
  { name: 'Food and Agriculture Organization (FAO)', nameAr: 'منظمة الأغذية والزراعة', type: 'UN Agency', country: 'International', website: 'https://www.fao.org/yemen', description: 'Agricultural and food security data' },
  { name: 'UN Economic and Social Commission for Western Asia (ESCWA)', nameAr: 'اللجنة الاقتصادية والاجتماعية لغربي آسيا', type: 'UN Agency', country: 'International', website: 'https://www.unescwa.org', description: 'Regional economic analysis' },
  
  // International Financial Institutions
  { name: 'International Finance Corporation (IFC)', nameAr: 'مؤسسة التمويل الدولية', type: 'IFI', country: 'International', website: 'https://www.ifc.org', description: 'Private sector development' },
  { name: 'Arab Monetary Fund', nameAr: 'صندوق النقد العربي', type: 'IFI', country: 'UAE', website: 'https://www.amf.org.ae', description: 'Arab regional monetary cooperation' },
  { name: 'Arab Fund for Economic and Social Development', nameAr: 'الصندوق العربي للإنماء الاقتصادي والاجتماعي', type: 'IFI', country: 'Kuwait', website: 'https://www.arabfund.org', description: 'Arab development financing' },
  { name: 'OPEC Fund for International Development', nameAr: 'صندوق أوبك للتنمية الدولية', type: 'IFI', country: 'Austria', website: 'https://opecfund.org', description: 'Energy and development financing' },
  
  // Think Tanks - International
  { name: 'Sana\'a Center for Strategic Studies', nameAr: 'مركز صنعاء للدراسات الاستراتيجية', type: 'Think Tank', country: 'Yemen', website: 'https://sanaacenter.org', description: 'Independent Yemen-focused research' },
  { name: 'Chatham House', nameAr: 'تشاتام هاوس', type: 'Think Tank', country: 'UK', website: 'https://www.chathamhouse.org', description: 'International affairs research' },
  { name: 'CARPO - Center for Applied Research in Partnership with the Orient', nameAr: 'كاربو', type: 'Think Tank', country: 'Germany', website: 'https://carpo-bonn.org', description: 'Rethinking Yemen\'s Economy initiative' },
  { name: 'Yemen & Gulf Center for Studies (YGCS)', nameAr: 'مركز اليمن والخليج للدراسات', type: 'Think Tank', country: 'Yemen', website: 'https://ygcs.center', description: 'Yemen and Gulf regional analysis' },
  { name: 'Middle East Institute', nameAr: 'معهد الشرق الأوسط', type: 'Think Tank', country: 'USA', website: 'https://www.mei.edu', description: 'Middle East policy research' },
  { name: 'Arab Center Washington DC', nameAr: 'المركز العربي واشنطن', type: 'Think Tank', country: 'USA', website: 'https://arabcenterdc.org', description: 'Arab world policy analysis' },
  { name: 'European Council on Foreign Relations (ECFR)', nameAr: 'المجلس الأوروبي للعلاقات الخارجية', type: 'Think Tank', country: 'EU', website: 'https://ecfr.eu', description: 'European foreign policy research' },
  { name: 'International Crisis Group', nameAr: 'مجموعة الأزمات الدولية', type: 'Think Tank', country: 'Belgium', website: 'https://www.crisisgroup.org', description: 'Conflict prevention research' },
  { name: 'Brookings Institution', nameAr: 'معهد بروكينغز', type: 'Think Tank', country: 'USA', website: 'https://www.brookings.edu', description: 'Public policy research' },
  { name: 'RAND Corporation', nameAr: 'مؤسسة راند', type: 'Think Tank', country: 'USA', website: 'https://www.rand.org', description: 'Policy research and analysis' },
  { name: 'Atlantic Council', nameAr: 'المجلس الأطلسي', type: 'Think Tank', country: 'USA', website: 'https://www.atlanticcouncil.org', description: 'International affairs research' },
  
  // Humanitarian Organizations
  { name: 'Oxfam', nameAr: 'أوكسفام', type: 'NGO', country: 'UK', website: 'https://www.oxfam.org', description: 'Humanitarian and development organization' },
  { name: 'Médecins Sans Frontières (MSF)', nameAr: 'أطباء بلا حدود', type: 'NGO', country: 'France', website: 'https://www.msf.org', description: 'Medical humanitarian organization' },
  { name: 'International Committee of the Red Cross (ICRC)', nameAr: 'اللجنة الدولية للصليب الأحمر', type: 'NGO', country: 'Switzerland', website: 'https://www.icrc.org', description: 'Humanitarian protection and assistance' },
  { name: 'Save the Children', nameAr: 'إنقاذ الطفولة', type: 'NGO', country: 'UK', website: 'https://www.savethechildren.org', description: 'Child welfare organization' },
  { name: 'CARE International', nameAr: 'كير الدولية', type: 'NGO', country: 'USA', website: 'https://www.care.org', description: 'Humanitarian organization' },
  { name: 'Norwegian Refugee Council (NRC)', nameAr: 'المجلس النرويجي للاجئين', type: 'NGO', country: 'Norway', website: 'https://www.nrc.no', description: 'Refugee assistance' },
  { name: 'Mercy Corps', nameAr: 'ميرسي كوربس', type: 'NGO', country: 'USA', website: 'https://www.mercycorps.org', description: 'Humanitarian and development' },
  
  // Data & Research Platforms
  { name: 'ACLED (Armed Conflict Location & Event Data)', nameAr: 'بيانات مواقع وأحداث النزاعات المسلحة', type: 'Data Platform', country: 'USA', website: 'https://acleddata.com', description: 'Conflict event tracking' },
  { name: 'Integrated Food Security Phase Classification (IPC)', nameAr: 'التصنيف المرحلي المتكامل للأمن الغذائي', type: 'Data Platform', country: 'International', website: 'https://www.ipcinfo.org', description: 'Food security classification' },
  { name: 'FEWS NET', nameAr: 'شبكة نظم الإنذار المبكر بالمجاعة', type: 'Data Platform', country: 'USA', website: 'https://fews.net', description: 'Famine early warning' },
  { name: 'Humanitarian Data Exchange (HDX)', nameAr: 'منصة تبادل البيانات الإنسانية', type: 'Data Platform', country: 'International', website: 'https://data.humdata.org', description: 'Humanitarian data sharing' },
  { name: 'ReliefWeb', nameAr: 'ريليف ويب', type: 'Data Platform', country: 'International', website: 'https://reliefweb.int', description: 'Humanitarian information service' },
  
  // Yemeni Government & Institutions
  { name: 'Central Statistical Organization (CSO) Yemen', nameAr: 'الجهاز المركزي للإحصاء', type: 'Government', country: 'Yemen', website: 'http://www.cso-yemen.org', description: 'Official statistics' },
  { name: 'Ministry of Planning and International Cooperation', nameAr: 'وزارة التخطيط والتعاون الدولي', type: 'Government', country: 'Yemen', description: 'Economic planning' },
  { name: 'Ministry of Finance - Yemen', nameAr: 'وزارة المالية', type: 'Government', country: 'Yemen', description: 'Fiscal policy and budgets' },
  { name: 'Yemen Economic Unit', nameAr: 'الوحدة الاقتصادية اليمنية', type: 'Government', country: 'Yemen', description: 'Economic analysis unit' },
  
  // Regional Organizations
  { name: 'Gulf Cooperation Council (GCC)', nameAr: 'مجلس التعاون الخليجي', type: 'Regional', country: 'Saudi Arabia', website: 'https://www.gcc-sg.org', description: 'Gulf regional cooperation' },
  { name: 'League of Arab States', nameAr: 'جامعة الدول العربية', type: 'Regional', country: 'Egypt', website: 'http://www.leagueofarabstates.net', description: 'Arab regional organization' },
  { name: 'Organization of Islamic Cooperation (OIC)', nameAr: 'منظمة التعاون الإسلامي', type: 'Regional', country: 'Saudi Arabia', website: 'https://www.oic-oci.org', description: 'Islamic cooperation organization' },
  
  // Academic & Research Institutions
  { name: 'London School of Economics (LSE)', nameAr: 'كلية لندن للاقتصاد', type: 'Academic', country: 'UK', website: 'https://www.lse.ac.uk', description: 'Academic research' },
  { name: 'Georgetown University - Center for Contemporary Arab Studies', nameAr: 'جامعة جورجتاون - مركز الدراسات العربية المعاصرة', type: 'Academic', country: 'USA', website: 'https://ccas.georgetown.edu', description: 'Arab studies research' },
  { name: 'American University of Beirut (AUB)', nameAr: 'الجامعة الأمريكية في بيروت', type: 'Academic', country: 'Lebanon', website: 'https://www.aub.edu.lb', description: 'Regional academic research' },
  { name: 'King\'s College London - Middle East Studies', nameAr: 'كينغز كوليدج لندن', type: 'Academic', country: 'UK', website: 'https://www.kcl.ac.uk', description: 'Middle East research' },
  
  // Private Sector & Consulting
  { name: 'Moody\'s Analytics', nameAr: 'موديز أناليتكس', type: 'Private', country: 'USA', website: 'https://www.economy.com', description: 'Economic indicators and analysis' },
  { name: 'Economist Intelligence Unit (EIU)', nameAr: 'وحدة المعلومات الاقتصادية', type: 'Private', country: 'UK', website: 'https://www.eiu.com', description: 'Country risk analysis' },
  { name: 'Control Risks', nameAr: 'كونترول ريسكس', type: 'Private', country: 'UK', website: 'https://www.controlrisks.com', description: 'Risk consulting' },
  
  // Media & Journalism
  { name: 'Al Jazeera Centre for Studies', nameAr: 'مركز الجزيرة للدراسات', type: 'Media', country: 'Qatar', website: 'https://studies.aljazeera.net', description: 'Media research center' },
  { name: 'Yemen Times', nameAr: 'يمن تايمز', type: 'Media', country: 'Yemen', description: 'Yemeni news outlet' },
  { name: 'Al-Masdar Online', nameAr: 'المصدر أونلاين', type: 'Media', country: 'Yemen', website: 'https://almasdaronline.com', description: 'Yemeni news and analysis' },
];

async function expandOrganizations() {
  console.log('🏢 Expanding Research Organizations Database...\n');
  
  const db = await getDb();
  if (!db) {
    console.error('❌ Database connection failed');
    process.exit(1);
  }
  
  // Get existing organizations
  const existing = await db.select().from(researchOrganizations);
  console.log(`📊 Current organizations: ${existing.length}`);
  
  const existingNames = new Set(existing.map(o => o.name.toLowerCase()));
  
  let added = 0;
  let skipped = 0;
  
  for (const org of newOrganizations) {
    if (existingNames.has(org.name.toLowerCase())) {
      console.log(`⏭️  Skipping (exists): ${org.name}`);
      skipped++;
      continue;
    }
    
    try {
      await db.insert(researchOrganizations).values({
        name: org.name,
        nameAr: org.nameAr || null,
        type: org.type,
        country: org.country || null,
        website: org.website || null,
        description: org.description || null,
        descriptionAr: org.descriptionAr || null,
      });
      console.log(`✅ Added: ${org.name}`);
      added++;
    } catch (error) {
      console.log(`❌ Error adding ${org.name}:`, error);
    }
  }
  
  // Get final count
  const final = await db.select().from(researchOrganizations);
  
  console.log('\n📈 Summary:');
  console.log(`   Added: ${added}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total organizations: ${final.length}`);
  
  process.exit(0);
}

expandOrganizations().catch(console.error);
