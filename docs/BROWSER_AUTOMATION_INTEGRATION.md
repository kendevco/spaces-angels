# 🌐 Browser Automation Integration Guide

*Leo's Intelligent Web Automation Capabilities*

## 📊 Overview

Browser automation enables Leo to perform complex web-based tasks autonomously, from data extraction and form filling to service delivery automation. This integration empowers the platform to offer browser-based services as products while providing intelligent web interaction capabilities for business process automation.

## 🏗️ **What Goes In vs What Goes Out**

### **INPUT (What We Send to Browser Automation):**

#### **Automation Task Configuration**
`	ypescript
interface BrowserAutomationTask {
  // Task Definition
  taskId: string                 // Unique task identifier
  type: 'data_extraction' | 'form_submission' | 'service_delivery' | 
        'monitoring' | 'testing' | 'content_creation'
  
  // Browser Settings
  browser: {
    type: 'chromium' | 'firefox' | 'webkit'
    headless: boolean            // Run without UI
    viewport: {
      width: number
      height: number
    }
    userAgent?: string           // Custom user agent
    proxy?: {
      server: string
      username?: string
      password?: string
    }
  }
  
  // Navigation & Interaction
  steps: Array<{
    action: 'navigate' | 'click' | 'type' | 'wait' | 'extract' | 
            'screenshot' | 'scroll' | 'select' | 'upload'
    target: {
      type: 'url' | 'selector' | 'text' | 'xpath'
      value: string
    }
    data?: any                   // Input data for action
    timeout?: number             // Action timeout (ms)
    waitFor?: {
      type: 'load' | 'networkidle' | 'selector' | 'timeout'
      value?: string | number
    }
  }>
  
  // Data Extraction Rules
  extraction?: {
    selectors: Record<string, string>  // Field name -> CSS selector
    pagination?: {
      nextButtonSelector: string
      maxPages: number
      delay: number              // Delay between pages (ms)
    }
    filters?: Array<{
      field: string
      operator: 'contains' | 'equals' | 'regex' | 'exists'
      value: any
    }>
  }
  
  // Error Handling
  errorHandling: {
    retries: number              // Max retry attempts
    retryDelay: number           // Delay between retries (ms)
    onError: 'stop' | 'continue' | 'notify'
    captcha?: {
      service: '2captcha' | 'anticaptcha' | 'manual'
      apiKey?: string
    }
  }
  
  // Output Configuration
  output: {
    format: 'json' | 'csv' | 'xml' | 'screenshot' | 'pdf'
    destination: 'return' | 'file' | 'webhook' | 'database'
    webhook?: {
      url: string
      headers?: Record<string, string>
    }
  }
}

// Service Automation Request
interface ServiceAutomationRequest {
  serviceType: 'social_media_posting' | 'lead_research' | 'competitor_analysis' |
               'content_scraping' | 'form_automation' | 'monitoring'
  
  // Client Configuration
  client: {
    tenantId: string
    userId: string
    serviceLevel: 'basic' | 'premium' | 'enterprise'
  }
  
  // Service Parameters
  parameters: {
    targets: string[]            // URLs, accounts, keywords, etc.
    schedule?: {
      frequency: 'once' | 'daily' | 'weekly' | 'monthly'
      time?: string              // HH:MM format
      timezone?: string
    }
    customization?: Record<string, any>
  }
  
  // Compliance & Limits
  compliance: {
    respectRobotsTxt: boolean
    rateLimiting: {
      requestsPerMinute: number
      delayBetweenRequests: number
    }
    geo?: {
      allowedCountries: string[]
      restrictedSites: string[]
    }
  }
  
  // Quality Assurance
  qa: {
    verificationSteps: string[]  // Steps to verify success
    successCriteria: Record<string, any>
    failureTriggers: string[]
  }
}

// Real-time Interaction Request
interface RealTimeInteractionRequest {
  sessionId: string              // Unique session identifier
  command: {
    type: 'click' | 'type' | 'navigate' | 'extract' | 'execute_script'
    target: string               // CSS selector or URL
    value?: string               // Input value
    script?: string              // JavaScript code
  }
  
  // Session Context
  context: {
    currentUrl: string
    userGoal: string             // What user is trying to accomplish
    previousActions: Array<{
      action: string
      timestamp: string
      result: string
    }>
  }
  
  // AI Assistance
  aiGuidance: {
    enabled: boolean
    intent: string               // User's intended outcome
    suggestions?: boolean        // Provide improvement suggestions
  }
}
`

### **OUTPUT (What Browser Automation Returns):**

#### **Task Execution Results**
`	ypescript
interface BrowserAutomationResult {
  // Execution Status
  taskId: string
  status: 'completed' | 'failed' | 'partial' | 'timeout' | 'cancelled'
  startTime: string              // ISO timestamp
  endTime: string                // ISO timestamp
  duration: number               // Execution time (ms)
  
  // Success Metrics
  metrics: {
    stepsCompleted: number       // Steps successfully executed
    totalSteps: number           // Total steps in task
    successRate: number          // Percentage success
    retries: number              // Number of retries needed
    errorsEncountered: number    // Total errors
  }
  
  // Extracted Data
  data?: {
    records: Array<Record<string, any>>  // Extracted records
    totalRecords: number         // Total records found
    uniqueRecords: number        // Unique records after deduplication
    schema: Record<string, string>  // Field types
    metadata: {
      source: string             // Source URL/site
      extractedAt: string        // When extracted
      dataQuality: number        // Quality score (0-100)
    }
  }
  
  // Screenshots & Evidence
  evidence: {
    screenshots: Array<{
      step: number
      url: string
      timestamp: string
      base64?: string            // Optional screenshot data
    }>
    logs: Array<{
      level: 'info' | 'warn' | 'error'
      message: string
      timestamp: string
      step?: number
    }>
    networkRequests?: Array<{
      url: string
      method: string
      status: number
      duration: number
    }>
  }
  
  // Error Information
  errors?: Array<{
    step: number
    type: 'navigation' | 'selector' | 'timeout' | 'captcha' | 'blocked'
    message: string
    screenshot?: string          // Error screenshot
    suggestion?: string          // Recovery suggestion
  }>
  
  // Performance Data
  performance: {
    pageLoadTimes: number[]      // Load times for each page
    memoryUsage: number          // Peak memory usage (MB)
    networkTraffic: number       // Total bytes transferred
    renderingTime: number        // Total rendering time
  }
}
`

#### **Service Delivery Results**
`	ypescript
interface ServiceDeliveryResult {
  // Service Information
  serviceId: string
  serviceType: string
  deliveryTime: string          // ISO timestamp
  
  // Client Results
  deliverables: {
    primaryOutput: {
      type: 'report' | 'data' | 'automation' | 'monitoring'
      format: string
      size: number               // File size or record count
      downloadUrl?: string       // If file-based
      previewUrl?: string        // Preview link
    }
    
    supplementary?: Array<{
      name: string
      type: string
      url: string
      description: string
    }>
    
    insights?: {
      summary: string            // Executive summary
      keyFindings: string[]      // Important discoveries
      recommendations: string[] // Actionable recommendations
      trends: Array<{
        metric: string
        change: number           // Percentage change
        timeframe: string
      }>
    }
  }
  
  // Quality Metrics
  quality: {
    completeness: number         // Percentage complete (0-100)
    accuracy: number             // Accuracy score (0-100)
    freshness: number            // Data freshness score (0-100)
    reliability: number          // Reliability score (0-100)
    verification: {
      automated: boolean         // Passed automated checks
      manual?: boolean           // Manual verification if needed
      issues: string[]           // Any quality issues found
    }
  }
  
  // Business Impact
  impact: {
    timesSaved: number           // Hours saved by automation
    costReduction: number        // Estimated cost savings
    accuracyImprovement: number  // Improvement over manual process
    scalabilityFactor: number    // How much this can scale
  }
  
  // Next Steps
  followUp?: {
    recommendedActions: string[]
    scheduledTasks: Array<{
      task: string
      scheduledFor: string
      frequency?: string
    }>
    alertRules: Array<{
      condition: string
      action: string
      threshold: number
    }>
  }
}
`

#### **Real-time Interaction Response**
`	ypescript
interface RealTimeInteractionResponse {
  // Command Result
  commandId: string
  status: 'success' | 'failed' | 'pending'
  result?: any                   // Command output
  
  // Current State
  browserState: {
    url: string                  // Current page URL
    title: string                // Page title
    readyState: 'loading' | 'interactive' | 'complete'
    elements: Array<{
      selector: string
      type: string
      visible: boolean
      text?: string
    }>
  }
  
  // AI Insights
  aiInsights?: {
    nextSuggestedAction: string
    alternativeApproaches: string[]
    potentialIssues: string[]
    optimizationTips: string[]
  }
  
  // Session Data
  session: {
    duration: number             // Session length (ms)
    actionsPerformed: number     // Total actions in session
    pagesVisited: number         // Unique pages visited
    goalsAchieved: string[]      // Completed objectives
  }
}
`

## 🚀 **Browser Automation Service Implementation**

### **Leo Browser Automation Engine**
`	ypescript
// src/services/BrowserAutomationService.ts

import { chromium, firefox, webkit, Browser, Page } from 'playwright'

export class BrowserAutomationService {
  private browsers: Map<string, Browser> = new Map()
  private activeSessions: Map<string, Page> = new Map()

  async executeTask(task: BrowserAutomationTask): Promise<BrowserAutomationResult> {
    const startTime = Date.now()
    let browser: Browser | null = null
    let page: Page | null = null
    
    try {
      // Launch browser
      browser = await this.launchBrowser(task.browser)
      page = await browser.newPage({
        viewport: task.browser.viewport,
        userAgent: task.browser.userAgent
      })

      // Execute steps
      const results = []
      const screenshots = []
      const logs = []

      for (let i = 0; i < task.steps.length; i++) {
        const step = task.steps[i]
        
        try {
          const stepResult = await this.executeStep(page, step, i)
          results.push(stepResult)
          
          // Capture screenshot if needed
          if (step.action !== 'wait') {
            const screenshot = await page.screenshot({ fullPage: true })
            screenshots.push({
              step: i,
              url: page.url(),
              timestamp: new Date().toISOString(),
              base64: screenshot.toString('base64')
            })
          }
          
        } catch (error) {
          logs.push({
            level: 'error',
            message: error.message,
            timestamp: new Date().toISOString(),
            step: i
          })
          
          if (task.errorHandling.onError === 'stop') {
            throw error
          }
        }
      }

      // Extract data if configured
      let extractedData = null
      if (task.extraction) {
        extractedData = await this.extractData(page, task.extraction)
      }

      const endTime = Date.now()

      return {
        taskId: task.taskId,
        status: 'completed',
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration: endTime - startTime,
        metrics: {
          stepsCompleted: results.length,
          totalSteps: task.steps.length,
          successRate: (results.length / task.steps.length) * 100,
          retries: 0,
          errorsEncountered: logs.filter(l => l.level === 'error').length
        },
        data: extractedData,
        evidence: {
          screenshots,
          logs,
          networkRequests: [] // Would be populated with network monitoring
        },
        performance: {
          pageLoadTimes: [],  // Would track actual load times
          memoryUsage: 0,     // Would monitor memory usage
          networkTraffic: 0,  // Would track network usage
          renderingTime: endTime - startTime
        }
      }

    } finally {
      if (page) await page.close()
      if (browser) await browser.close()
    }
  }

  async createRealTimeSession(sessionId: string): Promise<string> {
    const browser = await chromium.launch({ headless: false })
    const page = await browser.newPage()
    
    this.browsers.set(sessionId, browser)
    this.activeSessions.set(sessionId, page)
    
    return sessionId
  }

  async executeRealTimeCommand(
    sessionId: string, 
    request: RealTimeInteractionRequest
  ): Promise<RealTimeInteractionResponse> {
    
    const page = this.activeSessions.get(sessionId)
    if (!page) {
      throw new Error(Session  not found)
    }

    const { command } = request
    let result = null

    switch (command.type) {
      case 'navigate':
        await page.goto(command.target)
        break
        
      case 'click':
        await page.click(command.target)
        break
        
      case 'type':
        await page.fill(command.target, command.value || '')
        break
        
      case 'extract':
        result = await page.locator(command.target).textContent()
        break
        
      case 'execute_script':
        result = await page.evaluate(command.script || '')
        break
    }

    // Get current browser state
    const browserState = {
      url: page.url(),
      title: await page.title(),
      readyState: await page.evaluate(() => document.readyState),
      elements: [] // Would be populated with visible elements
    }

    return {
      commandId: ${sessionId}_,
      status: 'success',
      result,
      browserState,
      session: {
        duration: 0, // Would calculate actual duration
        actionsPerformed: 0, // Would track actions
        pagesVisited: 0, // Would track unique pages
        goalsAchieved: []
      }
    }
  }

  async deliverService(request: ServiceAutomationRequest): Promise<ServiceDeliveryResult> {
    // Service-specific automation logic
    switch (request.serviceType) {
      case 'lead_research':
        return await this.executeLeadResearch(request)
      
      case 'competitor_analysis':
        return await this.executeCompetitorAnalysis(request)
      
      case 'content_scraping':
        return await this.executeContentScraping(request)
      
      case 'social_media_posting':
        return await this.executeSocialMediaPosting(request)
      
      default:
        throw new Error(Unknown service type: )
    }
  }

  private async executeStep(page: Page, step: any, stepIndex: number): Promise<any> {
    switch (step.action) {
      case 'navigate':
        await page.goto(step.target.value, { 
          waitUntil: step.waitFor?.type || 'load',
          timeout: step.timeout || 30000
        })
        break
        
      case 'click':
        await page.click(step.target.value, { timeout: step.timeout || 5000 })
        break
        
      case 'type':
        await page.fill(step.target.value, step.data, { timeout: step.timeout || 5000 })
        break
        
      case 'wait':
        if (step.waitFor?.type === 'timeout') {
          await page.waitForTimeout(step.waitFor.value)
        } else if (step.waitFor?.type === 'selector') {
          await page.waitForSelector(step.waitFor.value, { timeout: step.timeout || 30000 })
        }
        break
        
      case 'extract':
        return await page.locator(step.target.value).textContent()
        
      case 'screenshot':
        return await page.screenshot({ fullPage: true })
        
      default:
        throw new Error(Unknown action: )
    }
  }

  private async extractData(page: Page, extraction: any): Promise<any> {
    const data = {}
    
    for (const [field, selector] of Object.entries(extraction.selectors)) {
      try {
        const element = await page.locator(selector)
        data[field] = await element.textContent()
      } catch (error) {
        data[field] = null
      }
    }
    
    return {
      records: [data],
      totalRecords: 1,
      uniqueRecords: 1,
      schema: extraction.selectors,
      metadata: {
        source: page.url(),
        extractedAt: new Date().toISOString(),
        dataQuality: 100
      }
    }
  }

  private async launchBrowser(config: any): Promise<Browser> {
    const options = {
      headless: config.headless,
      proxy: config.proxy
    }

    switch (config.type) {
      case 'chromium':
        return await chromium.launch(options)
      case 'firefox':
        return await firefox.launch(options)
      case 'webkit':
        return await webkit.launch(options)
      default:
        return await chromium.launch(options)
    }
  }
}

export const browserAutomationService = new BrowserAutomationService()
`

## 🎯 **Service Integration with Revenue Engine**

### **Browser Automation as Product Types**
Integration with the existing revenue engine commission structure:

- **Automation/Integration**: 7% commission (technical services + ongoing support)
- **Business Service**: 4% commission (professional B2B + business tools)

### **Service Delivery Products**
`	ypescript
interface AutomationServiceProducts {
  leadResearch: {
    name: 'AI-Powered Lead Research'
    type: 'Automation/Integration'  // 7% commission
    pricing: {
      basic: 97,      // 100 leads/month
      pro: 297,       // 500 leads/month  
      enterprise: 997 // Unlimited + custom automation
    }
  }
  
  competitorAnalysis: {
    name: 'Competitive Intelligence Automation'
    type: 'Business Service'     // 4% commission
    pricing: {
      weekly: 197,    // Weekly reports
      monthly: 597,   // Monthly deep-dive
      quarterly: 1497 // Quarterly strategic analysis
    }
  }
  
  contentScraping: {
    name: 'Content & Data Extraction Service'
    type: 'Automation/Integration'  // 7% commission
    pricing: {
      perProject: 497,  // One-time projects
      monthly: 297,     // Monthly data delivery
      realTime: 997     // Real-time data feeds
    }
  }
}
`

---

*Browser automation extends Leo's capabilities to deliver sophisticated web-based services while generating revenue through the platform's commission structure.*
