// Business Intelligence Processor Utility - Task 004
// Handles BI data integration, insights generation, and analytics processing

import { 
  BusinessIntelligenceData,
  BusinessInsight,
  BusinessMetric,
  BusinessTrend,
  BusinessAlert,
  BusinessRecommendation,
  BusinessReport,
  AnalyticsData,
  KPIData,
  MessageContent,
  ConversationContext 
} from '../types/messages'

export class BusinessIntelligenceProcessor {
  
  /**
   * Process message content for business intelligence extraction
   */
  async processMessageForBI(
    content: MessageContent,
    context: ConversationContext
  ): Promise<BusinessIntelligenceData> {
    try {
      const insights = await this.extractInsights(content, context)
      const metrics = await this.extractMetrics(content, context)
      const trends = await this.analyzeTrends(content, context)
      const alerts = await this.generateAlerts(content, context)
      const recommendations = await this.generateRecommendations(content, context)
      const analytics = await this.extractAnalytics(content, context)
      const kpis = await this.calculateKPIs(content, context)

      return {
        insights,
        metrics,
        trends,
        alerts,
        recommendations,
        analytics,
        kpis
      }
    } catch (error) {
      console.error('BusinessIntelligenceProcessor error:', error)
      return {
        insights: [],
        metrics: [],
        trends: [],
        alerts: [],
        recommendations: [],
        analytics: {},
        kpis: []
      }
    }
  }

  /**
   * Extract business insights from message content
   */
  private async extractInsights(
    content: MessageContent,
    context: ConversationContext
  ): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = []
    const text = content.text || ''

    // Customer sentiment insight
    const sentiment = await this.analyzeSentiment(text)
    if (sentiment.confidence > 0.7) {
      insights.push({
        id: `sentiment_${Date.now()}`,
        type: 'customer',
        title: `Customer Sentiment: ${sentiment.type}`,
        description: `Customer expressed ${sentiment.type} sentiment with ${(sentiment.confidence * 100).toFixed(1)}% confidence`,
        impact: sentiment.type === 'positive' ? 'medium' : 'high',
        confidence: sentiment.confidence,
        source: 'message_analysis',
        timestamp: new Date(),
        data: { sentiment: sentiment.type, confidence: sentiment.confidence }
      })
    }

    // Revenue opportunity insight
    const revenueSignals = await this.detectRevenueSignals(text)
    if (revenueSignals.length > 0) {
      insights.push({
        id: `revenue_${Date.now()}`,
        type: 'revenue',
        title: 'Revenue Opportunity Detected',
        description: `Potential revenue opportunity identified: ${revenueSignals.join(', ')}`,
        impact: 'high',
        confidence: 0.8,
        source: 'message_analysis',
        timestamp: new Date(),
        data: { signals: revenueSignals }
      })
    }

    // Customer journey insight
    const journeyStage = await this.identifyJourneyStage(text, context)
    if (journeyStage) {
      insights.push({
        id: `journey_${Date.now()}`,
        type: 'customer',
        title: `Customer Journey: ${journeyStage}`,
        description: `Customer appears to be in the ${journeyStage} stage`,
        impact: 'medium',
        confidence: 0.7,
        source: 'journey_analysis',
        timestamp: new Date(),
        data: { stage: journeyStage }
      })
    }

    return insights
  }

  /**
   * Extract business metrics from message content
   */
  private async extractMetrics(
    content: MessageContent,
    context: ConversationContext
  ): Promise<BusinessMetric[]> {
    const metrics: BusinessMetric[] = []
    const text = content.text || ''

    // Response time metric
    const responseTime = await this.calculateResponseTime(context)
    if (responseTime > 0) {
      metrics.push({
        id: `response_time_${Date.now()}`,
        name: 'Response Time',
        value: responseTime,
        unit: 'minutes',
        timestamp: new Date(),
        category: 'customer_service'
      })
    }

    // Message length metric
    if (text.length > 0) {
      metrics.push({
        id: `message_length_${Date.now()}`,
        name: 'Message Length',
        value: text.length,
        unit: 'characters',
        timestamp: new Date(),
        category: 'engagement'
      })
    }

    // Interaction count metric
    const interactionCount = context.metadata?.messageCount || 0
    if (interactionCount > 0) {
      metrics.push({
        id: `interaction_count_${Date.now()}`,
        name: 'Interaction Count',
        value: interactionCount,
        unit: 'messages',
        timestamp: new Date(),
        category: 'engagement'
      })
    }

    return metrics
  }

  /**
   * Analyze trends from message content
   */
  private async analyzeTrends(
    content: MessageContent,
    context: ConversationContext
  ): Promise<BusinessTrend[]> {
    const trends: BusinessTrend[] = []

    // Customer engagement trend
    const engagementTrend = await this.analyzeEngagementTrend(context)
    if (engagementTrend) {
      trends.push({
        id: `engagement_trend_${Date.now()}`,
        metric: 'customer_engagement',
        direction: engagementTrend.direction,
        strength: engagementTrend.strength,
        duration: engagementTrend.duration,
        factors: engagementTrend.factors
      })
    }

    return trends
  }

  /**
   * Generate business alerts based on message content
   */
  private async generateAlerts(
    content: MessageContent,
    context: ConversationContext
  ): Promise<BusinessAlert[]> {
    const alerts: BusinessAlert[] = []
    const text = content.text || ''

    // Negative sentiment alert
    const sentiment = await this.analyzeSentiment(text)
    if (sentiment.type === 'negative' && sentiment.confidence > 0.8) {
      alerts.push({
        id: `negative_sentiment_${Date.now()}`,
        type: 'warning',
        severity: 'high',
        title: 'Negative Customer Sentiment Detected',
        message: 'Customer expressed strong negative sentiment. Immediate attention recommended.',
        source: 'sentiment_analysis',
        timestamp: new Date(),
        actions: [
          {
            id: 'escalate_to_manager',
            label: 'Escalate to Manager',
            type: 'button',
            action: 'escalate',
            parameters: { reason: 'negative_sentiment', priority: 'high' }
          }
        ]
      })
    }

    // High priority context alert
    if (context.priority === 'urgent') {
      alerts.push({
        id: `urgent_priority_${Date.now()}`,
        type: 'error',
        severity: 'critical',
        title: 'Urgent Priority Message',
        message: 'This message has been marked as urgent priority.',
        source: 'priority_system',
        timestamp: new Date(),
        actions: [
          {
            id: 'immediate_response',
            label: 'Respond Immediately',
            type: 'button',
            action: 'respond',
            parameters: { priority: 'urgent' }
          }
        ]
      })
    }

    return alerts
  }

  /**
   * Generate business recommendations based on message content
   */
  private async generateRecommendations(
    content: MessageContent,
    context: ConversationContext
  ): Promise<BusinessRecommendation[]> {
    const recommendations: BusinessRecommendation[] = []
    const text = content.text || ''

    // Upsell recommendation
    const upsellOpportunity = await this.detectUpsellOpportunity(text, context)
    if (upsellOpportunity) {
      recommendations.push({
        id: `upsell_${Date.now()}`,
        type: 'revenue_increase',
        title: 'Upsell Opportunity Identified',
        description: 'Customer shows interest in additional products/services',
        impact: 'Potential revenue increase of 15-30%',
        effort: 'low',
        priority: 1,
        confidence: 0.75,
        steps: [
          {
            id: 'step_1',
            title: 'Identify Customer Needs',
            description: 'Analyze customer requirements and pain points',
            order: 1,
            estimated_time: '15 minutes'
          },
          {
            id: 'step_2',
            title: 'Present Relevant Solutions',
            description: 'Offer complementary products or service upgrades',
            order: 2,
            estimated_time: '10 minutes'
          }
        ],
        roi: 0.25
      })
    }

    // Process improvement recommendation
    const processIssue = await this.detectProcessIssue(text, context)
    if (processIssue) {
      recommendations.push({
        id: `process_improvement_${Date.now()}`,
        type: 'efficiency',
        title: 'Process Improvement Opportunity',
        description: 'Customer interaction reveals potential process bottleneck',
        impact: 'Improved customer satisfaction and reduced response time',
        effort: 'medium',
        priority: 2,
        confidence: 0.6,
        steps: [
          {
            id: 'step_1',
            title: 'Analyze Current Process',
            description: 'Review current workflow and identify bottlenecks',
            order: 1,
            estimated_time: '2 hours'
          },
          {
            id: 'step_2',
            title: 'Implement Improvements',
            description: 'Streamline process and update documentation',
            order: 2,
            estimated_time: '4 hours'
          }
        ]
      })
    }

    return recommendations
  }

  /**
   * Extract analytics data from message content
   */
  private async extractAnalytics(
    content: MessageContent,
    context: ConversationContext
  ): Promise<AnalyticsData> {
    const analytics: AnalyticsData = {}

    // Engagement metrics
    if (content.text) {
      analytics.engagementRate = await this.calculateEngagementRate(content, context)
    }

    // Customer satisfaction (inferred from sentiment)
    const sentiment = await this.analyzeSentiment(content.text || '')
    if (sentiment.confidence > 0.5) {
      analytics.customerSatisfaction = sentiment.type === 'positive' ? 0.8 : 
                                      sentiment.type === 'negative' ? 0.2 : 0.5
    }

    return analytics
  }

  /**
   * Calculate KPIs from message content
   */
  private async calculateKPIs(
    content: MessageContent,
    context: ConversationContext
  ): Promise<KPIData[]> {
    const kpis: KPIData[] = []

    // Customer Satisfaction KPI
    const satisfaction = await this.calculateCustomerSatisfaction(content, context)
    if (satisfaction > 0) {
      kpis.push({
        id: `customer_satisfaction_${Date.now()}`,
        name: 'Customer Satisfaction',
        value: satisfaction,
        target: 0.85,
        unit: 'score',
        performance: (satisfaction / 0.85) * 100,
        trend: 'stable',
        category: 'customer_service',
        lastUpdated: new Date()
      })
    }

    // Response Time KPI
    const responseTime = await this.calculateResponseTime(context)
    if (responseTime > 0) {
      const targetResponseTime = 5 // 5 minutes
      kpis.push({
        id: `response_time_${Date.now()}`,
        name: 'Average Response Time',
        value: responseTime,
        target: targetResponseTime,
        unit: 'minutes',
        performance: Math.max(0, (1 - (responseTime / targetResponseTime)) * 100),
        trend: responseTime <= targetResponseTime ? 'up' : 'down',
        category: 'efficiency',
        lastUpdated: new Date()
      })
    }

    return kpis
  }

  // Helper methods

  private async analyzeSentiment(text: string): Promise<{
    type: 'positive' | 'negative' | 'neutral'
    confidence: number
  }> {
    const positiveWords = ['good', 'great', 'excellent', 'love', 'like', 'happy', 'satisfied', 'amazing', 'perfect']
    const negativeWords = ['bad', 'terrible', 'hate', 'dislike', 'angry', 'frustrated', 'disappointed', 'awful', 'horrible']

    const words = text.toLowerCase().split(/\s+/)
    const positiveCount = words.filter(word => positiveWords.includes(word)).length
    const negativeCount = words.filter(word => negativeWords.includes(word)).length

    const totalSentimentWords = positiveCount + negativeCount
    const confidence = totalSentimentWords > 0 ? Math.min(totalSentimentWords / words.length * 10, 1) : 0

    if (positiveCount > negativeCount) {
      return { type: 'positive', confidence }
    } else if (negativeCount > positiveCount) {
      return { type: 'negative', confidence }
    } else {
      return { type: 'neutral', confidence }
    }
  }

  private async detectRevenueSignals(text: string): Promise<string[]> {
    const signals: string[] = []
    const revenueKeywords = ['buy', 'purchase', 'price', 'cost', 'upgrade', 'premium', 'subscription', 'plan']

    const words = text.toLowerCase().split(/\s+/)
    revenueKeywords.forEach(keyword => {
      if (words.includes(keyword)) {
        signals.push(keyword)
      }
    })

    return signals
  }

  private async identifyJourneyStage(text: string, context: ConversationContext): Promise<string | null> {
    const stageKeywords = {
      'awareness': ['learn', 'information', 'what is', 'how does', 'tell me about'],
      'consideration': ['compare', 'vs', 'versus', 'options', 'alternatives', 'features'],
      'decision': ['buy', 'purchase', 'price', 'cost', 'when can', 'how much'],
      'support': ['help', 'problem', 'issue', 'not working', 'error', 'trouble']
    }

    const text_lower = text.toLowerCase()
    for (const [stage, keywords] of Object.entries(stageKeywords)) {
      if (keywords.some(keyword => text_lower.includes(keyword))) {
        return stage
      }
    }

    return null
  }

  private async calculateResponseTime(context: ConversationContext): Promise<number> {
    // Stub implementation - would calculate actual response time based on message timestamps
    return Math.random() * 10 // Random response time between 0-10 minutes
  }

  private async analyzeEngagementTrend(context: ConversationContext): Promise<{
    direction: 'up' | 'down' | 'stable'
    strength: number
    duration: string
    factors: string[]
  } | null> {
    // Stub implementation
    return {
      direction: 'up',
      strength: 0.7,
      duration: '7 days',
      factors: ['increased message frequency', 'positive sentiment']
    }
  }

  private async detectUpsellOpportunity(text: string, context: ConversationContext): Promise<boolean> {
    const upsellKeywords = ['more', 'additional', 'extra', 'upgrade', 'premium', 'advanced', 'better']
    const text_lower = text.toLowerCase()
    return upsellKeywords.some(keyword => text_lower.includes(keyword))
  }

  private async detectProcessIssue(text: string, context: ConversationContext): Promise<boolean> {
    const processKeywords = ['slow', 'delay', 'waiting', 'long time', 'complicated', 'difficult', 'confusing']
    const text_lower = text.toLowerCase()
    return processKeywords.some(keyword => text_lower.includes(keyword))
  }

  private async calculateEngagementRate(content: MessageContent, context: ConversationContext): Promise<number> {
    // Stub implementation - would calculate based on message interaction data
    return Math.random() * 0.5 + 0.5 // Random engagement rate between 0.5-1.0
  }

  private async calculateCustomerSatisfaction(content: MessageContent, context: ConversationContext): Promise<number> {
    const sentiment = await this.analyzeSentiment(content.text || '')
    return sentiment.type === 'positive' ? 0.8 : 
           sentiment.type === 'negative' ? 0.2 : 0.5
  }

  /**
   * Generate comprehensive business report
   */
  async generateBusinessReport(
    biData: BusinessIntelligenceData,
    timeRange: { start: Date; end: Date }
  ): Promise<BusinessReport> {
    const report: BusinessReport = {
      id: `report_${Date.now()}`,
      title: 'Business Intelligence Report',
      type: 'summary',
      period: `${timeRange.start.toISOString().split('T')[0]} to ${timeRange.end.toISOString().split('T')[0]}`,
      generated: new Date(),
      sections: []
    }

    // Add insights section
    if (biData.insights && biData.insights.length > 0) {
      report.sections.push({
        id: 'insights',
        title: 'Key Insights',
        type: 'text',
        content: biData.insights.map(insight => ({
          title: insight.title,
          description: insight.description,
          impact: insight.impact,
          confidence: insight.confidence
        })),
        order: 1
      })
    }

    // Add metrics section
    if (biData.metrics && biData.metrics.length > 0) {
      report.sections.push({
        id: 'metrics',
        title: 'Key Metrics',
        type: 'table',
        content: biData.metrics.map(metric => ({
          name: metric.name,
          value: metric.value,
          unit: metric.unit,
          category: metric.category
        })),
        order: 2
      })
    }

    // Add recommendations section
    if (biData.recommendations && biData.recommendations.length > 0) {
      report.sections.push({
        id: 'recommendations',
        title: 'Recommendations',
        type: 'text',
        content: biData.recommendations.map(rec => ({
          title: rec.title,
          description: rec.description,
          impact: rec.impact,
          effort: rec.effort,
          priority: rec.priority
        })),
        order: 3
      })
    }

    return report
  }
}

export default BusinessIntelligenceProcessor 