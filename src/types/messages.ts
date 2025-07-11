// Enhanced Messages Collection Types - Task 004
// Dynamic widgets, BI integration, and advanced conversational flows

export interface MessageContent {
  text?: string
  html?: string
  markdown?: string
  widgets?: MessageWidget[]
  attachments?: MessageAttachment[]
  mentions?: MessageMention[]
  links?: MessageLink[]
  metadata?: Record<string, any>
}

export interface MessageWidget {
  id: string
  type: 'chart' | 'table' | 'form' | 'button' | 'card' | 'image' | 'video' | 'audio' | 'calendar' | 'map' | 'poll' | 'quiz' | 'payment' | 'booking'
  title?: string
  data: Record<string, any>
  config?: WidgetConfig
  permissions?: WidgetPermissions
  interactive?: boolean
  expires?: Date
}

export interface WidgetConfig {
  width?: number
  height?: number
  position?: 'inline' | 'floating' | 'sidebar'
  theme?: 'light' | 'dark' | 'auto'
  animation?: boolean
  collapsible?: boolean
  refreshInterval?: number
}

export interface WidgetPermissions {
  canEdit?: boolean
  canDelete?: boolean
  canShare?: boolean
  canInteract?: boolean
  restrictedUsers?: string[]
  allowedRoles?: string[]
}

export interface MessageAttachment {
  id: string
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
  name: string
  url: string
  size: number
  mimeType: string
  thumbnail?: string
  metadata?: Record<string, any>
}

export interface MessageMention {
  id: string
  type: 'user' | 'role' | 'channel' | 'topic'
  name: string
  displayName?: string
  startIndex: number
  endIndex: number
}

export interface MessageLink {
  url: string
  title?: string
  description?: string
  image?: string
  domain: string
  startIndex: number
  endIndex: number
}

export interface ConversationContext {
  threadId?: string
  channelId?: string
  spaceId?: string
  tenantId: string
  participants: ConversationParticipant[]
  topic?: string
  tags?: string[]
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'active' | 'archived' | 'closed' | 'draft'
  metadata?: Record<string, any>
  aiContext?: AIConversationContext
}

export interface ConversationParticipant {
  id: string
  type: 'user' | 'ai' | 'system' | 'bot'
  name: string
  role?: string
  permissions?: ParticipantPermissions
  joinedAt: Date
  lastSeen?: Date
}

export interface ParticipantPermissions {
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canModerate: boolean
  canInvite: boolean
  canManageWidgets: boolean
}

export interface AIConversationContext {
  personality?: string
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  conversationHistory?: AIMessage[]
  tools?: AITool[]
  memory?: AIMemory
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp: Date
  tokens?: number
}

export interface AITool {
  name: string
  description: string
  parameters: Record<string, any>
  enabled: boolean
}

export interface AIMemory {
  shortTerm: Record<string, any>
  longTerm: Record<string, any>
  context: Record<string, any>
}

export interface BusinessIntelligenceData {
  insights?: BusinessInsight[]
  metrics?: BusinessMetric[]
  trends?: BusinessTrend[]
  alerts?: BusinessAlert[]
  recommendations?: BusinessRecommendation[]
  reports?: BusinessReport[]
  analytics?: AnalyticsData
  kpis?: KPIData[]
}

export interface BusinessInsight {
  id: string
  type: 'revenue' | 'customer' | 'product' | 'market' | 'operational' | 'risk' | 'opportunity'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  confidence: number // 0-1
  source: string
  timestamp: Date
  data?: Record<string, any>
  visualization?: VisualizationConfig
}

export interface BusinessMetric {
  id: string
  name: string
  value: number
  unit: string
  change?: number
  changeType?: 'increase' | 'decrease' | 'stable'
  target?: number
  benchmark?: number
  timestamp: Date
  category: string
}

export interface BusinessTrend {
  id: string
  metric: string
  direction: 'up' | 'down' | 'stable' | 'volatile'
  strength: number // 0-1
  duration: string
  prediction?: TrendPrediction
  factors?: string[]
}

export interface TrendPrediction {
  nextValue: number
  confidence: number
  timeframe: string
  factors: string[]
}

export interface BusinessAlert {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  source: string
  timestamp: Date
  acknowledged?: boolean
  actions?: AlertAction[]
}

export interface AlertAction {
  id: string
  label: string
  type: 'button' | 'link' | 'form'
  action: string
  parameters?: Record<string, any>
}

export interface BusinessRecommendation {
  id: string
  type: 'cost_reduction' | 'revenue_increase' | 'efficiency' | 'risk_mitigation' | 'growth_opportunity'
  title: string
  description: string
  impact: string
  effort: 'low' | 'medium' | 'high'
  priority: number
  confidence: number
  steps?: RecommendationStep[]
  roi?: number
}

export interface RecommendationStep {
  id: string
  title: string
  description: string
  order: number
  estimated_time: string
  required_resources?: string[]
}

export interface BusinessReport {
  id: string
  title: string
  type: 'summary' | 'detailed' | 'executive' | 'operational'
  period: string
  generated: Date
  sections: ReportSection[]
  attachments?: string[]
}

export interface ReportSection {
  id: string
  title: string
  type: 'text' | 'chart' | 'table' | 'image' | 'widget'
  content: any
  order: number
}

export interface AnalyticsData {
  pageViews?: number
  uniqueVisitors?: number
  conversions?: number
  revenue?: number
  customerSatisfaction?: number
  engagementRate?: number
  bounceRate?: number
  averageSessionDuration?: number
  customMetrics?: Record<string, number>
}

export interface KPIData {
  id: string
  name: string
  value: number
  target: number
  unit: string
  performance: number // percentage of target
  trend: 'up' | 'down' | 'stable'
  category: string
  lastUpdated: Date
}

export interface VisualizationConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'gauge' | 'table' | 'map'
  data: any[]
  options?: Record<string, any>
  interactive?: boolean
  exportable?: boolean
}

export interface MessageReaction {
  id: string
  emoji: string
  count: number
  users: string[]
  timestamp: Date
}

export interface MessageReadStatus {
  userId: string
  readAt: Date
  acknowledged?: boolean
}

export interface MessageThread {
  id: string
  parentMessageId: string
  messageCount: number
  participants: string[]
  lastActivity: Date
  archived?: boolean
}

// AT Protocol compatibility types
export interface ATProtocolRecord {
  $type: string
  text?: string
  createdAt: string
  reply?: ATProtocolReply
  embed?: ATProtocolEmbed
  entities?: ATProtocolEntity[]
  labels?: ATProtocolLabel[]
  tags?: string[]
}

export interface ATProtocolReply {
  root: ATProtocolRef
  parent: ATProtocolRef
}

export interface ATProtocolRef {
  uri: string
  cid: string
}

export interface ATProtocolEmbed {
  $type: string
  [key: string]: any
}

export interface ATProtocolEntity {
  index: {
    byteStart: number
    byteEnd: number
  }
  type: string
  value: string
}

export interface ATProtocolLabel {
  val: string
  neg?: boolean
  src: string
  uri?: string
  cid?: string
  cts: string
  exp?: string
  sig?: string
}

// Message processing types
export interface MessageProcessingResult {
  success: boolean
  processedContent?: MessageContent
  extractedData?: Record<string, any>
  aiResponse?: string
  businessIntelligence?: BusinessIntelligenceData
  errors?: string[]
  warnings?: string[]
}

export interface ConversationEngineResult {
  response?: string
  actions?: ConversationAction[]
  context?: ConversationContext
  followUp?: string[]
  confidence?: number
}

export interface ConversationAction {
  type: 'reply' | 'forward' | 'escalate' | 'schedule' | 'create_task' | 'update_data' | 'trigger_workflow'
  parameters: Record<string, any>
  priority: number
  automated?: boolean
}

export type MessageType = 
  | 'text'
  | 'rich'
  | 'system'
  | 'ai'
  | 'notification'
  | 'alert'
  | 'widget'
  | 'business_intelligence'
  | 'report'
  | 'form'
  | 'poll'
  | 'payment'
  | 'booking'
  | 'file'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'at_protocol' 