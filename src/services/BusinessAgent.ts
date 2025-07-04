import type { Payload } from 'payload'
import type { Message, Tenant } from '@/payload-types'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import RevenueService from './RevenueService'
import Anthropic from '@anthropic-ai/sdk'

interface MessageAnalysis {
  intent: 'customer_inquiry' | 'sales_opportunity' | 'positive_feedback' | 'complaint' | 'general'
  sentiment: 'positive' | 'negative' | 'neutral'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  suggestedActions: string[]
  businessContext?: string
}

interface ProductGenerationRequest {
  businessType: 'pizza' | 'restaurant' | 'retail' | 'service' | 'content_creator' | 'cactus_farm' | 'general'
  industry: string
  targetAudience?: string
  priceRange?: { min: number; max: number }
  specialRequirements?: string[]
}

interface ContentManagementCapabilities {
  canCreateProducts: boolean
  canUpdateInventory: boolean
  canManageCategories: boolean
  canCreatePages: boolean
  canManagePosts: boolean
  canGenerateSchwag: boolean
}

export class BusinessAgent {
  private tenantId: string
  private tenantIdNumber: number
  private personality: 'professional' | 'friendly' | 'casual'
  private capabilities: ContentManagementCapabilities
  private revenueService: RevenueService
  private anthropic: Anthropic

  constructor(tenantId: string, personality: 'professional' | 'friendly' | 'casual' = 'professional') {
    this.tenantId = tenantId
    this.tenantIdNumber = parseInt(tenantId)
    this.personality = personality
    this.revenueService = new RevenueService()
    this.capabilities = {
      canCreateProducts: true,
      canUpdateInventory: true,
      canManageCategories: true,
      canCreatePages: true,
      canManagePosts: true,
      canGenerateSchwag: true,
    }
    
    // Initialize Claude-4-Sonnet client
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  // Enhanced message analysis with content management context
  async analyzeMessage(message: Pick<Message, 'id' | 'content' | 'messageType' | 'tenant' | 'author' | 'createdAt' | 'updatedAt'>): Promise<MessageAnalysis> {
    try {
      const content = message.content?.toLowerCase() || ''

      // Enhanced intent detection including content management
      let intent: MessageAnalysis['intent'] = 'general'
      const suggestedActions: string[] = []

      // Product/catalog related intents
      if (content.includes('product') || content.includes('menu') || content.includes('catalog')) {
        if (content.includes('add') || content.includes('create') || content.includes('new')) {
          intent = 'sales_opportunity'
          suggestedActions.push('Consider adding new products to catalog')
          suggestedActions.push('Review inventory levels')
        }
        if (content.includes('update') || content.includes('change') || content.includes('modify')) {
          intent = 'customer_inquiry'
          suggestedActions.push('Update product information')
          suggestedActions.push('Check for inventory changes needed')
        }
      }

      // Inventory management intents
      if (content.includes('stock') || content.includes('inventory') || content.includes('available')) {
        intent = 'customer_inquiry'
        suggestedActions.push('Check current inventory levels')
        suggestedActions.push('Update stock quantities if needed')
      }

      // Content creation intents
      if (content.includes('blog') || content.includes('post') || content.includes('article') || content.includes('content')) {
        intent = 'sales_opportunity'
        suggestedActions.push('Create new blog post or content')
        suggestedActions.push('Update website content')
      }

      // Standard sentiment analysis
      let sentiment: MessageAnalysis['sentiment'] = 'neutral'
      let priority: MessageAnalysis['priority'] = 'normal'

      const positiveWords = ['great', 'excellent', 'love', 'amazing', 'perfect', 'fantastic', 'wonderful']
      const negativeWords = ['terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointed', 'frustrated']
      const urgentWords = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'important']

      if (positiveWords.some(word => content.includes(word))) {
        sentiment = 'positive'
      } else if (negativeWords.some(word => content.includes(word))) {
        sentiment = 'negative'
        priority = 'high'
        intent = 'complaint'
      }

      if (urgentWords.some(word => content.includes(word))) {
        priority = 'urgent'
      }

      // Add AI-generated business context
      const businessContext = await this.generateBusinessContext(content)

      return {
        intent,
        sentiment,
        priority,
        suggestedActions,
        businessContext
      }
    } catch (error) {
      console.error(`[Business Agent ${this.tenantId}] Analysis failed:`, error)
      return {
        intent: 'general',
        sentiment: 'neutral',
        priority: 'normal',
        suggestedActions: ['Review message manually']
      }
    }
  }

  // Analyze plain content text (for external API usage)
  async analyzeContent(content: string): Promise<MessageAnalysis> {
    try {
      const lowerContent = content.toLowerCase()

      // Enhanced intent detection including content management
      let intent: MessageAnalysis['intent'] = 'general'
      const suggestedActions: string[] = []

      // Product/catalog related intents
      if (lowerContent.includes('product') || lowerContent.includes('menu') || lowerContent.includes('catalog')) {
        if (lowerContent.includes('add') || lowerContent.includes('create') || lowerContent.includes('new')) {
          intent = 'sales_opportunity'
          suggestedActions.push('Consider adding new products to catalog')
          suggestedActions.push('Review inventory levels')
        }
        if (lowerContent.includes('update') || lowerContent.includes('change') || lowerContent.includes('modify')) {
          intent = 'customer_inquiry'
          suggestedActions.push('Update product information')
          suggestedActions.push('Check for inventory changes needed')
        }
      }

      // Inventory management intents
      if (lowerContent.includes('stock') || lowerContent.includes('inventory') || lowerContent.includes('available')) {
        intent = 'customer_inquiry'
        suggestedActions.push('Check current inventory levels')
        suggestedActions.push('Update stock quantities if needed')
      }

      // Content creation intents
      if (lowerContent.includes('blog') || lowerContent.includes('post') || lowerContent.includes('article') || lowerContent.includes('content')) {
        intent = 'sales_opportunity'
        suggestedActions.push('Create new blog post or content')
        suggestedActions.push('Update website content')
      }

      // Standard sentiment analysis
      let sentiment: MessageAnalysis['sentiment'] = 'neutral'
      let priority: MessageAnalysis['priority'] = 'normal'

      const positiveWords = ['great', 'excellent', 'love', 'amazing', 'perfect', 'fantastic', 'wonderful']
      const negativeWords = ['terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointed', 'frustrated']
      const urgentWords = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'important']

      if (positiveWords.some(word => lowerContent.includes(word))) {
        sentiment = 'positive'
      } else if (negativeWords.some(word => lowerContent.includes(word))) {
        sentiment = 'negative'
        priority = 'high'
        intent = 'complaint'
      }

      if (urgentWords.some(word => lowerContent.includes(word))) {
        priority = 'urgent'
      }

      // Add AI-generated business context
      const businessContext = await this.generateBusinessContext(content)

      return {
        intent,
        sentiment,
        priority,
        suggestedActions,
        businessContext
      }
    } catch (error) {
      console.error(`[Business Agent ${this.tenantId}] Content analysis failed:`, error)
      return {
        intent: 'general',
        sentiment: 'neutral',
        priority: 'normal',
        suggestedActions: ['Review content manually']
      }
    }
  }

  // Process a message and potentially create AI response (for webhook usage)
  async processMessage(message: Pick<Message, 'id' | 'content' | 'messageType' | 'tenant' | 'author' | 'createdAt' | 'updatedAt'>): Promise<MessageAnalysis> {
    try {
      const analysis = await this.analyzeMessage(message)

      // Create response message if appropriate
      if (analysis.intent !== 'general' && analysis.priority !== 'low') {
        await this.createResponseMessage(message, analysis)
      }

      return analysis
    } catch (error) {
      console.error(`[Business Agent ${this.tenantId}] Message processing failed:`, error)
      return {
        intent: 'general',
        sentiment: 'neutral',
        priority: 'normal',
        suggestedActions: ['Review message manually']
      }
    }
  }

  // DYNAMIC PRODUCT CATALOG GENERATION
  async generateProductCatalog(request: ProductGenerationRequest): Promise<any[]> {
    const payload = await getPayload({ config: configPromise })

    try {
      console.log(`[Business Agent ${this.tenantId}] Generating ${request.businessType} catalog...`)

      switch (request.businessType) {
        case 'pizza':
          return await this.generatePizzaMenu(payload, request)
        case 'restaurant':
          return await this.generateRestaurantMenu(payload, request)
        case 'content_creator':
          return await this.generateSchwagStore(payload, request)
        case 'cactus_farm':
          return await this.generateCactusInventory(payload, request)
        case 'retail':
          return await this.generateRetailCatalog(payload, request)
        case 'service':
          return await this.generateServiceOfferings(payload, request)
        default:
          return await this.generateGeneralCatalog(payload, request)
      }
    } catch (error) {
      console.error(`[Business Agent ${this.tenantId}] Catalog generation failed:`, error)
      return []
    }
  }

  // PIZZA SHOP CATALOG GENERATION
  private async generatePizzaMenu(payload: Payload, request: ProductGenerationRequest): Promise<any[]> {
    const pizzaProducts = []

    // Create pizza categories first
    const pizzaCategory = await this.ensureCategory(payload, {
      title: 'Pizzas',
      slug: 'pizzas',
      businessType: 'physical',
      description: 'Fresh, handcrafted pizzas made to order'
    })

    const appetizerCategory = await this.ensureCategory(payload, {
      title: 'Appetizers',
      slug: 'appetizers',
      businessType: 'physical',
      description: 'Delicious starters and sides'
    })

    // Generate pizza variations
    const pizzaTypes = [
      { name: 'Margherita', basePrice: 12.99, description: 'Fresh mozzarella, tomato sauce, basil' },
      { name: 'Pepperoni', basePrice: 14.99, description: 'Classic pepperoni with mozzarella cheese' },
      { name: 'Supreme', basePrice: 17.99, description: 'Pepperoni, sausage, peppers, onions, mushrooms' },
      { name: 'Hawaiian', basePrice: 15.99, description: 'Ham, pineapple, mozzarella cheese' },
      { name: 'Meat Lovers', basePrice: 19.99, description: 'Pepperoni, sausage, ham, bacon, ground beef' },
      { name: 'Veggie Deluxe', basePrice: 16.99, description: 'Mushrooms, peppers, onions, olives, tomatoes' }
    ]

    for (const pizza of pizzaTypes) {
      const product = await payload.create({
        collection: 'products',
        data: {
          title: `${pizza.name} Pizza`,
          slug: `${pizza.name.toLowerCase().replace(/\s+/g, '-')}-pizza`,
          description: pizza.description,
          sku: `PIZZA_${pizza.name.toUpperCase().replace(/\s+/g, '_')}`,
          productType: 'physical',
          status: 'active',
          tenant: this.tenantIdNumber,
          categories: [pizzaCategory.id],
          pricing: {
            basePrice: pizza.basePrice,
            currency: 'USD'
          },
          // TODO: Variations will be implemented when Product schema supports them
          // Generate size variations placeholder
          hasVariants: false,
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  version: 1,
                  children: [{ text: `Our ${pizza.name} pizza is ${pizza.description.toLowerCase()}. Made with the finest ingredients and baked to perfection in our wood-fired oven.` }]
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1
            }
          }
        }
      })

      pizzaProducts.push(product)
    }

    console.log(`[Business Agent ${this.tenantId}] Generated ${pizzaProducts.length} pizza products`)
    return pizzaProducts
  }

  // CONTENT CREATOR SCHWAG STORE GENERATION
  private async generateSchwagStore(payload: Payload, request: ProductGenerationRequest): Promise<any[]> {
    const schwagProducts = []

    // Create schwag categories
    const apparelCategory = await this.ensureCategory(payload, {
      title: 'Apparel',
      slug: 'apparel',
      businessType: 'physical',
      description: 'High-quality branded clothing and accessories'
    })

    const accessoriesCategory = await this.ensureCategory(payload, {
      title: 'Accessories',
      slug: 'accessories',
      businessType: 'physical',
      description: 'Branded accessories and collectibles'
    })

    // Generate apparel items
    const apparelItems = [
      {
        name: 'Logo T-Shirt',
        basePrice: 24.99,
        description: 'Comfortable cotton t-shirt with our signature logo',
        category: apparelCategory.id,
        variations: ['xs', 's', 'm', 'l', 'xl', 'xxl'],
        colors: ['black', 'white', 'gray', 'red', 'blue']
      },
      {
        name: 'Hoodie',
        basePrice: 44.99,
        description: 'Cozy pullover hoodie perfect for any weather',
        category: apparelCategory.id,
        variations: ['s', 'm', 'l', 'xl', 'xxl'],
        colors: ['black', 'gray', 'red']
      },
      {
        name: 'Baseball Cap',
        basePrice: 19.99,
        description: 'Adjustable baseball cap with embroidered logo',
        category: accessoriesCategory.id,
        variations: ['onesize'],
        colors: ['black', 'white', 'red', 'blue']
      },
      {
        name: 'Coffee Mug',
        basePrice: 14.99,
        description: 'Ceramic coffee mug with channel branding',
        category: accessoriesCategory.id,
        variations: ['11oz', '15oz'],
        colors: ['white', 'black']
      }
    ]

    for (const item of apparelItems) {
      const variations = []

      // Generate all size/color combinations
      for (const size of item.variations) {
        for (const color of item.colors) {
          variations.push({
            name: `${item.name} - ${size.toUpperCase()} ${color.charAt(0).toUpperCase() + color.slice(1)}`,
            sku: `${item.name.toUpperCase().replace(/\s+/g, '_')}_${size.toUpperCase()}_${color.toUpperCase()}`,
            attributes: {
              size: size,
              color: color,
              material: item.name.includes('Mug') ? 'ceramic' : 'cotton'
            },
            pricing: {
              basePrice: item.basePrice + (size === 'xxl' ? 2.00 : 0) // XXL upcharge
            },
            inventory: {
              quantity: 50,
              lowStockThreshold: 5,
              allowBackorder: true
            },
            isActive: true,
            isDefault: size === 'm' && color === 'black' // Default to medium black
          })
        }
      }

      const product = await payload.create({
        collection: 'products',
        data: {
          title: item.name,
          slug: item.name.toLowerCase().replace(/\s+/g, '-'),
          description: item.description,
          sku: `SCHWAG_${item.name.toUpperCase().replace(/\s+/g, '_')}`,
          productType: 'physical',
          status: 'active',
          tenant: this.tenantIdNumber,
          categories: [item.category],
          hasVariants: true,
          pricing: {
            basePrice: item.basePrice,
            currency: 'USD'
          },
          // TODO: Uncomment when variations field is added to Product schema
          // variations: variations,
          shipping: {
            requiresShipping: true,
            freeShipping: false,
            shippingClass: 'standard'
          },
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  version: 1,
                  children: [{ text: `${item.description} Show your support with this high-quality branded merchandise.` }]
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1
            }
          }
        }
      })

      schwagProducts.push(product)
    }

    console.log(`[Business Agent ${this.tenantId}] Generated ${schwagProducts.length} schwag products`)
    return schwagProducts
  }

  // CACTUS FARM INVENTORY GENERATION (for Hays Cactus Farm)
  private async generateCactusInventory(payload: Payload, request: ProductGenerationRequest): Promise<any[]> {
    const cactusProducts = []

    // Create cactus categories
    const cactusCategory = await this.ensureCategory(payload, {
      title: 'Cacti & Succulents',
      slug: 'cacti-succulents',
      businessType: 'physical',
      description: 'Beautiful desert plants for your home and garden'
    })

    const suppliesCategory = await this.ensureCategory(payload, {
      title: 'Care & Supplies',
      slug: 'care-supplies',
      businessType: 'physical',
      description: 'Everything you need to care for your desert plants'
    })

    // Generate cactus varieties
    const cactusTypes = [
      {
        name: 'Barrel Cactus',
        basePrice: 15.99,
        description: 'Classic barrel-shaped cactus, perfect for beginners',
        lightReq: 'full_sun',
        watering: 'monthly',
        difficulty: 'beginner'
      },
      {
        name: 'Prickly Pear',
        basePrice: 12.99,
        description: 'Hardy paddle cactus with beautiful yellow flowers',
        lightReq: 'full_sun',
        watering: 'monthly',
        difficulty: 'beginner'
      },
      {
        name: 'Christmas Cactus',
        basePrice: 18.99,
        description: 'Beautiful flowering cactus that blooms during holidays',
        lightReq: 'bright_indirect',
        watering: 'weekly',
        difficulty: 'intermediate'
      },
      {
        name: 'Golden Barrel',
        basePrice: 45.99,
        description: 'Stunning large specimen cactus with golden spines',
        lightReq: 'full_sun',
        watering: 'monthly',
        difficulty: 'intermediate'
      }
    ]

    for (const cactus of cactusTypes) {
      const variations = []
      const potSizes = ['2in-pot', '4in-pot', '6in-pot', '1gal']
      const potPrices = { '2in-pot': 0, '4in-pot': 5, '6in-pot': 15, '1gal': 25 }

      for (const potSize of potSizes) {
        variations.push({
          name: `${cactus.name} - ${potSize.replace('-', ' ').toUpperCase()}`,
          sku: `CACTUS_${cactus.name.toUpperCase().replace(/\s+/g, '_')}_${potSize.toUpperCase().replace('-', '_')}`,
          attributes: {
            size: potSize,
            customAttributes: [
              { name: 'Light Requirement', value: cactus.lightReq.replace('_', ' ').toUpperCase() },
              { name: 'Watering', value: cactus.watering.charAt(0).toUpperCase() + cactus.watering.slice(1) },
              { name: 'Difficulty', value: cactus.difficulty.charAt(0).toUpperCase() + cactus.difficulty.slice(1) }
            ]
          },
          pricing: {
            basePrice: cactus.basePrice + potPrices[potSize as keyof typeof potPrices]
          },
          inventory: {
            quantity: potSize === '2in-pot' ? 50 : potSize === '4in-pot' ? 30 : potSize === '6in-pot' ? 15 : 5,
            lowStockThreshold: potSize === '2in-pot' ? 10 : 3,
            allowBackorder: false
          },
          isActive: true,
          isDefault: potSize === '4in-pot'
        })
      }

      const product = await payload.create({
        collection: 'products',
        data: {
          title: cactus.name,
          slug: cactus.name.toLowerCase().replace(/\s+/g, '-'),
          description: cactus.description,
          sku: `CACTUS_${cactus.name.toUpperCase().replace(/\s+/g, '_')}`,
          productType: 'physical',
          status: 'active',
          tenant: this.tenantIdNumber,
          categories: [cactusCategory.id],
          pricing: {
            basePrice: cactus.basePrice,
            currency: 'USD'
          },
          // TODO: Uncomment when variations field is added to Product schema
          // variations: variations,
          shipping: {
            requiresShipping: true,
            freeShipping: false,
            shippingClass: 'fragile'
          },
          tags: [
            { tag: 'cactus' },
            { tag: 'succulent' },
            { tag: 'desert plant' },
            { tag: cactus.difficulty },
            { tag: cactus.lightReq.replace('_', ' ') }
          ],
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  version: 1,
                  children: [{ text: `${cactus.description} This beautiful plant requires ${cactus.lightReq.replace('_', ' ')} and ${cactus.watering} watering. Perfect for ${cactus.difficulty} level plant parents.` }]
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1
            }
          }
        }
      })

      cactusProducts.push(product)
    }

    console.log(`[Business Agent ${this.tenantId}] Generated ${cactusProducts.length} cactus products`)
    return cactusProducts
  }

  // INVENTORY MANAGEMENT
  async updateInventory(productId: string, variationSku?: string, newQuantity?: number): Promise<boolean> {
    const payload = await getPayload({ config: configPromise })

    try {
      const product = await payload.findByID({
        collection: 'products',
        id: productId,
        depth: 1
      })

      if (!product) {
        console.error(`[Business Agent ${this.tenantId}] Product not found: ${productId}`)
        return false
      }

      if (product.hasVariants && variationSku) {
        // TODO: Implement variation inventory when schema supports it
        console.log(`[Business Agent ${this.tenantId}] Variation inventory update requested but not implemented yet`)
      } else {
        // Update main product inventory
        await payload.update({
          collection: 'products',
          id: productId,
          data: {
            inventory: {
              ...product.inventory,
              quantity: newQuantity ?? product.inventory?.quantity ?? 0
            }
          }
        })
      }

      console.log(`[Business Agent ${this.tenantId}] Updated inventory for ${variationSku || productId}`)
      return true
    } catch (error) {
      console.error(`[Business Agent ${this.tenantId}] Inventory update failed:`, error)
      return false
    }
  }

  // CONTENT MANAGEMENT
  async createBlogPost(title: string, content: string, category?: string): Promise<any> {
    const payload = await getPayload({ config: configPromise })

    try {
      const post = await payload.create({
        collection: 'posts',
        data: {
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  version: 1,
                  children: [{ text: content }]
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1
            }
          },
          _status: 'published',
          publishedAt: new Date().toISOString()
          // Note: Posts may not have tenant field in current schema
        }
      })

      console.log(`[Business Agent ${this.tenantId}] Created blog post: ${title}`)
      return post
    } catch (error) {
      console.error(`[Business Agent ${this.tenantId}] Blog post creation failed:`, error)
      return null
    }
  }

  // Helper methods
  private async ensureCategory(payload: Payload, categoryData: any): Promise<any> {
    const existing = await payload.find({
      collection: 'categories',
      where: {
        and: [
          { slug: { equals: categoryData.slug } },
          { tenant: { equals: this.tenantId } }
        ]
      },
      limit: 1
    })

    if (existing.docs.length > 0) {
      return existing.docs[0]
    }

    return await payload.create({
      collection: 'categories',
      data: {
        ...categoryData,
        tenant: this.tenantIdNumber,
        isActive: true,
        displayOrder: 0
      }
    })
  }

  private async generateBusinessContext(content: string): Promise<string> {
    try {
      // Get tenant information for context
      const payload = await getPayload({ config: configPromise })
      const tenant = await payload.findByID({
        collection: 'tenants',
        id: this.tenantId
      })

      const businessType = tenant?.businessType || 'general business'
      const businessName = tenant?.name || 'Business'

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: `As an AI business analyst for ${businessName} (a ${businessType}), analyze this customer message and provide strategic business context in 2-3 sentences:

"${content}"

Focus on: business opportunity, customer intent, actionable insights, potential revenue impact. Be concise and specific to ${businessType} industry.`
        }]
      })

      const analysis = message.content[0]?.type === 'text' ? message.content[0].text : 'No analysis generated'
      
      console.log(`[BusinessAgent ${this.tenantId}] Claude-4-Sonnet business context generated`)
      return analysis

    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Claude API error:`, error)
      return `Business context analysis: ${content.slice(0, 100)}...`
    }
  }

  // Placeholder methods for other business types
  private async generateRestaurantMenu(payload: Payload, request: ProductGenerationRequest): Promise<any[]> {
    // Similar to pizza but with more diverse menu items
    return []
  }

  private async generateRetailCatalog(payload: Payload, request: ProductGenerationRequest): Promise<any[]> {
    // General retail product generation
    return []
  }

  private async generateServiceOfferings(payload: Payload, request: ProductGenerationRequest): Promise<any[]> {
    // Service-based business offerings
    return []
  }

  private async generateGeneralCatalog(payload: Payload, request: ProductGenerationRequest): Promise<any[]> {
    // Fallback general catalog
    return []
  }

  // REVENUE & PARTNERSHIP MANAGEMENT
  async getRevenueAnalytics(): Promise<any> {
    try {
      return await this.revenueService.getRevenueAnalytics(this.tenantId)
    } catch (error) {
      console.error(`[Business Agent ${this.tenantId}] Failed to get revenue analytics:`, error)
      return null
    }
  }

  async processMonthlyRevenue(): Promise<any> {
    try {
      return await this.revenueService.processMonthlyRevenue(this.tenantId)
    } catch (error) {
      console.error(`[Business Agent ${this.tenantId}] Failed to process monthly revenue:`, error)
      return null
    }
  }

  async adjustPartnershipTier(newTier: string, negotiatedTerms?: string): Promise<boolean> {
    try {
      return await this.revenueService.adjustPartnershipTier(this.tenantId, newTier, negotiatedTerms)
    } catch (error) {
      console.error(`[Business Agent ${this.tenantId}] Failed to adjust partnership tier:`, error)
      return false
    }
  }

  // UNIVERSAL TRANSLATION CAPABILITIES
  async translateSiteContent(content: any, targetLanguage: string): Promise<any> {
    // Recursively translate all content while preserving structure
    if (typeof content === 'string') {
      return await this.translateWithBusinessContext(content, targetLanguage)
    }

    if (Array.isArray(content)) {
      return await Promise.all(content.map(item => this.translateSiteContent(item, targetLanguage)))
    }

    if (typeof content === 'object' && content !== null) {
      const translated: { [key: string]: any } = {}
      for (const [key, value] of Object.entries(content)) {
        translated[key] = await this.translateSiteContent(value, targetLanguage)
      }
      return translated
    }

    return content
  }

  // CONTEXT-AWARE TRANSLATION
  async translateWithBusinessContext(text: string, targetLanguage: string): Promise<string> {
    if (!text || typeof text !== 'string' || targetLanguage === 'en') {
      return text
    }

    try {
      // Get tenant for business context
      const payload = await getPayload({ config: configPromise })
      const tenant = await payload.findByID({
        collection: 'tenants',
        id: this.tenantId
      })

      if (!tenant) return text

      const businessType = tenant.businessType || 'general business'
      const businessName = tenant.name || 'Business'

      console.log(`[BusinessAgent ${this.tenantId}] Translating "${text}" to ${targetLanguage} for ${businessName} (${businessType})`)

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        temperature: 0.2,
        messages: [{
          role: 'user',
          content: `Translate this ${businessType} content to ${targetLanguage}, maintaining business context and cultural appropriateness for ${businessName}:

"${text}"

Requirements:
- Preserve business terminology and brand voice
- Use formal/professional tone appropriate for ${businessType}
- Consider cultural nuances for ${targetLanguage} market
- Return ONLY the translated text, no explanations`
        }]
      })

      const translation = message.content[0]?.type === 'text' ? message.content[0].text : text
      
      console.log(`[BusinessAgent ${this.tenantId}] Claude-4-Sonnet translation completed`)
      return translation.trim()

    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Claude translation failed:`, error)
      return `[${targetLanguage.toUpperCase()}] ${text}` // Fallback
    }
  }

  // AUTO-DETECT AND TRANSLATE PAGES
  async autoTranslatePage(pageData: any, userLanguage?: string): Promise<any> {
    const detectedLanguage = userLanguage || 'en'

    if (detectedLanguage === 'en') {
      return pageData // No translation needed
    }

    console.log(`[BusinessAgent ${this.tenantId}] Auto-translating page to ${detectedLanguage}`)

    try {
      return {
        ...pageData,
        title: await this.translateWithBusinessContext(pageData.title, detectedLanguage),
        content: await this.translateSiteContent(pageData.content, detectedLanguage),
        meta: pageData.meta ? {
          ...pageData.meta,
          title: await this.translateWithBusinessContext(pageData.meta.title, detectedLanguage),
          description: await this.translateWithBusinessContext(pageData.meta.description, detectedLanguage)
        } : pageData.meta
      }
    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Page translation failed:`, error)
      return pageData
    }
  }

  // PRODUCT CATALOG TRANSLATION
  async translateProductCatalog(products: any[], targetLanguage: string): Promise<any[]> {
    if (!products.length || targetLanguage === 'en') {
      return products
    }

    console.log(`[BusinessAgent ${this.tenantId}] Translating ${products.length} products to ${targetLanguage}`)

    const translatedProducts = []

    try {
      for (const product of products) {
        const translatedProduct = {
          ...product,
          title: await this.translateWithBusinessContext(product.title, targetLanguage),
          description: await this.translateWithBusinessContext(product.description, targetLanguage),
          content: await this.translateSiteContent(product.content, targetLanguage),
          // Keep SKU, pricing, etc. unchanged
          sku: product.sku,
          pricing: product.pricing,
          // Translate categories if they exist
          categories: product.categories ? await Promise.all(
            product.categories.map(async (cat: any) => ({
              ...cat,
              title: await this.translateWithBusinessContext(cat.title, targetLanguage),
              description: await this.translateWithBusinessContext(cat.description, targetLanguage)
            }))
          ) : product.categories
        }

        translatedProducts.push(translatedProduct)
      }

      return translatedProducts
    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Product catalog translation failed:`, error)
      return products
    }
  }

  // DETECT USER LANGUAGE FROM TEXT
  async detectLanguageFromText(text: string): Promise<string> {
    if (!text) return 'en'

    // Simple language detection based on common words/patterns
    // In production, you'd use a proper language detection service
    const spanishWords = ['hola', 'gracias', 'por favor', 'sí', 'no', 'cómo', 'qué', 'dónde']
    const frenchWords = ['bonjour', 'merci', 's\'il vous plaît', 'oui', 'non', 'comment', 'quoi', 'où']
    const germanWords = ['hallo', 'danke', 'bitte', 'ja', 'nein', 'wie', 'was', 'wo']

    const lowerText = text.toLowerCase()

    if (spanishWords.some(word => lowerText.includes(word))) return 'es'
    if (frenchWords.some(word => lowerText.includes(word))) return 'fr'
    if (germanWords.some(word => lowerText.includes(word))) return 'de'

    return 'en' // Default to English
  }

  // INTELLIGENT RESPONSE GENERATION using Claude-4-Sonnet
  async generateIntelligentResponse(
    message: string, 
    context?: { customerName?: string; previousMessages?: string[]; urgency?: string }
  ): Promise<string> {
    try {
      // Get tenant information for personalized responses
      const payload = await getPayload({ config: configPromise })
      const tenant = await payload.findByID({
        collection: 'tenants',
        id: this.tenantId
      })

      const businessType = tenant?.businessType || 'general business'
      const businessName = tenant?.name || 'Business'
      const customerName = context?.customerName || 'Customer'
      
      // Build context from previous messages if available
      const conversationContext = context?.previousMessages?.length 
        ? `\n\nPrevious conversation:\n${context.previousMessages.join('\n')}`
        : ''

      const urgencyNote = context?.urgency === 'high' ? '\n\nNote: This is a high-priority message requiring immediate attention.' : ''

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.4,
        messages: [{
          role: 'user',
          content: `You are the AI assistant for ${businessName}, a ${businessType}. Generate a helpful, professional response to this customer message.

Business Personality: ${this.personality}
Customer Name: ${customerName}
Customer Message: "${message}"${conversationContext}${urgencyNote}

Instructions:
- Be ${this.personality} but always helpful
- Address specific questions or concerns
- Suggest relevant products/services when appropriate
- Include next steps or call-to-action
- Keep response concise but comprehensive
- Use the customer's name when appropriate
- Match the tone to the ${businessType} industry

Response:`
        }]
      })

      const intelligentResponse = response.content[0]?.type === 'text' ? response.content[0].text : 'Thank you for your message. We will get back to you soon.'
      
      console.log(`[BusinessAgent ${this.tenantId}] Claude-4-Sonnet intelligent response generated`)
      return intelligentResponse.trim()

    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Claude response generation failed:`, error)
      return `Thank you for contacting us. We appreciate your message and will respond as soon as possible.`
    }
  }

  // Create an AI response message in the Messages collection
  private async createResponseMessage(originalMessage: Pick<Message, 'id' | 'content' | 'messageType' | 'tenant' | 'author' | 'createdAt' | 'updatedAt'>, analysis: MessageAnalysis): Promise<void> {
    try {
      const payload = await getPayload({ config: configPromise })

      let responseContent = ''

      // Generate response based on intent
      switch (analysis.intent) {
        case 'customer_inquiry':
          responseContent = `I've received your inquiry and will make sure it gets the attention it needs. ${this.personality === 'friendly' ? 'Thanks for reaching out! 😊' : 'A team member will follow up shortly.'}`
          break
        case 'sales_opportunity':
          responseContent = `Thanks for your interest! I'll connect you with our sales team to discuss how we can help.`
          break
        case 'positive_feedback':
          responseContent = `Thank you for the positive feedback! It means a lot to our team.`
          break
        case 'complaint':
          responseContent = `I understand your concern and want to make this right. Let me escalate this to our management team immediately.`
          break
        default:
          responseContent = `I've noted your message and will make sure the right people see it.`
      }

      // Create the response message with all required fields for Spaces integration
      await payload.create({
        collection: 'messages',
        data: {
          content: responseContent,
          messageType: 'ai_agent',
          tenant: this.tenantIdNumber,
          author: originalMessage.author,
          space: 1, // Default space - could be made configurable
          timestamp: new Date().toISOString(),
          atProtocol: {
            type: 'co.kendev.spaces.ai_response',
            did: `did:plc:${this.tenantId}-ai-agent`,
          },
          metadata: {
            aiAgent: {
              respondingTo: originalMessage.id,
              analysis: analysis,
              personality: this.personality,
              confidence: 0.8
            }
          },
          businessContext: {
            department: 'support',
            workflow: 'support',
            priority: analysis.priority as 'low' | 'normal' | 'high' | 'urgent'
          }
        }
      })

      console.log(`[Business Agent ${this.tenantId}] Created response to message ${originalMessage.id}`)
    } catch (error) {
      console.error(`[Business Agent ${this.tenantId}] Failed to create response:`, error)
    }
  }
}

// Simple factory for creating tenant-specific agents
export class BusinessAgentFactory {
  static createForTenant(tenant: Tenant): BusinessAgent {
    let personality = 'professional'

    // Customize personality based on business type
    if (tenant.businessType === 'cactus-farm') personality = 'friendly'
    if (tenant.businessType === 'bedbug-treatment') personality = 'analytical'
    if (tenant.businessType === 'salon') personality = 'creative'

    return new BusinessAgent(tenant.id.toString(), personality as 'professional' | 'friendly' | 'casual')
  }
}
