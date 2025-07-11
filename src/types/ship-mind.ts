// Ship Mind Types - From Task 001
export interface EthicalAssessment {
  violations: string[]
  severity: 'none' | 'minor' | 'moderate' | 'severe' | 'critical'
  recommendation: string
  principlesApplied: string[]
  humanReviewRequired: boolean
}

export interface RelationshipProfile {
  userId: string
  businessContext: string
  communicationStyle: 'formal' | 'casual' | 'technical' | 'friendly'
  preferences: Record<string, any>
  trustLevel: number // 0-1
  interactionHistory: InteractionRecord[]
}

export interface InteractionRecord {
  timestamp: Date
  type: string
  content: string
  outcome: string
}

export interface BusinessInsights {
  industryTrends: TrendAnalysis[]
  competitiveIntelligence: CompetitorData[]
  customerBehavior: BehaviorPattern[]
  revenueProjections: RevenueData[]
  riskAssessment: RiskFactor[]
}

export interface TrendAnalysis {
  trend: string
  direction: 'up' | 'down' | 'stable'
  confidence: number
  timeframe: string
}

export interface CompetitorData {
  name: string
  strengths: string[]
  weaknesses: string[]
  marketShare: number
}

export interface BehaviorPattern {
  pattern: string
  frequency: number
  impact: string
  recommendation: string
}

export interface RevenueData {
  period: string
  projected: number
  actual?: number
  factors: string[]
}

export interface RiskFactor {
  risk: string
  probability: number
  impact: number
  mitigation: string
} 