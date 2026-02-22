import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTour } from '@/contexts/TourContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TourAnalytics {
  totalUsers: number;
  completionRate: number;
  averageTimeToCompletion: number;
  stepCompletionRates: Record<string, number>;
  confusionPoints: Array<{ step: string; abandonmentRate: number }>;
  userSegments: Record<string, number>;
  timeToFirstCompletion: number;
  repeatVisitors: number;
  achievementUnlockRates: Record<string, number>;
}

const COLORS = ['#C9A961', '#2C3424', '#2e8b6e', '#d4af37', '#b8964d', '#3d5a3d'];

const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'search', label: 'Search Bar' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'sectors', label: 'Sectors' },
  { id: 'tools', label: 'Tools' },
  { id: 'data-repo', label: 'Data Repository' },
  { id: 'ai-assistant', label: 'AI Assistant' },
  { id: 'report-builder', label: 'Report Builder' },
  { id: 'scenario-simulator', label: 'Scenario Simulator' },
];

export const TourAnalyticsDashboard: React.FC = () => {
  const { state } = useTour();
  const [analytics, setAnalytics] = useState<TourAnalytics>({
    totalUsers: 1250,
    completionRate: 68,
    averageTimeToCompletion: 12,
    stepCompletionRates: {
      'welcome': 100,
      'search': 95,
      'dashboard': 88,
      'sectors': 82,
      'tools': 75,
      'data-repo': 70,
      'ai-assistant': 65,
      'report-builder': 58,
      'scenario-simulator': 45,
    },
    confusionPoints: [
      { step: 'Report Builder', abandonmentRate: 42 },
      { step: 'Scenario Simulator', abandonmentRate: 55 },
      { step: 'AI Assistant', abandonmentRate: 35 },
      { step: 'Data Repository', abandonmentRate: 30 },
      { step: 'Tools', abandonmentRate: 25 },
    ],
    userSegments: {
      'Beginner': 450,
      'Intermediate': 600,
      'Advanced': 200,
    },
    timeToFirstCompletion: 18,
    repeatVisitors: 380,
    achievementUnlockRates: {
      'First Steps': 100,
      'Explorer': 68,
      'Data Analyst': 45,
      'Master': 12,
      'Hidden Gem': 8,
    },
  });

  const [dateRange, setDateRange] = useState('7d');

  // Prepare data for charts
  const stepCompletionData = STEPS.map(step => ({
    name: step.label,
    completion: analytics.stepCompletionRates[step.id] || 0,
  }));

  const confusionData = analytics.confusionPoints.map(point => ({
    name: point.step,
    abandonment: point.abandonmentRate,
  }));

  const userSegmentData = Object.entries(analytics.userSegments).map(([name, value]) => ({
    name,
    value,
  }));

  const achievementData = Object.entries(analytics.achievementUnlockRates).map(([name, value]) => ({
    name,
    unlockRate: value,
  }));

  const timeSeriesData = [
    { date: 'Mon', completions: 45, starts: 120 },
    { date: 'Tue', completions: 52, starts: 135 },
    { date: 'Wed', completions: 48, starts: 128 },
    { date: 'Thu', completions: 61, starts: 145 },
    { date: 'Fri', completions: 55, starts: 140 },
    { date: 'Sat', completions: 42, starts: 110 },
    { date: 'Sun', completions: 38, starts: 95 },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#2C3424]">Tour Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor tour performance and user engagement</p>
        </div>
        <div className="flex gap-2">
          <Button variant={dateRange === '7d' ? 'default' : 'outline'} onClick={() => setDateRange('7d')} size="sm">
            7 Days
          </Button>
          <Button variant={dateRange === '30d' ? 'default' : 'outline'} onClick={() => setDateRange('30d')} size="sm">
            30 Days
          </Button>
          <Button variant={dateRange === '90d' ? 'default' : 'outline'} onClick={() => setDateRange('90d')} size="sm">
            90 Days
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#C9A961]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tour Starts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2C3424]">{analytics.totalUsers}</div>
            <p className="text-xs text-green-600 mt-1">↑ 12% from last period</p>
          </CardContent>
        </Card>

        <Card className="border-[#C9A961]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#C9A961]">{analytics.completionRate}%</div>
            <p className="text-xs text-green-600 mt-1">↑ 5% from last period</p>
          </CardContent>
        </Card>

        <Card className="border-[#C9A961]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Time to Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2C3424]">{analytics.averageTimeToCompletion}m</div>
            <p className="text-xs text-red-600 mt-1">↑ 2m from last period</p>
          </CardContent>
        </Card>

        <Card className="border-[#C9A961]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Repeat Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2e8b6e]">{analytics.repeatVisitors}</div>
            <p className="text-xs text-gray-500 mt-1">{Math.round((analytics.repeatVisitors / analytics.totalUsers) * 100)}% of users</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="completion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="completion">Step Completion</TabsTrigger>
          <TabsTrigger value="confusion">Confusion Points</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Step Completion Rate */}
        <TabsContent value="completion">
          <Card>
            <CardHeader>
              <CardTitle>Step Completion Rates</CardTitle>
              <CardDescription>Percentage of users completing each tour step</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stepCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                    formatter={(value) => `${value}%`}
                  />
                  <Bar dataKey="completion" fill="#C9A961" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">Insights:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Welcome step has 100% completion - excellent first impression</li>
                  <li>Significant drop-off at Scenario Simulator (45%) - may need simplification</li>
                  <li>Report Builder at 58% - consider adding more guidance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confusion Points */}
        <TabsContent value="confusion">
          <Card>
            <CardHeader>
              <CardTitle>Confusion Points & Abandonment</CardTitle>
              <CardDescription>Steps where users struggle most and abandon the tour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={confusionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                    formatter={(value) => `${value}% abandon`}
                  />
                  <Bar dataKey="abandonment" fill="#ef4444" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">Recommendations:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li><strong>Scenario Simulator:</strong> Break into smaller steps, add video tutorial</li>
                  <li><strong>Report Builder:</strong> Add template examples, simplify UI</li>
                  <li><strong>AI Assistant:</strong> Show example questions, explain capabilities</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Segments */}
        <TabsContent value="segments">
          <Card>
            <CardHeader>
              <CardTitle>User Difficulty Segments</CardTitle>
              <CardDescription>Distribution of users by skill level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userSegmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userSegmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} users`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                {userSegmentData.map((segment, index) => (
                  <div key={segment.name} className="text-center">
                    <div 
                      className="w-4 h-4 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <p className="font-semibold text-sm">{segment.name}</p>
                    <p className="text-xs text-gray-600">{segment.value} users ({Math.round((segment.value / analytics.totalUsers) * 100)}%)</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Unlock Rates</CardTitle>
              <CardDescription>Gamification engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={achievementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                    formatter={(value) => `${value}%`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="unlockRate" 
                    stroke="#C9A961" 
                    strokeWidth={2}
                    dot={{ fill: '#C9A961', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">Engagement Insights:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li><strong>First Steps:</strong> 100% - All users unlock this achievement</li>
                  <li><strong>Explorer:</strong> 68% - Good engagement, most users explore features</li>
                  <li><strong>Master:</strong> 12% - Only dedicated users reach mastery level</li>
                  <li><strong>Hidden Gem:</strong> 8% - Easter egg discovery is working!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Time Series */}
      <Card>
        <CardHeader>
          <CardTitle>Tour Activity Over Time</CardTitle>
          <CardDescription>Daily tour starts and completions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="starts" 
                stroke="#2e8b6e" 
                strokeWidth={2}
                dot={{ fill: '#2e8b6e', r: 4 }}
                name="Tour Starts"
              />
              <Line 
                type="monotone" 
                dataKey="completions" 
                stroke="#C9A961" 
                strokeWidth={2}
                dot={{ fill: '#C9A961', r: 4 }}
                name="Completions"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-gradient-to-r from-[#C9A961]/10 to-[#2e8b6e]/10 border-[#C9A961]/20">
        <CardHeader>
          <CardTitle className="text-[#2C3424]">Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <p className="font-semibold text-sm">Focus on Scenario Simulator</p>
              <p className="text-sm text-gray-600">55% abandonment rate suggests complexity. Consider breaking into sub-steps or adding interactive examples.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">📚</div>
            <div>
              <p className="font-semibold text-sm">Enhance Report Builder Guidance</p>
              <p className="text-sm text-gray-600">42% abandonment indicates users struggle with customization. Add templates and pre-filled examples.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">🎮</div>
            <div>
              <p className="font-semibold text-sm">Expand Gamification</p>
              <p className="text-sm text-gray-600">Only 12% reach Master achievement. Create more milestone-based rewards to encourage deeper engagement.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TourAnalyticsDashboard;
