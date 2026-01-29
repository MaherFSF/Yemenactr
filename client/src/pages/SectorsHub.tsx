/**
 * SectorsHub - Main sectors navigation page
 * Lists all 16 sectors with their status and coverage
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  TrendingUp, 
  DollarSign, 
  Banknote, 
  Building2, 
  Landmark, 
  Ship, 
  Fuel, 
  Users, 
  Heart, 
  Wheat, 
  HandHeart, 
  AlertTriangle, 
  Building, 
  Leaf, 
  Briefcase, 
  Coins,
  ChevronRight,
  CheckCircle2,
  Clock
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp className="h-6 w-6" />,
  DollarSign: <DollarSign className="h-6 w-6" />,
  Banknote: <Banknote className="h-6 w-6" />,
  Building2: <Building2 className="h-6 w-6" />,
  Landmark: <Landmark className="h-6 w-6" />,
  Ship: <Ship className="h-6 w-6" />,
  Fuel: <Fuel className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
  Heart: <Heart className="h-6 w-6" />,
  Wheat: <Wheat className="h-6 w-6" />,
  HandHeart: <HandHeart className="h-6 w-6" />,
  AlertTriangle: <AlertTriangle className="h-6 w-6" />,
  Building: <Building className="h-6 w-6" />,
  Leaf: <Leaf className="h-6 w-6" />,
  Briefcase: <Briefcase className="h-6 w-6" />,
  Coins: <Coins className="h-6 w-6" />
};

export default function SectorsHub() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const { data: sectorsData, isLoading } = trpc.sectorPages.getAllSectors.useQuery();

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(16)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const sectors = sectorsData?.sectors || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isArabic ? 'القطاعات الاقتصادية' : 'Economic Sectors'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {isArabic 
              ? 'استكشف 16 قطاعاً اقتصادياً مع بيانات مدعومة بالأدلة وتحليلات شاملة'
              : 'Explore 16 economic sectors with evidence-backed data and comprehensive analysis'}
          </p>
          <div className="flex gap-4 mt-6">
            <Badge variant="secondary" className="text-sm">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {sectors.filter((s: any) => s.isPublished).length} {isArabic ? 'قطاع منشور' : 'Published'}
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {isArabic ? 'تحديث يومي' : 'Daily Updates'}
            </Badge>
          </div>
        </div>
      </section>

      {/* Sectors Grid */}
      <section className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sectors.map((sector: any) => (
            <Link key={sector.sectorCode} href={`/sectors/${sector.sectorCode}`}>
              <Card 
                className="h-full hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary/50"
                style={{ 
                  borderTopColor: sector.heroColor,
                  borderTopWidth: '4px'
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${sector.heroColor}20` }}
                    >
                      <span style={{ color: sector.heroColor }}>
                        {iconMap[sector.iconName] || <TrendingUp className="h-6 w-6" />}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="text-lg mt-3">
                    {isArabic ? sector.nameAr : sector.nameEn}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {isArabic ? sector.missionAr : sector.missionEn}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {sector.isPublished ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {isArabic ? 'منشور' : 'Published'}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {isArabic ? 'قريباً' : 'Coming Soon'}
                      </Badge>
                    )}
                    {sector.hasRegimeSplit && (
                      <Badge variant="outline" className="text-xs">
                        {isArabic ? 'بيانات منقسمة' : 'Split Data'}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Methodology Note */}
      <section className="container pb-12">
        <Card className="bg-muted/50">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {isArabic ? 'ملاحظة منهجية' : 'Methodology Note'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isArabic 
                    ? 'جميع البيانات المعروضة مدعومة بالأدلة من مصادر موثوقة. نعرض التناقضات والفجوات بشفافية. لا نقدم ادعاءات بدون أدلة.'
                    : 'All data displayed is evidence-backed from credible sources. We transparently show contradictions and gaps. We make no claims without evidence.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
