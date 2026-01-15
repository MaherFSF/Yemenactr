/**
 * Adaptive Personalization Engine
 * User segmentation, content recommendations, and personalized dashboards
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface UserBehavior {
  userId: string;
  action: 'view' | 'search' | 'export' | 'share' | 'bookmark' | 'comment';
  targetId: string;
  targetType: 'indicator' | 'event' | 'document' | 'report' | 'term';
  timestamp: Date;
  dwellTime: number; // seconds
  metadata: Record<string, unknown>;
}

export interface UserProfile {
  userId: string;
  role: 'policymaker' | 'donor' | 'researcher' | 'banker' | 'trader' | 'public';
  interests: string[];
  expertiseLevel: 'novice' | 'intermediate' | 'expert';
  riskTolerance: number; // 0-1
  preferredLanguage: 'ar' | 'en';
  lastActive: Date;
  totalEngagements: number;
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  userCount: number;
  characteristics: Record<string, unknown>;
  recommendedContent: string[];
}

export interface ContentRecommendation {
  contentId: string;
  contentType: string;
  title: string;
  relevance: number; // 0-1
  reason: string;
  rank: number;
}

export interface PersonalizedDashboard {
  userId: string;
  layout: 'default' | 'compact' | 'detailed';
  widgets: DashboardWidget[];
  savedSearches: SavedSearch[];
  watchlist: string[];
  alertThresholds: Record<string, number>;
}

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'timeline' | 'alerts' | 'recommendations';
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: Record<string, unknown>;
  createdDate: Date;
  lastUsed: Date;
  useCount: number;
}

export interface AlertPreference {
  metricId: string;
  threshold: number;
  direction: 'above' | 'below' | 'change';
  frequency: 'immediate' | 'daily' | 'weekly';
  channels: ('email' | 'push' | 'sms' | 'dashboard')[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  recipients: string[];
  format: 'pdf' | 'html' | 'xlsx';
}

export interface ReportSection {
  id: string;
  type: 'summary' | 'analysis' | 'charts' | 'tables' | 'recommendations';
  title: string;
  config: Record<string, unknown>;
}

// ============================================================================
// Personalization Engine
// ============================================================================

export class PersonalizationEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private userBehaviors: UserBehavior[] = [];
  private userSegments: Map<string, UserSegment> = new Map();
  private personalizedDashboards: Map<string, PersonalizedDashboard> = new Map();
  private savedSearches: Map<string, SavedSearch[]> = new Map();
  private alertPreferences: Map<string, AlertPreference[]> = new Map();
  private reportTemplates: Map<string, ReportTemplate> = new Map();

  // Configuration
  private segmentationInterval: number = 24 * 60 * 60 * 1000; // 24 hours
  private lastSegmentation: Date = new Date();

  constructor() {
    this.initializeDefaultSegments();
  }

  /**
   * Initialize default user segments
   */
  private initializeDefaultSegments(): void {
    const segments: UserSegment[] = [
      {
        id: 'policymakers',
        name: 'Policymakers',
        description: 'Government officials and policy advisors',
        userCount: 0,
        characteristics: { role: 'policymaker', expertiseLevel: 'intermediate' },
        recommendedContent: ['policy_briefs', 'fiscal_indicators', 'trade_data'],
      },
      {
        id: 'donors',
        name: 'Donors & UN Agencies',
        description: 'International organizations and donors',
        userCount: 0,
        characteristics: { role: 'donor', expertiseLevel: 'intermediate' },
        recommendedContent: ['humanitarian_data', 'funding_gaps', 'program_coverage'],
      },
      {
        id: 'researchers',
        name: 'Researchers',
        description: 'Academic and independent researchers',
        userCount: 0,
        characteristics: { role: 'researcher', expertiseLevel: 'expert' },
        recommendedContent: ['methodologies', 'datasets', 'publications'],
      },
      {
        id: 'bankers',
        name: 'Banking & Compliance',
        description: 'Bankers and compliance officers',
        userCount: 0,
        characteristics: { role: 'banker', expertiseLevel: 'intermediate' },
        recommendedContent: ['regulatory_changes', 'sanctions_updates', 'compliance_insights'],
      },
      {
        id: 'traders',
        name: 'Private Sector & Traders',
        description: 'Business leaders and traders',
        userCount: 0,
        characteristics: { role: 'trader', expertiseLevel: 'intermediate' },
        recommendedContent: ['trade_data', 'fx_rates', 'commodity_prices'],
      },
    ];

    for (const segment of segments) {
      this.userSegments.set(segment.id, segment);
    }
  }

  /**
   * Create or update user profile
   */
  public createUserProfile(userId: string, role: string): UserProfile {
    const profile: UserProfile = {
      userId,
      role: role as any,
      interests: [],
      expertiseLevel: 'novice',
      riskTolerance: 0.5,
      preferredLanguage: 'en',
      lastActive: new Date(),
      totalEngagements: 0,
    };

    this.userProfiles.set(userId, profile);
    this.personalizedDashboards.set(userId, this.createDefaultDashboard(userId));
    this.savedSearches.set(userId, []);
    this.alertPreferences.set(userId, []);

    return profile;
  }

  /**
   * Track user behavior
   */
  public trackBehavior(behavior: UserBehavior): void {
    this.userBehaviors.push(behavior);

    // Update user profile
    const profile = this.userProfiles.get(behavior.userId);
    if (profile) {
      profile.lastActive = behavior.timestamp;
      profile.totalEngagements += 1;

      // Update interests based on behavior
      if (!profile.interests.includes(behavior.targetType)) {
        profile.interests.push(behavior.targetType);
      }

      // Update expertise level based on engagement
      if (profile.totalEngagements > 100) {
        profile.expertiseLevel = 'expert';
      } else if (profile.totalEngagements > 20) {
        profile.expertiseLevel = 'intermediate';
      }
    }
  }

  /**
   * Segment users
   */
  public segmentUsers(): void {
    // Group users by behavior and profile
    const segments = new Map<string, string[]>();

    const entries = Array.from(this.userProfiles.entries() as IterableIterator<[string, UserProfile]>);
    for (const [userId, profile] of entries) {
      let segmentId = 'default';

      if (profile.role === 'policymaker') {
        segmentId = 'policymakers';
      } else if (profile.role === 'donor') {
        segmentId = 'donors';
      } else if (profile.role === 'researcher') {
        segmentId = 'researchers';
      } else if (profile.role === 'banker') {
        segmentId = 'bankers';
      } else if (profile.role === 'trader') {
        segmentId = 'traders';
      }

      if (!segments.has(segmentId)) {
        segments.set(segmentId, []);
      }
      segments.get(segmentId)!.push(userId);
    }

    // Update segment sizes
    const segmentEntries = Array.from(segments.entries() as IterableIterator<[string, string[]]>);
    for (const [segmentId, userIds] of segmentEntries) {
      const segment = this.userSegments.get(segmentId);
      if (segment) {
        segment.userCount = userIds.length;
      }
    }

    this.lastSegmentation = new Date();
  }

  /**
   * Recommend content using collaborative filtering
   */
  public recommendContent(userId: string, topK: number = 5): ContentRecommendation[] {
    const profile = this.userProfiles.get(userId);
    if (!profile) return [];

    const recommendations: ContentRecommendation[] = [];

    // Find similar users
    const similarUsers = this.findSimilarUsers(userId, 5);

    // Get content liked by similar users
    const contentScores = new Map<string, number>();

    for (const similarUserId of similarUsers) {
      const behaviors = this.userBehaviors.filter(
        (b) => b.userId === similarUserId && (b.action === 'view' || b.action === 'bookmark')
      );

      for (const behavior of behaviors) {
        const score = contentScores.get(behavior.targetId) || 0;
        contentScores.set(behavior.targetId, score + 1);
      }
    }

    // Convert to recommendations
    const scoreEntries = Array.from(contentScores.entries() as IterableIterator<[string, number]>);
    for (const [contentId, score] of scoreEntries) {
      recommendations.push({
        contentId,
        contentType: 'indicator', // Placeholder
        title: `Content ${contentId}`,
        relevance: Math.min(score / 5, 1),
        reason: 'Recommended by similar users',
        rank: recommendations.length + 1,
      });
    }

    // Sort by relevance
    recommendations.sort((a, b) => b.relevance - a.relevance);

    return recommendations.slice(0, topK);
  }

  /**
   * Find similar users
   */
  private findSimilarUsers(userId: string, topK: number = 5): string[] {
    const profile = this.userProfiles.get(userId);
    if (!profile) return [];

    const similarities: Array<[string, number]> = [];

    const entries = Array.from(this.userProfiles.entries() as IterableIterator<[string, UserProfile]>);
    for (const [otherUserId, otherProfile] of entries) {
      if (otherUserId === userId) continue;

      // Simple similarity: same role + similar expertise
      let similarity = 0;

      if (profile.role === otherProfile.role) {
        similarity += 0.5;
      }

      if (Math.abs(profile.expertiseLevel.length - otherProfile.expertiseLevel.length) < 2) {
        similarity += 0.3;
      }

      if (profile.interests.some((i) => otherProfile.interests.includes(i))) {
        similarity += 0.2;
      }

      if (similarity > 0) {
        similarities.push([otherUserId, similarity]);
      }
    }

    similarities.sort((a, b) => b[1] - a[1]);

    return similarities.slice(0, topK).map(([userId]) => userId);
  }

  /**
   * Create personalized dashboard
   */
  private createDefaultDashboard(userId: string): PersonalizedDashboard {
    const profile = this.userProfiles.get(userId);

    const widgets: DashboardWidget[] = [
      {
        id: 'kpi-1',
        type: 'kpi',
        title: 'Key Indicators',
        config: { indicators: ['gdp', 'inflation', 'exchange_rate'] },
        position: { x: 0, y: 0 },
        size: { width: 3, height: 2 },
      },
      {
        id: 'chart-1',
        type: 'chart',
        title: 'Economic Trends',
        config: { chartType: 'line', metrics: ['gdp', 'inflation'] },
        position: { x: 3, y: 0 },
        size: { width: 3, height: 2 },
      },
      {
        id: 'alerts-1',
        type: 'alerts',
        title: 'Active Alerts',
        config: {},
        position: { x: 0, y: 2 },
        size: { width: 3, height: 2 },
      },
      {
        id: 'recommendations-1',
        type: 'recommendations',
        title: 'Recommended Content',
        config: {},
        position: { x: 3, y: 2 },
        size: { width: 3, height: 2 },
      },
    ];

    return {
      userId,
      layout: 'default',
      widgets,
      savedSearches: [],
      watchlist: [],
      alertThresholds: {},
    };
  }

  /**
   * Personalize dashboard for user
   */
  public personalizeDashboard(userId: string): PersonalizedDashboard | undefined {
    const dashboard = this.personalizedDashboards.get(userId);
    if (!dashboard) return undefined;

    // Adapt widgets based on user profile
    const profile = this.userProfiles.get(userId);
    if (!profile) return dashboard;

    // Customize based on role
    if (profile.role === 'policymaker') {
      dashboard.widgets = dashboard.widgets.filter((w) => w.type !== 'chart');
    } else if (profile.role === 'trader') {
      dashboard.widgets = dashboard.widgets.filter((w) => w.type !== 'chart');
    }

    return dashboard;
  }

  /**
   * Recommend report template
   */
  public recommendReportTemplate(userId: string, context: string): ReportTemplate | undefined {
    const profile = this.userProfiles.get(userId);
    if (!profile) return undefined;

    // Create role-specific template
    const templates: Record<string, ReportTemplate> = {
      policymaker: {
        id: 'policy-brief',
        name: 'Policy Brief',
        description: 'Cabinet-ready brief with risks and options',
        sections: [
          { id: 's1', type: 'summary', title: 'Executive Summary', config: {} },
          { id: 's2', type: 'analysis', title: 'Analysis', config: {} },
          { id: 's3', type: 'recommendations', title: 'Options & Tradeoffs', config: {} },
        ],
        frequency: 'weekly',
        recipients: [],
        format: 'pdf',
      },
      donor: {
        id: 'donor-report',
        name: 'Donor Report',
        description: 'Funding gaps and program coverage',
        sections: [
          { id: 's1', type: 'summary', title: 'Situation Overview', config: {} },
          { id: 's2', type: 'tables', title: 'Funding Gaps', config: {} },
          { id: 's3', type: 'charts', title: 'Program Coverage', config: {} },
        ],
        frequency: 'monthly',
        recipients: [],
        format: 'pdf',
      },
      researcher: {
        id: 'research-report',
        name: 'Research Report',
        description: 'Reproducible analysis with citations',
        sections: [
          { id: 's1', type: 'summary', title: 'Abstract', config: {} },
          { id: 's2', type: 'analysis', title: 'Methodology', config: {} },
          { id: 's3', type: 'charts', title: 'Results', config: {} },
        ],
        frequency: 'quarterly',
        recipients: [],
        format: 'pdf',
      },
    };

    return templates[profile.role];
  }

  /**
   * Optimize alert thresholds
   */
  public optimizeAlertThresholds(userId: string, feedback: Record<string, 'relevant' | 'irrelevant'>): void {
    const preferences = this.alertPreferences.get(userId);
    if (!preferences) return;

    // Adjust thresholds based on feedback
    for (const [metricId, feedback_value] of Object.entries(feedback)) {
      const pref = preferences.find((p) => p.metricId === metricId);
      if (!pref) continue;

      if (feedback_value === 'irrelevant') {
        // Increase threshold to reduce alerts
        pref.threshold *= 1.1;
      } else if (feedback_value === 'relevant') {
        // Decrease threshold to increase alerts
        pref.threshold *= 0.9;
      }
    }
  }

  /**
   * Get user profile
   */
  public getUserProfile(userId: string): UserProfile | undefined {
    return this.userProfiles.get(userId);
  }

  /**
   * Get user segment
   */
  public getUserSegment(userId: string): UserSegment | undefined {
    const profile = this.userProfiles.get(userId);
    if (!profile) return undefined;

    let segmentId = 'default';

    if (profile.role === 'policymaker') {
      segmentId = 'policymakers';
    } else if (profile.role === 'donor') {
      segmentId = 'donors';
    } else if (profile.role === 'researcher') {
      segmentId = 'researchers';
    } else if (profile.role === 'banker') {
      segmentId = 'bankers';
    } else if (profile.role === 'trader') {
      segmentId = 'traders';
    }

    return this.userSegments.get(segmentId);
  }

  /**
   * Save search
   */
  public saveSearch(userId: string, search: SavedSearch): void {
    const searches = this.savedSearches.get(userId) || [];
    searches.push(search);
    this.savedSearches.set(userId, searches);
  }

  /**
   * Get saved searches
   */
  public getSavedSearches(userId: string): SavedSearch[] {
    return this.savedSearches.get(userId) || [];
  }

  /**
   * Set alert preferences
   */
  public setAlertPreferences(userId: string, preferences: AlertPreference[]): void {
    this.alertPreferences.set(userId, preferences);
  }

  /**
   * Get alert preferences
   */
  public getAlertPreferences(userId: string): AlertPreference[] {
    return this.alertPreferences.get(userId) || [];
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let personalizationInstance: PersonalizationEngine | null = null;

export function getPersonalizationEngine(): PersonalizationEngine {
  if (!personalizationInstance) {
    personalizationInstance = new PersonalizationEngine();
  }
  return personalizationInstance;
}

export function resetPersonalizationEngine(): void {
  personalizationInstance = null;
}
