# YETO Data Dictionary
## Yemen Economic Transparency Observatory

**Version 1.0 | January 2026**

---

## 1. Overview

This data dictionary provides comprehensive definitions, units, and metadata for all economic indicators tracked by the Yemen Economic Transparency Observatory (YETO).

---

## 2. Indicator Categories

### 2.1 Macroeconomic Indicators

| Indicator Code | Name (EN) | Name (AR) | Unit | Frequency | Source |
|---------------|-----------|-----------|------|-----------|--------|
| GDP_NOMINAL | Nominal GDP | الناتج المحلي الإجمالي الاسمي | USD Billions | Annual | World Bank |
| GDP_REAL | Real GDP | الناتج المحلي الإجمالي الحقيقي | USD Billions (2015) | Annual | World Bank |
| GDP_GROWTH | GDP Growth Rate | معدل نمو الناتج المحلي | Percent | Annual | IMF |
| GDP_PER_CAPITA | GDP per Capita | نصيب الفرد من الناتج | USD | Annual | World Bank |
| INFLATION_CPI | Consumer Price Inflation | معدل التضخم | Percent YoY | Monthly | CSO Yemen |
| UNEMPLOYMENT | Unemployment Rate | معدل البطالة | Percent | Annual | ILO |

### 2.2 Currency & Exchange Rate Indicators

| Indicator Code | Name (EN) | Name (AR) | Unit | Frequency | Source |
|---------------|-----------|-----------|------|-----------|--------|
| FX_OFFICIAL_ADEN | Official Rate (Aden) | السعر الرسمي (عدن) | YER/USD | Daily | CBY Aden |
| FX_PARALLEL_ADEN | Parallel Rate (Aden) | السعر الموازي (عدن) | YER/USD | Daily | Market Survey |
| FX_PARALLEL_SANAA | Parallel Rate (Sana'a) | السعر الموازي (صنعاء) | YER/USD | Daily | Market Survey |
| FX_SPREAD | North-South Spread | الفجوة شمال-جنوب | Percent | Daily | Calculated |
| FX_RESERVES | Foreign Reserves | الاحتياطيات الأجنبية | USD Billions | Monthly | CBY |

### 2.3 Banking Sector Indicators

| Indicator Code | Name (EN) | Name (AR) | Unit | Frequency | Source |
|---------------|-----------|-----------|------|-----------|--------|
| BANK_ASSETS | Total Bank Assets | إجمالي أصول البنوك | YER Billions | Quarterly | CBY |
| BANK_DEPOSITS | Total Deposits | إجمالي الودائع | YER Billions | Quarterly | CBY |
| BANK_LOANS | Total Loans | إجمالي القروض | YER Billions | Quarterly | CBY |
| NPL_RATIO | Non-Performing Loans | نسبة القروض المتعثرة | Percent | Quarterly | CBY |
| CAR | Capital Adequacy Ratio | نسبة كفاية رأس المال | Percent | Quarterly | CBY |

### 2.4 Trade Indicators

| Indicator Code | Name (EN) | Name (AR) | Unit | Frequency | Source |
|---------------|-----------|-----------|------|-----------|--------|
| IMPORTS_TOTAL | Total Imports | إجمالي الواردات | USD Millions | Monthly | UN Comtrade |
| EXPORTS_TOTAL | Total Exports | إجمالي الصادرات | USD Millions | Monthly | UN Comtrade |
| TRADE_BALANCE | Trade Balance | الميزان التجاري | USD Millions | Monthly | Calculated |
| FOOD_IMPORTS | Food Imports | واردات الغذاء | MT | Monthly | WFP |
| FUEL_IMPORTS | Fuel Imports | واردات الوقود | MT | Monthly | OCHA |

### 2.5 Humanitarian Indicators

| Indicator Code | Name (EN) | Name (AR) | Unit | Frequency | Source |
|---------------|-----------|-----------|------|-----------|--------|
| POP_NEED | People in Need | السكان المحتاجون | Millions | Annual | OCHA |
| IDP_COUNT | Internally Displaced | النازحون داخلياً | Millions | Monthly | IOM |
| FOOD_INSECURE | Food Insecure Population | انعدام الأمن الغذائي | Millions | Quarterly | IPC |
| AID_FUNDING | Humanitarian Funding | التمويل الإنساني | USD Millions | Monthly | OCHA FTS |
| AID_GAP | Funding Gap | فجوة التمويل | Percent | Monthly | OCHA FTS |

### 2.6 Price Indicators

| Indicator Code | Name (EN) | Name (AR) | Unit | Frequency | Source |
|---------------|-----------|-----------|------|-----------|--------|
| WHEAT_PRICE | Wheat Flour Price | سعر دقيق القمح | YER/50kg | Weekly | WFP |
| RICE_PRICE | Rice Price | سعر الأرز | YER/kg | Weekly | WFP |
| SUGAR_PRICE | Sugar Price | سعر السكر | YER/kg | Weekly | WFP |
| OIL_PRICE | Cooking Oil Price | سعر زيت الطهي | YER/liter | Weekly | WFP |
| DIESEL_PRICE | Diesel Price | سعر الديزل | YER/liter | Weekly | Market Survey |
| PETROL_PRICE | Petrol Price | سعر البنزين | YER/liter | Weekly | Market Survey |
| LPG_PRICE | LPG Price | سعر الغاز | YER/cylinder | Weekly | Market Survey |

---

## 3. Data Quality Flags

| Flag | Meaning | Description |
|------|---------|-------------|
| V | Verified | Data verified from multiple sources |
| P | Provisional | Preliminary data subject to revision |
| E | Estimated | Calculated estimate based on proxy data |
| M | Missing | Data not available for this period |
| R | Revised | Data has been revised from earlier release |

---

## 4. Geographic Coverage

| Region Code | Name (EN) | Name (AR) | Authority |
|-------------|-----------|-----------|-----------|
| YE-AD | Aden | عدن | IRG |
| YE-SA | Sana'a | صنعاء | DFA |
| YE-TA | Taiz | تعز | Contested |
| YE-HD | Hadramaut | حضرموت | IRG |
| YE-MA | Marib | مأرب | IRG |
| YE-HO | Hodeidah | الحديدة | DFA |

---

## 5. Time Series Conventions

- **Base Year**: 2015 for real GDP calculations
- **Calendar**: Gregorian calendar used for all dates
- **Time Zone**: GMT+3 (Yemen Standard Time)
- **Vintage**: Data vintage indicated by publication date

---

## 6. Unit Conversions

| From | To | Factor |
|------|----|--------|
| YER | USD | Divide by current exchange rate |
| MT (Metric Tons) | kg | Multiply by 1,000 |
| Billions | Millions | Multiply by 1,000 |

---

**Document Version**: 1.0
**Last Updated**: January 2026

© 2026 Yemen Economic Transparency Observatory (YETO)
