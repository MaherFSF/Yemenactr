# STATIC UI SCAN REPORT
# مسح واجهة المستخدم الثابتة

Generated: 2026-02-01T17:01:20.205Z

## Summary / الملخص

Total suspicious patterns found: 930

### Pattern: hardcoded KPI (795 matches)

- **client/src/components/AIChatBox.tsx:36**
  ```
  * Placeholder text for the input field
  ```
- **client/src/components/AIChatBox.tsx:38**
  ```
  placeholder?: string;
  ```
- **client/src/components/AIChatBox.tsx:117**
  ```
  placeholder = "Type your message...",
  ```
- **client/src/components/AIChatBox.tsx:316**
  ```
  placeholder={placeholder}
  ```
- **client/src/components/EvidencePackButton.tsx:84**
  ```
  // Default mock data for when only an ID is provided
  ```
- **client/src/components/EvidencePackButton.tsx:85**
  ```
  const getMockEvidenceData = (id: string): EvidencePackData => ({
  ```
- **client/src/components/EvidencePackButton.tsx:115**
  ```
  // Use provided data or generate mock data from ID
  ```
- **client/src/components/EvidencePackButton.tsx:116**
  ```
  const data = providedData || getMockEvidenceData(evidencePackId || packId || "unknown");
  ```
- **client/src/components/Footer.tsx:45**
  ```
  {/* CauseWay Logo SVG - Exact from mockup */}
  ```
- **client/src/components/GlobalSearch.tsx:134**
  ```
  placeholder: { en: "Search indicators, documents, entities...", ar: "ابحث في المؤشرات والوثائق والكي
  ```
... and 785 more

### Pattern: estimated (84 matches)

- **client/src/components/DataQualityBadge.tsx:62**
  ```
  descEn: "Estimated or modeled data with methodological caveats",
  ```
- **client/src/components/EvidencePackButton.tsx:132**
  ```
  C: { en: "Estimated", ar: "تقديري" },
  ```
- **client/src/components/InsightsTicker.tsx:113**
  ```
  valueEn: "$320M estimated Q4",
  ```
- **client/src/components/ProvenanceBadge.tsx:91**
  ```
  description: "Estimated or derived data",
  ```
- **client/src/components/ProvenanceBadge.tsx:423**
  ```
  caveats: ["Estimated value based on available data"],
  ```
- **client/src/contexts/LanguageContext.tsx:195**
  ```
  "data.estimated": "تقديري",
  ```
- **client/src/contexts/LanguageContext.tsx:684**
  ```
  "data.estimated": "Estimated",
  ```
- **client/src/pages/AdvancedSearch.tsx:68**
  ```
  quality: "verified" | "provisional" | "estimated";
  ```
- **client/src/pages/AdvancedSearch.tsx:491**
  ```
  estimated: { en: "Estimated", ar: "تقديري" },
  ```
- **client/src/pages/AdvancedSearch.tsx:630**
  ```
  case "estimated":
  ```
... and 74 more

### Pattern: hardcoded numbers (16 matches)

- **client/src/components/sectors/BankingIntelligenceWall.tsx:863**
  ```
  { name: 'CBY Aden', value: '1.2B', date: 'Jun 2024' },
  ```
- **client/src/pages/EntityDetail.tsx:46**
  ```
  revenueEn: "$2.5B+ (est.)",
  ```
- **client/src/pages/EntityDetail.tsx:118**
  ```
  { labelEn: "Foreign Reserves", labelAr: "الاحتياطيات الأجنبية", value: "$1.2B", trend: "down" },
  ```
- **client/src/pages/HSAGroupProfile.tsx:212**
  ```
  descEn: "Launched 2022. 700,000+ active customers. 14.7M transactions worth $2.5B in 2024. 1.4M+ app
  ```
- **client/src/pages/HSAGroupProfile.tsx:219**
  ```
  transactions: "14.7M ($2.5B)",
  ```
- **client/src/pages/Home.tsx:533**
  ```
  { icon: Globe, labelEn: "Foreign Reserves", labelAr: "الاحتياطيات الأجنبية", value: kpiData?.foreign
  ```
- **client/src/pages/HumanitarianFunding.tsx:76**
  ```
  value: "$2.5B",
  ```
- **client/src/pages/Publications.tsx:85**
  ```
  { en: "Foreign reserves stabilize at $1.2B", ar: "الاحتياطيات الأجنبية تستقر عند 1.2 مليار دولار" },
  ```
- **client/src/pages/admin/InsightMiner.tsx:121**
  ```
  summary: "2026 humanitarian funding is tracking 35% below 2025 levels for the same period. At curren
  ```
- **client/src/pages/sectors/AidFlows.tsx:69**
  ```
  value: "$2.5B",
  ```
... and 6 more

### Pattern: static data object (31 matches)

- **client/src/components/sectors/PricesIntelligenceWall.tsx:255**
  ```
  const chartData = {
  ```
- **client/src/pages/HSAGroupProfile.tsx:54**
  ```
  const hsaData = {
  ```
- **server/connectors/HumanitarianConnector.ts:150**
  ```
  const docData = {
  ```
- **server/connectors/HumanitarianConnector.ts:200**
  ```
  const seriesData = {
  ```
- **server/connectors/HumanitarianConnector.ts:405**
  ```
  const countData = {
  ```
- **server/connectors/HumanitarianConnector.ts:438**
  ```
  const fatalData = {
  ```
- **server/connectors/HumanitarianConnector.ts:570**
  ```
  const docData = {
  ```
- **server/connectors/IMFConnector.ts:210**
  ```
  const seriesData = {
  ```
- **server/connectors/UNAgenciesConnector.ts:157**
  ```
  const seriesData = {
  ```
- **server/connectors/UNAgenciesConnector.ts:321**
  ```
  const seriesData = {
  ```
... and 21 more

### Pattern: major companies (3 matches)

- **client/src/pages/CorporateRegistry.tsx:288**
  ```
  {/* Major Companies Section */}
  ```
- **client/src/pages/CorporateRegistry.tsx:292**
  ```
  <CardTitle>{isArabic ? "الشركات الرئيسية" : "Major Companies"}</CardTitle>
  ```
- **client/src/pages/CorporateRegistry.tsx:343**
  ```
  label={isArabic ? "بيانات الشركات الرئيسية" : "Major companies data"}
  ```

### Pattern: (est.) (1 matches)

- **client/src/pages/EntityDetail.tsx:46**
  ```
  revenueEn: "$2.5B+ (est.)",
  ```

