import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { about } from './about'
import { privacyPolicy } from './privacy-policy'
import { termsOfService } from './terms-of-service'
// import { shopPage } from './shop-page' // Unused
// import { services } from './services' // Removed due to richText structure issues
// import { consultationBooking } from './consultation-booking' // Removed due to richText structure issues
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'
import { post4 } from './post-4'

const _collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'forms',
  'form-submissions',
  'search',
]
const _globals: GlobalSlug[] = ['header', 'footer']

// Lexical content builder utilities
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createLexicalContent = (children: any[]): any => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1
  }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createLexicalParagraph = (text: string, format: number = 0): any => ({
  type: 'paragraph',
  children: [
    {
      type: 'text',
      detail: 0,
      format,
      mode: 'normal',
      style: '',
      text,
      version: 1,
    }
  ],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: format,
  version: 1,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createLexicalHeading = (text: string, tag: 'h1' | 'h2' | 'h3' | 'h4' = 'h2'): any => ({
  type: 'heading',
  children: [
    {
      type: 'text',
      detail: 0,
      format: 0,
      mode: 'normal',
      style: '',
      text,
      version: 1,
    }
  ],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  version: 1,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createLexicalList = (items: string[], listType: 'bullet' | 'number' = 'bullet'): any => ({
  type: listType === 'bullet' ? 'unorderedlist' : 'orderedlist',
  children: items.map((item, index) => ({
    type: 'listitem',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: item,
            version: 1,
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    value: index + 1,
  })),
  direction: 'ltr',
  format: '',
  indent: 0,
  listType: listType === 'bullet' ? 'unordered' : 'ordered',
  start: 1,
  tag: listType === 'bullet' ? 'ul' : 'ol',
  version: 1
})

// Tenant Template Configuration Interface
interface TenantTemplate {
  name: string
  slug: string
  domain: string
  subdomain: string
  businessType: 'service' | 'dumpster-rental' | 'bedbug-treatment' | 'salon' | 'cactus-farm' | 'retail' | 'other'
  industry: string
  description: string
  configuration: {
    primaryColor: string
    contactEmail: string
    contactPhone: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  services: Array<{
    title: string
    slug: string
    description: string
    price: number
    duration?: number
    category: string
  }>
  content: {
    heroTitle: string
    heroSubtitle: string
    aboutSection: string
    servicesIntro: string
  }
}

// Tenant Templates - Foundation for Multi-Tenant Onboarding
const TENANT_TEMPLATES: Record<string, TenantTemplate> = {
  kendevco: {
    name: "KenDev.Co",
    slug: "kendevco",
    domain: "kendev.co",
    subdomain: "spaces",
    businessType: "service",
    industry: "AI Automation & Web Development",
    description: "AI Automation and Implementation Agency specializing in n8n workflows, custom web development, and Spaces platform implementations for Dallas-Fort Worth area businesses",
    configuration: {
      primaryColor: "#3b82f6",
      contactEmail: "kenneth.courtney@gmail.com",
      contactPhone: "7272564413",
      address: {
        street: "2566 Harn Blvd, Apt 13",
        city: "Clearwater",
        state: "FL",
        zipCode: "33764",
        country: "US"
      }
    },
    services: [
      {
        title: "Spaces Platform Implementation",
        slug: "spaces-platform-implementation",
        description: "Complete Discord-style collaboration platform with enterprise multi-tenancy, AI integration, and custom workflow automation",
        price: 5000,
        duration: 960,
        category: "platform-implementation"
      },
      {
        title: "n8n Workflow Automation",
        slug: "n8n-workflow-automation",
        description: "Custom automation workflows using n8n with database integration, API orchestration, and business process optimization",
        price: 1500,
        duration: 240,
        category: "automation-solutions"
      },
      {
        title: "VAPI Voice AI Integration",
        slug: "vapi-voice-ai-integration",
        description: "Advanced voice AI integration with automated scheduling, customer service, and business process automation",
        price: 3000,
        duration: 360,
        category: "ai-integration"
      },
      {
        title: "AI Readiness Assessment",
        slug: "ai-readiness-assessment",
        description: "Comprehensive AI readiness evaluation with implementation roadmap, technology recommendations, and ROI analysis",
        price: 2500,
        duration: 480,
        category: "ai-consulting"
      }
    ],
    content: {
      heroTitle: "AI Automation & Implementation Agency",
      heroSubtitle: "Transform your business with intelligent automation, custom Spaces platform implementations, and cutting-edge AI solutions. Proudly serving Dallas-Fort Worth area businesses and Celersoft partners.",
      aboutSection: "KenDev.Co specializes in AI-powered automation solutions that revolutionize business operations. From n8n workflow automation to comprehensive Spaces platform implementations, we help organizations leverage technology for competitive advantage. Our open-source approach ensures transparency, extensibility, and freedom from vendor lock-in.",
      servicesIntro: "Our comprehensive suite of services covers everything from AI strategy and planning to full-scale platform implementations. We work closely with local Dallas-area businesses, Celersoft affiliates, and forward-thinking companies ready to embrace the future of collaborative work environments."
    }
  }
}

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req: _req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('🚀 Starting database seeding with tenant templates...')

  // Get tenant configuration (default to kendevco, can be overridden with SEED_TENANT env var)
  const tenantKey = process.env.SEED_TENANT || 'kendevco'
  const tenantTemplate = TENANT_TEMPLATES[tenantKey]

  if (!tenantTemplate) {
    throw new Error(`Tenant template '${tenantKey}' not found. Available templates: ${Object.keys(TENANT_TEMPLATES).join(', ')}`)
  }

  payload.logger.info(`📋 Using tenant template: ${tenantTemplate.name} (${tenantTemplate.industry})`)

  // Helper function to check if item exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkExists = async (collection: string, where: any) => {
    try {
      const result = await payload.find({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        collection: collection as any,
        where,
        limit: 1,
      })
      return result.docs.length > 0 ? result.docs[0] : null
    } catch (_error) {
      return null
    }
  }

  // Helper function to safely delete collection items for re-initialization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeDelete = async (collection: string, where: any) => {
    try {
      const items = await payload.find({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        collection: collection as any,
        where,
        limit: 100,
      })

      for (const item of items.docs) {
        await payload.delete({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          collection: collection as any,
          id: item.id,
        })
      }

      payload.logger.info(`🗑️  Cleaned up ${items.docs.length} items from ${collection}`)
    } catch (error) {
      payload.logger.warn(`⚠️  Could not clean up ${collection}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Re-initialization: Clean up existing tenant data if in development mode
  if (process.env.NODE_ENV === 'development' && process.env.SEED_CLEAN === 'true') {
    payload.logger.info('🧹 Development mode: Performing database re-initialization...')
    payload.logger.info('   This will clean existing tenant data for fresh seeding')

    // Clean up tenant-specific data in proper order (respecting relationships)
    await safeDelete('posts', { 'authors.email': { equals: 'demo-author@example.com' } })
    await safeDelete('products', { tenant: { exists: true } })
    await safeDelete('categories', { tenant: { exists: true } })
    await safeDelete('tenants', { slug: { equals: tenantTemplate.slug } })
    await safeDelete('users', { email: { equals: 'demo-author@example.com' } })

    payload.logger.info('✅ Database re-initialization completed')
  }

  payload.logger.info(`— Demo author will be created after tenant setup...`)

  payload.logger.info(`— Checking for media...`)

  // Check if media already exists
  let image1Doc = await checkExists('media', { alt: { equals: 'Post 1' } })
  let image2Doc = await checkExists('media', { alt: { equals: 'Post 2' } })
  let image3Doc = await checkExists('media', { alt: { equals: 'Post 3' } })
  let imageHomeDoc = await checkExists('media', { alt: { equals: 'Hero 1' } })

  if (!image1Doc || !image2Doc || !image3Doc || !imageHomeDoc) {
    payload.logger.info(`— Creating missing media...`)

  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp',
    ),
  ])

    const mediaCreations = []

    if (!image1Doc) {
      mediaCreations.push(
    payload.create({
      collection: 'media',
      data: image1,
      file: image1Buffer,
        })
      )
    }
    if (!image2Doc) {
      mediaCreations.push(
    payload.create({
      collection: 'media',
      data: image2,
      file: image2Buffer,
        })
      )
    }
    if (!image3Doc) {
      mediaCreations.push(
    payload.create({
      collection: 'media',
      data: image2,
      file: image3Buffer,
        })
      )
    }
    if (!imageHomeDoc) {
      mediaCreations.push(
    payload.create({
      collection: 'media',
      data: imageHero1,
      file: hero1Buffer,
        })
      )
    }

    const createdMedia = await Promise.all(mediaCreations)

    // Assign created media to variables
    let mediaIndex = 0
    if (!image1Doc) image1Doc = createdMedia[mediaIndex++]
    if (!image2Doc) image2Doc = createdMedia[mediaIndex++]
    if (!image3Doc) image3Doc = createdMedia[mediaIndex++]
    if (!imageHomeDoc) imageHomeDoc = createdMedia[mediaIndex++]
  } else {
    payload.logger.info(`— All media already exists, skipping...`)
  }

  payload.logger.info(`🏢 Setting up ${tenantTemplate.name} tenant...`)

  // Create or update tenant using template
  let tenant = await checkExists('tenants', {
    slug: { equals: tenantTemplate.slug }
  })

  if (!tenant) {
    payload.logger.info(`— Creating ${tenantTemplate.name} tenant...`)
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: tenantTemplate.name,
        slug: tenantTemplate.slug,
        domain: tenantTemplate.domain,
        subdomain: tenantTemplate.subdomain,
        businessType: tenantTemplate.businessType,
        status: "active",
        configuration: {
          primaryColor: tenantTemplate.configuration.primaryColor,
          logo: imageHomeDoc.id,
          favicon: null,
          contactEmail: tenantTemplate.configuration.contactEmail,
          contactPhone: tenantTemplate.configuration.contactPhone,
          address: tenantTemplate.configuration.address
        },
        features: {
          ecommerce: true,
          spaces: true,
          crm: true,
          vapi: true,
          n8n: true,
          memberPortal: true
        },
        limits: {
          maxUsers: 1000,
          maxProducts: 100,
          maxStorage: 1000
        }
      }
    })
  } else {
    payload.logger.info(`— ${tenantTemplate.name} tenant already exists, updating configuration...`)
    tenant = await payload.update({
      collection: 'tenants',
      id: tenant.id,
      data: {
        status: "active",
        configuration: {
          ...tenant.configuration,
          primaryColor: tenantTemplate.configuration.primaryColor,
          logo: imageHomeDoc.id,
          contactEmail: tenantTemplate.configuration.contactEmail,
          contactPhone: tenantTemplate.configuration.contactPhone,
          address: tenantTemplate.configuration.address
        },
        features: {
          ecommerce: true,
          spaces: true,
          crm: true,
          vapi: true,
          n8n: true,
          memberPortal: true
        }
      }
    })
  }

  payload.logger.info(`— Checking for demo author (after tenant creation)...`)

  // Check if demo author exists - NOW that tenant exists
  let demoAuthor = await checkExists('users', {
    email: { equals: 'demo-author@example.com' }
  })

  if (!demoAuthor) {
    payload.logger.info(`— Creating demo author with tenant assignment...`)
    demoAuthor = await payload.create({
    collection: 'users',
      data: {
        name: 'Demo Author',
        firstName: 'Demo',
        lastName: 'Author',
        email: 'demo-author@example.com',
        password: 'password',
        globalRole: 'user',
        tenant: tenant.id, // NOW we have the tenant ID!
      },
    })
  } else {
    payload.logger.info(`— Demo author already exists, skipping...`)
  }

  payload.logger.info(`— Checking for post categories...`)

  // Check if Spaces-related post categories exist
  let spacesCategory = await checkExists('categories', {
    and: [
      { slug: { equals: 'spaces-platform' } },
      { tenant: { equals: tenant.id } }
    ]
  })

  if (!spacesCategory) {
    payload.logger.info(`— Creating Spaces platform category...`)
    spacesCategory = await payload.create({
      collection: 'categories',
      data: {
        title: 'Spaces Platform',
        slug: 'spaces-platform',
        description: 'Latest updates and features of the Spaces collaboration platform',
        businessType: 'digital',
        isActive: true,
        featured: true,
        displayOrder: 1,
        tenant: tenant.id,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Stay updated with the latest developments, features, and innovations in the Spaces collaboration platform.'
                  }
                ],
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1
          }
        },
        meta: {
          title: 'Spaces Platform Updates - KenDev.Co',
          description: 'Latest updates and features of the Spaces collaboration platform.'
        }
      }
    })
  } else {
    payload.logger.info(`— Spaces platform category already exists, skipping...`)
  }

  let aiIntegrationCategory = await checkExists('categories', {
    and: [
      { slug: { equals: 'ai-integration' } },
      { tenant: { equals: tenant.id } }
    ]
  })

  if (!aiIntegrationCategory) {
    payload.logger.info(`— Creating AI integration category...`)
    aiIntegrationCategory = await payload.create({
      collection: 'categories',
      data: {
        title: 'AI Integration',
        slug: 'ai-integration',
        description: 'AI-powered features and intelligent automation in business platforms',
        businessType: 'digital',
        isActive: true,
        featured: true,
        displayOrder: 2,
        tenant: tenant.id,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Explore how AI and machine learning are transforming business collaboration and automation.'
                  }
                ],
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1
          }
        },
        meta: {
          title: 'AI Integration - KenDev.Co',
          description: 'AI-powered features and intelligent automation in business platforms.'
        }
      }
    })
  } else {
    payload.logger.info(`— AI integration category already exists, skipping...`)
  }

  payload.logger.info(`— Checking for AI consulting categories...`)

  // Check if AI consulting categories exist
  let aiConsultingCategory = await checkExists('categories', {
    and: [
      { slug: { equals: 'ai-consulting' } },
      { tenant: { equals: tenant.id } }
    ]
  })

  if (!aiConsultingCategory) {
    payload.logger.info(`— Creating AI consulting category...`)
    aiConsultingCategory = await payload.create({
      collection: 'categories',
      data: {
        title: 'AI Consulting',
        slug: 'ai-consulting',
        description: 'Professional AI consulting services and strategic guidance',
        businessType: 'consultations',
        isActive: true,
        featured: true,
        displayOrder: 1,
        tenant: tenant.id,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Transform your business with cutting-edge AI solutions. Our expert consulting services help you navigate the complex world of artificial intelligence and implement strategies that drive real results.'
                  }
                ],
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1
          }
        },
        meta: {
          title: 'AI Consulting Services - KenDev.Co',
          description: 'Expert AI consulting services to help your business leverage artificial intelligence for growth and innovation.'
        }
      }
    })
  } else {
    payload.logger.info(`— AI consulting category already exists, skipping...`)
  }

  let automationCategory = await checkExists('categories', {
    and: [
      { slug: { equals: 'automation-solutions' } },
      { tenant: { equals: tenant.id } }
    ]
  })

  if (!automationCategory) {
    payload.logger.info(`— Creating automation solutions category...`)
    automationCategory = await payload.create({
      collection: 'categories',
      data: {
        title: 'Automation Solutions',
        slug: 'automation-solutions',
        description: 'Custom automation solutions to streamline your business processes',
        businessType: 'services',
        isActive: true,
        featured: true,
        displayOrder: 2,
        tenant: tenant.id,
        parent: aiConsultingCategory.id,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Streamline your operations with intelligent automation. From workflow optimization to AI-powered process automation, we help you work smarter, not harder.'
                  }
                ],
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1
          }
        },
        meta: {
          title: 'Business Automation Solutions - KenDev.Co',
          description: 'Custom automation solutions using AI and modern tools to optimize your business processes.'
        }
      }
    })
  } else {
    payload.logger.info(`— Automation solutions category already exists, skipping...`)
  }

  let strategyCategory = await checkExists('categories', {
    and: [
      { slug: { equals: 'ai-strategy-planning' } },
      { tenant: { equals: tenant.id } }
    ]
  })

  if (!strategyCategory) {
    payload.logger.info(`— Creating AI strategy & planning category...`)
    strategyCategory = await payload.create({
      collection: 'categories',
      data: {
        title: 'AI Strategy & Planning',
        slug: 'ai-strategy-planning',
        description: 'Strategic AI planning and implementation roadmaps',
        businessType: 'consultations',
        isActive: true,
        featured: false,
        displayOrder: 3,
        tenant: tenant.id,
        parent: aiConsultingCategory.id,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Develop a comprehensive AI strategy tailored to your business goals. Our strategic planning services ensure your AI initiatives deliver maximum value and competitive advantage.'
                  }
                ],
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1
          }
        },
        meta: {
          title: 'AI Strategy & Planning Services - KenDev.Co',
          description: 'Strategic AI planning and implementation roadmaps to guide your business transformation.'
        }
      }
    })
  } else {
    payload.logger.info(`— AI strategy & planning category already exists, skipping...`)
  }

  payload.logger.info(`🛍️ Creating products/services for ${tenantTemplate.name}...`)

  // Create products based on tenant template services
  for (const service of tenantTemplate.services) {
    let product = await checkExists('products', {
    and: [
        { slug: { equals: service.slug } },
        { tenant: { equals: tenant.id } }
      ]
    })

    if (!product) {
      payload.logger.info(`— Creating ${service.title} product...`)

      // Build proper Lexical content for products
      let productContent

      if (service.slug === 'spaces-platform-implementation') {
        productContent = createLexicalContent([
          createLexicalParagraph('Transform your team collaboration with a fully customized Spaces platform implementation. Get Discord-style communication with enterprise-grade security, multi-tenancy, and AI-powered business intelligence.'),
          createLexicalHeading('What\'s Included', 'h2'),
          createLexicalList([
            'Complete Spaces platform setup and configuration',
            'Multi-tenant architecture implementation',
            'Custom branding and theme development',
            'AI agent integration and configuration',
            'n8n workflow automation setup',
            'Database optimization and security hardening',
            'User training and documentation',
            'Post-launch support and optimization'
          ]),
          createLexicalHeading('Platform Features', 'h2'),
          createLexicalList([
            'Real-time messaging with rich content blocks',
            'Voice and video communication channels',
            'Advanced permission management',
            'AT Protocol federation capabilities',
            'Business intelligence dashboard',
            'Mobile-responsive progressive web app',
            'API integration and webhooks',
            'Scalable multi-tenant architecture'
          ]),
          createLexicalHeading('Timeline & Process', 'h2'),
          createLexicalParagraph('Implementation typically takes 2-4 weeks depending on complexity and customization requirements. We follow an agile approach with regular check-ins and iterative development to ensure the platform meets your exact needs.'),
          createLexicalHeading('Ongoing Support', 'h2'),
          createLexicalParagraph('Post-launch support includes platform monitoring, security updates, feature enhancements, and user training. We provide comprehensive documentation and can train your team to manage and extend the platform independently.')
        ])
      } else if (service.slug === 'n8n-workflow-automation') {
        productContent = createLexicalContent([
          createLexicalParagraph('Automate your business processes with custom n8n workflows that connect your tools, databases, and APIs. Reduce manual work, eliminate errors, and scale your operations efficiently.'),
          createLexicalHeading('Automation Services', 'h2'),
          createLexicalList([
            'Custom workflow design and implementation',
            'Database integration and synchronization',
            'API orchestration and data transformation',
            'Real-time notifications and alerts',
            'Scheduled tasks and batch processing',
            'Error handling and monitoring setup',
            'Documentation and training materials',
            'Ongoing maintenance and optimization'
          ]),
          createLexicalHeading('Popular Automation Scenarios', 'h2'),
          createLexicalList([
            'Lead management and CRM synchronization',
            'Invoice processing and payment notifications',
            'Calendar scheduling and appointment booking',
            'Data backup and synchronization',
            'Social media posting and content management',
            'Email marketing automation',
            'Inventory management and reordering',
            'Customer support ticket routing'
          ]),
          createLexicalHeading('Why Choose n8n?', 'h2'),
          createLexicalParagraph('n8n provides the perfect balance of power and flexibility for business automation. Unlike cloud-only solutions, n8n can be self-hosted for complete control over your data and workflows. With 400+ integrations and a visual workflow editor, it\'s the ideal platform for growing businesses.'),
          createLexicalParagraph('Our team has extensive experience with n8n implementations, including complex multi-tenant setups, database integrations, and custom node development. We ensure your workflows are robust, scalable, and maintainable.')
        ])
      } else if (service.slug === 'vapi-voice-ai-integration') {
        productContent = createLexicalContent([
          createLexicalParagraph('Enhance your business communications with advanced VAPI voice AI integration. Automate phone calls, create intelligent virtual assistants, and streamline customer interactions with natural language processing.'),
          createLexicalHeading('VAPI Integration Services', 'h2'),
          createLexicalList([
            'Custom voice AI assistant development',
            'Phone system integration and automation',
            'Natural language processing optimization',
            'Call routing and intelligent scheduling',
            'Voice-to-text transcription and analysis',
            'Multi-language support configuration',
            'Business system integration (CRM, calendar, etc.)',
            'Performance monitoring and analytics'
          ]),
          createLexicalHeading('Business Applications', 'h2'),
          createLexicalList([
            'Automated appointment scheduling and confirmations',
            'Customer service and support automation',
            'Lead qualification and initial screening',
            'Order taking and inventory inquiries',
            'Survey collection and feedback gathering',
            'Payment reminders and collection calls',
            'Emergency notifications and alerts',
            'Multi-language customer support'
          ]),
          createLexicalHeading('Technical Implementation', 'h2'),
          createLexicalParagraph('Our VAPI implementation includes comprehensive testing, optimization for your specific use cases, and integration with your existing business systems. We provide detailed analytics and monitoring to ensure optimal performance and continuous improvement.'),
          createLexicalParagraph('The system includes fallback mechanisms, error handling, and human handoff capabilities to ensure a professional experience for your customers at all times.')
        ])
  } else {
        // Default product content
        productContent = createLexicalContent([
          createLexicalParagraph(service.description),
          createLexicalHeading('Service Details', 'h2'),
          createLexicalParagraph('Comprehensive service designed to meet your specific business needs with expert implementation and ongoing support.'),
          createLexicalHeading('What You Get', 'h2'),
          createLexicalList([
            'Detailed analysis and planning',
            'Expert implementation and setup',
            'Comprehensive documentation',
            'Training and knowledge transfer',
            'Ongoing support and optimization'
          ])
        ])
      }

      // Find appropriate category for the service
      const categoryMapping = {
        'ai-consulting': aiConsultingCategory?.id,
        'automation-solutions': automationCategory?.id,
        'platform-implementation': spacesCategory?.id,
        'ai-integration': aiIntegrationCategory?.id
      }

      const categoryId = categoryMapping[service.category as keyof typeof categoryMapping] || aiConsultingCategory?.id

      product = await payload.create({
      collection: 'products',
      data: {
          title: service.title,
          slug: service.slug,
          description: service.description,
          sku: `${service.slug.toUpperCase().replace(/-/g, '_')}_001`,
        productType: 'consultation',
        status: 'active',
          tenant: tenant.id,
          categories: [categoryId],
        pricing: {
            basePrice: service.price,
            salePrice: null,
          currency: 'USD'
        },
        inventory: {
          trackQuantity: false,
          allowBackorder: true
        },
        serviceDetails: {
            duration: service.duration || 240,
            location: 'flexible',
          maxParticipants: 1,
          bookingRequired: true
        },
          content: productContent,
        meta: {
            title: `${service.title} - ${tenantTemplate.name}`,
            description: service.description,
            keywords: `${service.title.toLowerCase()}, ${tenantTemplate.industry.toLowerCase()}, consulting`
        }
      }
    })
  } else {
      payload.logger.info(`— ${service.title} product already exists, skipping...`)
    }
  }

  payload.logger.info(`— Checking for posts...`)

  // Check if posts exist before creating
  let post1Doc = await checkExists('posts', { slug: { equals: 'announcing-spaces-platform' } })
  let post2Doc = await checkExists('posts', { slug: { equals: 'spaces-at-protocol-integration' } })
  let post3Doc = await checkExists('posts', { slug: { equals: 'spaces-commerce-integration' } })
  let post4Doc = await checkExists('posts', { slug: { equals: 'vapi-scheduling-automation' } })

  if (!post1Doc) {
    payload.logger.info(`— Creating post 1...`)
    post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
  })
  } else {
    payload.logger.info(`— Post 1 already exists, skipping...`)
  }

  if (!post2Doc) {
    payload.logger.info(`— Creating post 2...`)
    post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
  })
  } else {
    payload.logger.info(`— Post 2 already exists, skipping...`)
  }

  if (!post3Doc) {
    payload.logger.info(`— Creating post 3...`)
    post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post3({ heroImage: image3Doc, blockImage: image1Doc, author: demoAuthor }),
  })
  } else {
    payload.logger.info(`— Post 3 already exists, skipping...`)
  }

  if (!post4Doc) {
    payload.logger.info(`— Creating post 4...`)
    post4Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post4({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
  })
  } else {
    payload.logger.info(`— Post 4 already exists, skipping...`)
  }

  // Update posts with related posts if they don't already have them
  if (post1Doc && (!post1Doc.relatedPosts || post1Doc.relatedPosts.length === 0)) {
  await payload.update({
    id: post1Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post2Doc.id, post3Doc.id, post4Doc.id],
    },
  })
  }

  if (post2Doc && (!post2Doc.relatedPosts || post2Doc.relatedPosts.length === 0)) {
  await payload.update({
    id: post2Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post3Doc.id, post4Doc.id],
    },
  })
  }

  if (post3Doc && (!post3Doc.relatedPosts || post3Doc.relatedPosts.length === 0)) {
  await payload.update({
    id: post3Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post2Doc.id, post4Doc.id],
    },
  })
  }

  if (post4Doc && (!post4Doc.relatedPosts || post4Doc.relatedPosts.length === 0)) {
  await payload.update({
    id: post4Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post2Doc.id, post3Doc.id],
    },
  })
  }

  payload.logger.info(`— Checking for contact form...`)

  let contactForm = await checkExists('forms', { name: { equals: 'Contact Form' } })

  if (!contactForm) {
    payload.logger.info(`— Creating contact form...`)
    contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData,
  })
  } else {
    payload.logger.info(`— Contact form already exists, skipping...`)
  }

  payload.logger.info(`— Checking for pages...`)

  // Check if pages exist
  let homePageDoc = await checkExists('pages', { slug: { equals: 'home' } })
  let aboutPageDoc = await checkExists('pages', { slug: { equals: 'about' } })
  let privacyPageDoc = await checkExists('pages', { slug: { equals: 'privacy-policy' } })
  let termsPageDoc = await checkExists('pages', { slug: { equals: 'terms-of-service' } })
  const servicesPageDoc = await checkExists('pages', { slug: { equals: 'services' } })
  const consultationPageDoc = await checkExists('pages', { slug: { equals: 'consultation-booking' } })
  let contactPageDoc = await checkExists('pages', { slug: { equals: 'contact' } })

  if (!homePageDoc) {
    payload.logger.info(`— Creating home page...`)
    homePageDoc = await payload.create({
      collection: 'pages',
      depth: 0,
      data: home,
      })
  } else {
    payload.logger.info(`— Home page already exists, skipping...`)
  }

  if (!aboutPageDoc) {
    payload.logger.info(`— Creating about page...`)
    aboutPageDoc = await payload.create({
      collection: 'pages',
      depth: 0,
      data: about({ heroImage: imageHomeDoc, metaImage: imageHomeDoc }) as any,
    })
  } else {
    payload.logger.info(`— About page already exists, skipping...`)
  }

  if (!privacyPageDoc) {
    payload.logger.info(`— Creating privacy policy page...`)
    privacyPageDoc = await payload.create({
      collection: 'pages',
      depth: 0,
      data: privacyPolicy({ heroImage: imageHomeDoc, metaImage: imageHomeDoc }) as any,
    })
  } else {
    payload.logger.info(`— Privacy policy page already exists, skipping...`)
  }

  if (!termsPageDoc) {
    payload.logger.info(`— Creating terms of service page...`)
    termsPageDoc = await payload.create({
      collection: 'pages',
      depth: 0,
      data: termsOfService({ heroImage: imageHomeDoc, metaImage: imageHomeDoc }) as any,
    })
  } else {
    payload.logger.info(`— Terms of service page already exists, skipping...`)
  }

  // Services and consultation pages temporarily disabled due to richText structure issues
  // if (!servicesPageDoc) {
  //   payload.logger.info(`— Creating services page...`)
  //   servicesPageDoc = await payload.create({
  //     collection: 'pages',
  //     depth: 0,
  //     data: services({ heroImage: imageHomeDoc, metaImage: imageHomeDoc }),
  //   })
  // } else {
  //   payload.logger.info(`— Services page already exists, skipping...`)
  // }

  // if (!consultationPageDoc) {
  //   payload.logger.info(`— Creating consultation booking page...`)
  //   consultationPageDoc = await payload.create({
  //     collection: 'pages',
  //     depth: 0,
  //     data: consultationBooking({ heroImage: imageHomeDoc, metaImage: imageHomeDoc }),
  //   })
  // } else {
  //   payload.logger.info(`— Consultation booking page already exists, skipping...`)
  // }

  if (!contactPageDoc) {
    payload.logger.info(`— Creating contact page...`)
    contactPageDoc = await payload.create({
      collection: 'pages',
      depth: 0,
      data: contactPageData({ contactForm }),
    })
  } else {
    payload.logger.info(`— Contact page already exists, skipping...`)
  }

  payload.logger.info(`— Checking for globals...`)

  // Check if globals need updating
  const headerGlobal = await payload.findGlobal({ slug: 'header' })
  const footerGlobal = await payload.findGlobal({ slug: 'footer' })

  if (!headerGlobal.navItems || headerGlobal.navItems.length === 0) {
    payload.logger.info(`— Updating header global...`)
    await payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'reference',
              label: 'About',
              reference: {
                relationTo: 'pages',
                value: aboutPageDoc?.id || null,
              },
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Products',
              url: '/products',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Posts',
              url: '/posts',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPageDoc?.id || null,
              },
            },
          },
        ],
      },
    })
  } else {
    payload.logger.info(`— Header global already configured, skipping...`)
  }

  if (!footerGlobal.navItems || footerGlobal.navItems.length === 0) {
    payload.logger.info(`— Updating footer global...`)
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          {
            link: {
              type: 'reference',
              label: 'Privacy Policy',
              reference: {
                relationTo: 'pages',
                value: privacyPageDoc?.id || null,
              },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Terms of Service',
              reference: {
                relationTo: 'pages',
                value: termsPageDoc?.id || null,
              },
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Admin',
              url: '/admin',
            },
          },
        ],
      },
    })
  } else {
    payload.logger.info(`— Footer global already configured, skipping...`)
  }

  payload.logger.info('Seeded database successfully! 🎉')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
