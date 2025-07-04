import type { Payload } from 'payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Intent Categories
export interface BusinessIntent {
  id: string
  category: 'inventory' | 'payment' | 'customer' | 'content' | 'analytics' | 'system'
  action: string
  description: string
  requiredParams: string[]
  optionalParams?: string[]
  confidence: number
  utilityFunction: string
  examples: string[]
}

// Intent Detection Result
export interface IntentResult {
  intent: BusinessIntent
  confidence: number
  extractedParams: Record<string, any>
  shouldExecute: boolean
  requiresConfirmation: boolean
}

export class IntentDetectionCatalog {
  private static intents: BusinessIntent[] = [
    // INVENTORY MANAGEMENT
    {
      id: 'update_inventory_from_photo',
      category: 'inventory',
      action: 'analyze_shelf_photo',
      description: 'Update inventory levels based on shelf photo analysis',
      requiredParams: ['imageUrl'],
      optionalParams: ['shelfLocation', 'expectedProducts'],
      confidence: 0.9,
      utilityFunction: 'InventoryIntelligenceService.analyzeShelfPhoto',
      examples: [
        'I took a photo of the shelf, can you update inventory?',
        'Uploaded new shelf pictures - please process them',
        'Check inventory from these photos'
      ]
    },
    {
      id: 'low_stock_alert',
      category: 'inventory',
      action: 'check_low_stock',
      description: 'Check for products with low stock levels',
      requiredParams: [],
      optionalParams: ['threshold'],
      confidence: 0.95,
      utilityFunction: 'InventoryService.checkLowStock',
      examples: [
        'What items are running low?',
        'Check low stock alerts',
        'Which products need restocking?'
      ]
    },

    // PAYMENT PROCESSING  
    {
      id: 'process_payment',
      category: 'payment',
      action: 'create_payment_request',
      description: 'Create and process customer payment',
      requiredParams: ['amount', 'description'],
      optionalParams: ['customerId', 'dueDate'],
      confidence: 0.85,
      utilityFunction: 'PaymentService.createPaymentRequest',
      examples: [
        'Charge customer $150 for consultation',
        'Create invoice for $500 web design',
        'Process payment of $75'
      ]
    },
    {
      id: 'check_payment_status',
      category: 'payment',
      action: 'verify_payment',
      description: 'Check status of existing payment',
      requiredParams: ['paymentId'],
      confidence: 0.9,
      utilityFunction: 'PaymentService.checkStatus',
      examples: [
        'Has payment #123 been received?',
        'Check status of invoice INV-456',
        'Did the client pay yet?'
      ]
    },

    // CUSTOMER MANAGEMENT
    {
      id: 'create_customer_record',
      category: 'customer',
      action: 'add_customer',
      description: 'Create new customer/contact record',
      requiredParams: ['name'],
      optionalParams: ['email', 'phone', 'company'],
      confidence: 0.8,
      utilityFunction: 'CRMService.createContact',
      examples: [
        'Add new customer John Smith',
        'Create contact for Acme Corp',
        'Register new client: jane@example.com'
      ]
    },
    {
      id: 'schedule_appointment',
      category: 'customer',
      action: 'book_appointment',
      description: 'Schedule customer appointment or consultation',
      requiredParams: ['customerId', 'dateTime'],
      optionalParams: ['service', 'notes'],
      confidence: 0.85,
      utilityFunction: 'BookingService.scheduleAppointment',
      examples: [
        'Book consultation for tomorrow 2pm',
        'Schedule meeting with John next Tuesday',
        'Set appointment for car stereo install'
      ]
    },

    // CONTENT MANAGEMENT
    {
      id: 'create_post',
      category: 'content',
      action: 'publish_content',
      description: 'Create and publish new content post',
      requiredParams: ['title', 'content'],
      optionalParams: ['category', 'publishDate'],
      confidence: 0.75,
      utilityFunction: 'ContentService.createPost',
      examples: [
        'Write a blog post about our new service',
        'Create article about cactus care tips',
        'Publish update about business hours'
      ]
    },

    // ANALYTICS & REPORTING
    {
      id: 'generate_sales_report',
      category: 'analytics',
      action: 'create_report',
      description: 'Generate business analytics report',
      requiredParams: ['reportType'],
      optionalParams: ['dateRange', 'format'],
      confidence: 0.9,
      utilityFunction: 'AnalyticsService.generateReport',
      examples: [
        'Show me this month\'s sales report',
        'Generate customer analytics',
        'Create revenue summary for last quarter'
      ]
    },

    // SYSTEM OPERATIONS
    {
      id: 'backup_data',
      category: 'system',
      action: 'create_backup',
      description: 'Create system backup',
      requiredParams: [],
      optionalParams: ['includeMedia'],
      confidence: 0.95,
      utilityFunction: 'SystemService.createBackup',
      examples: [
        'Backup all data',
        'Create system backup',
        'Export everything for safety'
      ]
    }
  ]

  /**
   * INTENT DETECTION - Core Function
   * Analyze user message and determine business intent
   */
  static async detectIntent(message: string, context: {
    tenantId: string
    userId: string
    conversationHistory?: any[]
  }): Promise<IntentResult | null> {
    
    // 1. Preprocess message
    const normalizedMessage = message.toLowerCase().trim()
    
    // 2. Try rule-based matching first (fast)
    const ruleBasedResult = this.ruleBasedMatching(normalizedMessage)
    if (ruleBasedResult && ruleBasedResult.confidence > 0.8) {
      return ruleBasedResult
    }
    
    // 3. Use AI for complex intent detection
    const aiResult = await this.aiIntentDetection(message, context)
    
    // 4. Return best result
    return aiResult
  }

  /**
   * Rule-based intent matching (fast for common patterns)
   */
  private static ruleBasedMatching(message: string): IntentResult | null {
    for (const intent of this.intents) {
      for (const example of intent.examples) {
        const exampleWords = example.toLowerCase().split(' ')
        const messageWords = message.split(' ')
        
        // Simple keyword matching
        const matchingWords = exampleWords.filter(word => 
          messageWords.some(msgWord => msgWord.includes(word) || word.includes(msgWord))
        )
        
        const matchPercentage = matchingWords.length / exampleWords.length
        
        if (matchPercentage > 0.6) {
          return {
            intent,
            confidence: matchPercentage * 0.8, // Lower confidence for rule-based
            extractedParams: this.extractParametersFromMessage(message, intent),
            shouldExecute: matchPercentage > 0.7,
            requiresConfirmation: intent.category === 'payment' || intent.category === 'system'
          }
        }
      }
    }
    
    return null
  }

  /**
   * AI-powered intent detection for complex queries
   */
  private static async aiIntentDetection(message: string, context: any): Promise<IntentResult | null> {
    const prompt = `Analyze this business message and determine the user's intent.

USER MESSAGE: "${message}"

AVAILABLE BUSINESS INTENTS:
${this.intents.map(intent => 
  `- ${intent.id}: ${intent.description} (Category: ${intent.category})`
).join('\n')}

CONTEXT:
- Tenant: ${context.tenantId}
- User: ${context.userId}
- Recent conversation: ${context.conversationHistory?.slice(-3).map(h => h.content).join(' | ') || 'None'}

Return JSON with this structure:
{
  "matchedIntentId": "intent_id_here",
  "confidence": 0.85,
  "reasoning": "Why this intent was selected",
  "extractedParams": {
    "param1": "value1",
    "param2": "value2"
  },
  "shouldExecute": true,
  "requiresConfirmation": false
}

If no clear intent is detected, return null.`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.1
        })
      })

      const data = await response.json()
      const result = JSON.parse(data.choices[0].message.content)
      
      if (!result || !result.matchedIntentId) return null
      
      const matchedIntent = this.intents.find(i => i.id === result.matchedIntentId)
      if (!matchedIntent) return null
      
      return {
        intent: matchedIntent,
        confidence: result.confidence,
        extractedParams: result.extractedParams,
        shouldExecute: result.shouldExecute,
        requiresConfirmation: result.requiresConfirmation
      }
      
    } catch (error) {
      console.error('AI intent detection failed:', error)
      return null
    }
  }

  /**
   * Extract parameters from user message based on intent requirements
   */
  private static extractParametersFromMessage(message: string, intent: BusinessIntent): Record<string, any> {
    const params: Record<string, any> = {}
    
    // Simple parameter extraction patterns
    const patterns = {
      amount: /\$?(\d+(?:\.\d{2})?)/g,
      email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      phone: /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g,
      date: /(tomorrow|today|next\s+\w+|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2})/gi,
      time: /(\d{1,2}:\d{2}\s*(am|pm)?|\d{1,2}\s*(am|pm))/gi
    }
    
    // Extract based on intent requirements
    for (const param of [...intent.requiredParams, ...(intent.optionalParams || [])]) {
      switch (param) {
        case 'amount':
          const amountMatch = message.match(patterns.amount)
          if (amountMatch) params.amount = parseFloat(amountMatch[0].replace('$', ''))
          break
          
        case 'email':
          const emailMatch = message.match(patterns.email)
          if (emailMatch) params.email = emailMatch[0]
          break
          
        case 'dateTime':
          const dateMatch = message.match(patterns.date)
          const timeMatch = message.match(patterns.time)
          if (dateMatch || timeMatch) {
            params.dateTime = `${dateMatch?.[0] || ''} ${timeMatch?.[0] || ''}`.trim()
          }
          break
          
        case 'name':
          // Extract potential names (simple heuristic)
          const nameWords = message.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/)
          if (nameWords) params.name = nameWords[0]
          break
      }
    }
    
    return params
  }

  /**
   * Execute business intent by calling appropriate utility function
   */
  static async executeIntent(intentResult: IntentResult, context: any): Promise<any> {
    const { intent, extractedParams } = intentResult
    
    // Route to appropriate service based on utility function
    switch (intent.utilityFunction) {
      case 'InventoryIntelligenceService.analyzeShelfPhoto':
        const { InventoryIntelligenceService } = await import('./InventoryIntelligence')
        const inventoryService = new InventoryIntelligenceService(context.tenantId)
        await inventoryService.initialize()
        return inventoryService.analyzeShelfPhoto(extractedParams.imageUrl, context)
        
      case 'PaymentService.createPaymentRequest':
        const { PaymentService } = await import('./PaymentService')
        return PaymentService.createPaymentRequest(extractedParams, context)
        
      case 'CRMService.createContact':
        const { CRMService } = await import('./CRMService')
        return CRMService.createContact(extractedParams, context)
        
      case 'AnalyticsService.generateReport':
        const { AnalyticsService } = await import('./AnalyticsService')
        return AnalyticsService.generateReport(extractedParams, context)
        
      default:
        throw new Error(`Unknown utility function: ${intent.utilityFunction}`)
    }
  }

  /**
   * Get all available intents for a category
   */
  static getIntentsByCategory(category: string): BusinessIntent[] {
    return this.intents.filter(intent => intent.category === category)
  }

  /**
   * Add custom intent (for tenant-specific needs)
   */
  static addCustomIntent(intent: BusinessIntent): void {
    this.intents.push(intent)
  }
} 