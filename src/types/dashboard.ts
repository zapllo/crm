// src/types/dashboard.ts
export interface DashboardData {
  leadMetrics: LeadMetricsData;
  salesMetrics: SalesMetrics;
  pipelineData: PipelineData[];
  recentActivities: Activity[];
  topPerformers: TopPerformer[];
  productPerformance: ProductPerformance[];
  customerInsights: CustomerInsights;
  followupMetrics: FollowupMetrics;
  salesForecast: SalesForecast;
  geographicalData: GeographicalData[];
}

export interface LeadMetricsData {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  leadGrowth: number;
  conversionRate: number;
  averageLeadValue: number;
  leadsBySource: { source: string; count: number }[];
}

export interface SalesMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  averageDealSize: number;
  salesCycle: number;
  winRate: number;
  monthlyTrend: {
    month: string;
    revenue: number;
    deals: number;
  }[];
}

export interface PipelineData {
  stage: string;
  count: number;
  value: number;
  probability: number;
  deals: {
    id: string;
    name: string;
    value: number;
    company: string;
  }[];
}

export interface Activity {
  id: string;
  type: 'lead' | 'deal' | 'followup' | 'contact';
  action: string;
  description: string;
  timestamp: Date;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  metadata: Record<string, any>;
}

export interface TopPerformer {
  userId: string;
  name: string;
  avatar: string;
  revenue: number;
  dealsWon: number;
  conversionRate: number;
  averageDealSize: number;
}

export interface ProductPerformance {
  productId: string;
  name: string;
  totalSales: number;
  revenue: number;
  growth: number;
  popularWith: string[];
}

export interface CustomerInsights {
  totalCustomers: number;
  newCustomers: number;
  customerGrowth: number;
  segmentation: {
    segment: string;
    percentage: number;
    count: number;
  }[];
  retention: number;
  satisfaction: number;
}

export interface FollowupMetrics {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  upcomingFollowups: {
    id: string;
    type: string;
    date: Date;
    leadId: string;
    leadName: string;
  }[];
}

export interface SalesForecast {
  predictedRevenue: number;
  confidence: number;
  trending: 'up' | 'down';
  nextQuarter: {
    bestCase: number;
    realistic: number;
    worstCase: number;
  };
}

export interface GeographicalData {
  region: string;
  leads: number;
  revenue: number;
  opportunities: number;
  topProducts: string[];
}