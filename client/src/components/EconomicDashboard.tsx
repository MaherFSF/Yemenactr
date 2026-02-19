import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

interface DashboardMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
  source: string;
  confidence: 'A' | 'B' | 'C' | 'D';
}

export function EconomicDashboard() {
  const { language } = useLanguage();
  const { data: dashboardData, isLoading } = trpc.dashboard.getEconomicIndicators.useQuery();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Exchange rate comparison data
  const exchangeRateData = useMemo(() => ({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: language === 'ar' ? 'سعر عدن' : 'Aden Rate',
        data: [510, 515, 520, 525, 530, 535],
        borderColor: '#2e8b6e',
        backgroundColor: 'rgba(46, 139, 110, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#2e8b6e',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: language === 'ar' ? 'سعر صنعاء' : 'Sanaa Rate',
        data: [620, 625, 630, 635, 640, 645],
        borderColor: '#d32f2f',
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#d32f2f',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }), [language]);

  // Sector health heatmap data
  const sectorHealthData = useMemo(() => ({
    labels: [
      language === 'ar' ? 'البنوك' : 'Banking',
      language === 'ar' ? 'التجارة' : 'Trade',
      language === 'ar' ? 'الطاقة' : 'Energy',
      language === 'ar' ? 'الغذاء' : 'Food',
      language === 'ar' ? 'العمل' : 'Labor',
      language === 'ar' ? 'الأسعار' : 'Prices',
    ],
    datasets: [
      {
        label: language === 'ar' ? 'صحة القطاع' : 'Sector Health',
        data: [65, 45, 35, 55, 40, 25],
        backgroundColor: [
          '#4caf50', // Green - Banking
          '#ff9800', // Orange - Trade
          '#f44336', // Red - Energy
          '#ff9800', // Orange - Food
          '#f44336', // Red - Labor
          '#f44336', // Red - Prices
        ],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }), [language]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: '500' as const },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        borderColor: '#2e8b6e',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  // Key metrics cards
  const metrics: DashboardMetric[] = [
    {
      label: language === 'ar' ? 'سعر الصرف (عدن)' : 'Exchange Rate (Aden)',
      value: '535',
      change: 4.9,
      trend: 'down',
      unit: 'YER/USD',
      source: 'CBY Aden',
      confidence: 'A',
    },
    {
      label: language === 'ar' ? 'معدل التضخم' : 'Inflation Rate',
      value: '47.2',
      change: 2.1,
      trend: 'up',
      unit: '%',
      source: 'World Bank',
      confidence: 'B',
    },
    {
      label: language === 'ar' ? 'نمو الناتج المحلي' : 'GDP Growth',
      value: '-2.5',
      change: -0.8,
      trend: 'down',
      unit: '%',
      source: 'IMF',
      confidence: 'B',
    },
    {
      label: language === 'ar' ? 'تدفقات المساعدات' : 'Aid Flows',
      value: '2.1B',
      change: 12.3,
      trend: 'up',
      unit: 'USD',
      source: 'OCHA',
      confidence: 'A',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-8 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-l-4 border-l-[#2e8b6e] animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    {metric.unit && <p className="text-xs text-gray-500">{metric.unit}</p>}
                  </div>
                  <div className={`flex items-center gap-1 ${metric.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                    {metric.trend === 'up' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    <span className="text-sm font-semibold">{Math.abs(metric.change)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-gray-500">{metric.source}</span>
                  <div className="flex items-center gap-1">
                    {metric.confidence === 'A' ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <AlertCircle size={14} className="text-yellow-500" />
                    )}
                    <span className="text-xs font-semibold text-gray-600">{metric.confidence}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exchange Rate Comparison */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'ar' ? 'مقارنة سعر الصرف' : 'Exchange Rate Comparison'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Line data={exchangeRateData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Sector Health Heatmap */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'ar' ? 'صحة القطاعات الاقتصادية' : 'Economic Sector Health'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Bar 
                data={sectorHealthData} 
                options={{
                  ...chartOptions,
                  indexAxis: 'y' as const,
                  scales: {
                    x: {
                      beginAtZero: true,
                      max: 100,
                      grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    },
                    y: {
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality & Sources */}
      <Card className="bg-gradient-to-r from-[#2e8b6e] to-[#1f2d1d] text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'ar' ? 'جودة البيانات والمصادر' : 'Data Quality & Sources'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">292+</p>
              <p className="text-sm text-green-100">
                {language === 'ar' ? 'مصادر البيانات' : 'Data Sources'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">234</p>
              <p className="text-sm text-green-100">
                {language === 'ar' ? 'مصادر نشطة' : 'Active Sources'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">6.7K+</p>
              <p className="text-sm text-green-100">
                {language === 'ar' ? 'نقاط البيانات' : 'Data Points'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">898+</p>
              <p className="text-sm text-green-100">
                {language === 'ar' ? 'حزم الأدلة' : 'Evidence Packs'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EconomicDashboard;
