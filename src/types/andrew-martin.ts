export interface Insight {
  id: string
  title: string
  summary: string
  category: string
  confidence: number
}

export interface NetworkStatusProps {
  guardianAngels: any[]
  networkHealth: number
  activeConnections: number
  successStories: SuccessStory[]
}

export interface RevenueAnalyticsProps {
  spaces: any[]
  totalRevenue: number
  growthRate: number
}

export interface SuccessStory {
  title: string
  summary: string
  link?: string
  date: string
}

export interface BusinessMetricsProps {
  kpis: any[]
  trends: any[]
  alerts: any[]
  recommendations: any[]
}
