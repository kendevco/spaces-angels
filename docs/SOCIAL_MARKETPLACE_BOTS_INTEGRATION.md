# 🤖 Social Marketplace Bots Integration Guide

*Automated Revenue Expansion Through Multi-Platform Posting*

## 📊 Overview

Social marketplace bots automate posting and management across Craigslist, Facebook Marketplace, and other platforms to expand revenue opportunities. Each bot operates with flexible thread management, multi-party coordination, and intelligent posting strategies to maximize engagement and conversions.

## 🏗️ **What Goes In vs What Goes Out**

### **INPUT (What We Send to Marketplace Bots):**

#### **Craigslist Bot Configuration**
`	ypescript
interface CraigslistBotConfig {
  // Authentication
  email: string                  // Craigslist account email
  password: string               // Account password
  phoneNumber: string            // Verification phone number
  
  // Posting Configuration
  location: {
    city: string                 // Target city (e.g., "austin")
    state: string                // State code (e.g., "tx")
    area?: string                // Specific area if applicable
  }
  
  // Content Management
  postingTemplate: {
    title: string                // Post title template
    description: string          // HTML description
    price?: number               // Price (if applicable)
    category: 'services' | 'for_sale' | 'gigs' | 'housing' | 'jobs'
    subcategory: string          // Specific subcategory
    images?: string[]            // Image URLs/paths
    contactInfo: {
      name: string
      email: string
      phone?: string
      preferredContact: 'email' | 'phone' | 'both'
    }
  }
  
  // Scheduling
  schedule: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
    time: string                 // HH:MM format
    timezone: string             // Timezone identifier
    autoRepost: boolean          // Auto-repost when expired
    maxActivePosts: number       // Concurrent post limit
  }
  
  // Response Management
  autoResponse: {
    enabled: boolean
    templates: {
      inquiry: string            // Response to inquiries
      price_question: string     // Price-related responses
      availability: string       // Availability responses
    }
    escalation: {
      triggerKeywords: string[]  // Keywords requiring human attention
      notificationMethod: 'email' | 'webhook' | 'spaces_message'
    }
  }
}

// Posting Request
interface CraigslistPostRequest {
  botId: string                  // Bot instance identifier
  content: {
    title: string
    description: string
    price?: number
    images?: Array<{
      url: string
      alt: string
      order: number
    }>
  }
  targeting: {
    location: string             // City/area
    category: string
    subcategory: string
  }
  scheduling: {
    publishTime?: string         // ISO timestamp (immediate if null)
    expirationTime?: string      // Auto-expiration
    repostInterval?: number      // Days between reposts
  }
  tracking: {
    utmSource: string           // UTM tracking
    conversionGoal: 'lead' | 'sale' | 'booking'
    revenueTarget?: number
  }
}
`

#### **Facebook Marketplace Bot Configuration**
`	ypescript
interface FacebookMarketplaceBotConfig {
  // Authentication
  facebookAuth: {
    accessToken: string          // Facebook API token
    pageId?: string              // Business page ID (optional)
    appId: string                // Facebook App ID
    appSecret: string            // App secret
  }
  
  // Marketplace Settings
  marketplace: {
    location: {
      city: string
      state: string
      radius: number             // Mile radius for targeting
    }
    categories: Array<{
      id: string                 // Facebook category ID
      name: string               // Category name
      subcategories?: string[]   // Allowed subcategories
    }>
    delivery: {
      pickup: boolean            // Allow pickup
      shipping: boolean          // Allow shipping
      localDelivery: boolean     // Local delivery available
      deliveryRadius?: number    // Delivery radius in miles
    }
  }
  
  // Content Strategy
  postingStrategy: {
    maxPostsPerDay: number       // Daily posting limit
    optimalTimes: string[]       // Best posting times
    imageRequirements: {
      minImages: number          // Minimum images required
      maxImages: number          // Maximum images allowed
      aspectRatio: 'square' | 'landscape' | 'portrait' | 'any'
      quality: 'high' | 'medium' | 'low'
    }
    hashtags: {
      enabled: boolean
      maxTags: number
      popularTags: string[]      // Trending hashtags
    }
  }
  
  // Engagement Automation
  engagement: {
    autoRespond: boolean
    responseDelay: {
      min: number                // Minimum response delay (minutes)
      max: number                // Maximum response delay (minutes)
    }
    templates: {
      greeting: string
      priceInquiry: string
      availability: string
      scheduling: string
    }
    escalationTriggers: string[] // Keywords requiring human attention
  }
}

// Marketplace Post Request
interface FacebookMarketplacePostRequest {
  botId: string
  listing: {
    title: string                // Product/service title
    description: string          // Detailed description
    price: {
      amount: number
      currency: 'USD'            // Currency code
      negotiable: boolean        // Price negotiable
    }
    category: string             // Marketplace category
    condition?: 'new' | 'used' | 'refurbished'
    images: Array<{
      url: string
      caption?: string
    }>
    location: {
      address?: string           // Optional specific address
      city: string
      state: string
      zipCode: string
    }
  }
  targeting: {
    audienceType: 'local' | 'expanded' | 'nationwide'
    demographics?: {
      ageRange?: [number, number]
      interests?: string[]
    }
  }
  scheduling: {
    publishTime?: string         // ISO timestamp
    boostBudget?: number         // Optional paid promotion
    duration: number             // Listing duration (days)
  }
}
`

### **OUTPUT (What Marketplace Bots Return):**

#### **Craigslist Bot Responses**
`	ypescript
interface CraigslistBotResponse {
  // Post Status
  postId: string                 // Craigslist post ID
  status: 'posted' | 'pending' | 'flagged' | 'expired' | 'deleted'
  url: string                    // Public post URL
  
  // Performance Data
  metrics: {
    views: number                // Post view count
    replies: number              // Email replies received
    calls: number                // Phone calls (if tracked)
    flags: number                // Times flagged
    renewals: number             // Times renewed
  }
  
  // Response Management
  inquiries: Array<{
    id: string                   // Inquiry ID
    timestamp: string            // When received
    type: 'email' | 'phone'      // Contact method
    content: string              // Inquiry content
    contact: {
      email?: string
      phone?: string
      name?: string
    }
    autoResponded: boolean       // Auto-response sent
    humanReviewRequired: boolean // Needs manual attention
    conversionStatus: 'new' | 'qualified' | 'converted' | 'lost'
  }>
  
  // Technical Details
  posting: {
    timestamp: string            // When posted
    expirationDate: string       // When expires
    category: string             // Posted category
    location: string             // Posted location
    flaggedReasons?: string[]    // If flagged, why
  }
  
  // Revenue Tracking
  conversion: {
    leads: number                // Qualified leads generated
    sales: number                // Closed sales
    revenue: number              // Revenue attributed
    costPerLead: number          // Cost efficiency
    roi: number                  // Return on investment
  }
}
`

#### **Facebook Marketplace Bot Responses**
`	ypescript
interface FacebookMarketplaceBotResponse {
  // Listing Information
  listingId: string              // Facebook listing ID
  status: 'active' | 'sold' | 'pending' | 'expired' | 'rejected'
  url: string                    // Public listing URL
  
  // Engagement Metrics
  metrics: {
    reach: number                // People reached
    impressions: number          // Total impressions
    clicks: number               // Profile/listing clicks
    saves: number                // Times saved
    shares: number               // Times shared
    messages: number             // Direct messages
    interests: number            // People interested
  }
  
  // Message Management
  conversations: Array<{
    id: string                   // Conversation ID
    participantId: string        // Other party's ID
    participantName: string      // Display name
    lastMessage: {
      content: string
      timestamp: string
      sender: 'bot' | 'user'
      type: 'text' | 'image' | 'location'
    }
    status: 'active' | 'archived' | 'spam'
    autoResponded: boolean
    humanHandoffRequired: boolean
    leadQuality: 'hot' | 'warm' | 'cold'
  }>
  
  // Performance Analytics
  performance: {
    engagementRate: number       // Percentage engagement
    responseRate: number         // Message response rate
    conversionRate: number       // Lead to sale conversion
    averageResponseTime: number  // Minutes to respond
    qualifiedLeads: number       // High-quality inquiries
  }
  
  // Revenue Attribution
  revenue: {
    directSales: number          // Sales from this listing
    attributedRevenue: number    // Total attributed revenue
    averageOrderValue: number    // AOV from this source
    lifetimeValue: number        // Customer LTV
    costPerAcquisition: number   // Customer acquisition cost
  }
}
`

## 🔄 **Thread Management & Multi-Party Coordination**

### **Thread Interface System**
`	ypescript
interface ThreadManager {
  // Thread Creation
  createThread(config: {
    platform: 'craigslist' | 'facebook_marketplace' | 'offerup' | 'nextdoor'
    participants: Array<{
      id: string
      type: 'customer' | 'bot' | 'human_agent'
      contactInfo: Record<string, any>
    }>
    context: {
      listingId: string
      product: string
      initialInquiry: string
    }
  }): ThreadId
  
  // Participant Management
  addParticipant(threadId: ThreadId, participant: Participant): void
  removeParticipant(threadId: ThreadId, participantId: string): void
  escalateToHuman(threadId: ThreadId, reason: string): void
  
  // Message Routing
  routeMessage(message: {
    threadId: ThreadId
    from: ParticipantId
    to?: ParticipantId         // If null, broadcast to all
    content: string
    type: 'text' | 'image' | 'location' | 'contact'
    urgency: 'low' | 'normal' | 'high'
  }): void
  
  // Conversion Tracking
  markConversion(threadId: ThreadId, conversion: {
    type: 'lead' | 'appointment' | 'sale'
    value: number
    source: string
    timestamp: string
  }): void
}
`

## 🚀 **Bot Service Implementation**

### **Unified Marketplace Bot Service**
`	ypescript
// src/services/MarketplaceBotService.ts

export class MarketplaceBotService {
  private craigslistBot: CraigslistBot
  private facebookBot: FacebookMarketplaceBot
  private threadManager: ThreadManager

  constructor() {
    this.craigslistBot = new CraigslistBot()
    this.facebookBot = new FacebookMarketplaceBot()
    this.threadManager = new ThreadManager()
  }

  async createCrossplatformCampaign(config: {
    product: {
      name: string
      description: string
      price: number
      images: string[]
      category: string
    }
    targeting: {
      locations: string[]        // Multiple cities
      demographics?: any
    }
    platforms: Array<'craigslist' | 'facebook_marketplace'>
    schedule: {
      startDate: string
      endDate?: string
      frequency: string
    }
  }): Promise<CampaignResult> {
    
    const campaign = await this.createCampaign(config)
    const results = []

    // Post to each platform
    for (const platform of config.platforms) {
      switch (platform) {
        case 'craigslist':
          const clResult = await this.craigslistBot.createPost({
            content: config.product,
            targeting: config.targeting,
            scheduling: config.schedule
          })
          results.push({ platform, result: clResult })
          break

        case 'facebook_marketplace':
          const fbResult = await this.facebookBot.createListing({
            listing: config.product,
            targeting: config.targeting,
            scheduling: config.schedule
          })
          results.push({ platform, result: fbResult })
          break
      }
    }

    return {
      campaignId: campaign.id,
      platforms: results,
      status: 'active',
      metrics: this.aggregateMetrics(results)
    }
  }

  async handleIncomingMessage(message: {
    platform: string
    threadId: string
    from: string
    content: string
    timestamp: string
  }): Promise<void> {
    
    // Determine if auto-response or human escalation needed
    const intent = await this.analyzeIntent(message.content)
    
    if (intent.requiresHuman) {
      await this.threadManager.escalateToHuman(
        message.threadId, 
        intent.reason
      )
    } else {
      const response = await this.generateResponse(intent, message)
      await this.sendResponse(message.platform, message.threadId, response)
    }

    // Track engagement
    await this.trackEngagement({
      platform: message.platform,
      type: 'message_received',
      threadId: message.threadId,
      timestamp: message.timestamp
    })
  }

  private async analyzeIntent(content: string): Promise<{
    type: 'price_inquiry' | 'availability' | 'scheduling' | 'negotiation' | 'spam'
    confidence: number
    requiresHuman: boolean
    reason?: string
  }> {
    // AI-powered intent analysis
    // This would integrate with your AI service
    return {
      type: 'price_inquiry',
      confidence: 0.85,
      requiresHuman: false
    }
  }
}
`

## 📊 **Revenue Impact Tracking**

### **ROI Metrics**
- **Cost Per Lead**: Platform posting costs / qualified leads
- **Conversion Rate**: Leads converted to sales percentage
- **Revenue Attribution**: Direct sales from marketplace activity
- **Customer Acquisition Cost**: Total cost to acquire paying customer
- **Lifetime Value**: Long-term revenue from marketplace customers

### **Platform Performance Comparison**
`	ypescript
interface PlatformMetrics {
  craigslist: {
    avgLeadsPerPost: number
    avgConversionRate: number
    avgRevenuePerLead: number
    costEfficiency: number
  }
  facebookMarketplace: {
    avgReach: number
    avgEngagementRate: number
    avgConversionValue: number
    paidPromotionROI: number
  }
}
`

---

*Social marketplace bots expand revenue opportunities through automated multi-platform presence, intelligent engagement, and seamless conversion tracking integrated with the Spaces Commerce revenue engine.*
