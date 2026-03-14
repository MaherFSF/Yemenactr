# Arabic Mode Review - March 14, 2026

## What works well:
- Full RTL layout - everything flips correctly
- Arabic navigation: الرئيسية, القطاعات, الأدوات, الموارد, الاشتراكات, الإدارة
- Arabic hero text: "لسنوات صُنعت القرارات في الظلام... شيء ما على وشك التغيير"
- Arabic audience cards fully translated
- Arabic sector names all correct
- Arabic footer fully translated
- Stats show in Arabic: 292 مصدر عالمي, +7,868 نقطة بيانات, +1,767 منشور بحثي, 16 قطاع اقتصادي
- Ticker bar shows Arabic: إنتاج النفط - مأرب ~18,000 برميل/يوم

## Issues found:
- Hero text is cut off on the right side (RTL overflow issue) - the text "شيء ما على وشك التغيير" is partially hidden
- The hero paragraph text is also cut off on the right
- CTAs are pushed to the right edge

## Fix needed:
- The hero section needs RTL padding/margin adjustment to prevent text overflow on the right side
