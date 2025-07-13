import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Generic Tenant Provisioning API
 * 
 * Purpose: Provisions a complete tenant with Guardian Angels and initial setup
 * Why this exists: Payload CMS handles CRUD, but complex multi-step provisioning 
 * with business logic requires custom orchestration
 * 
 * POST /api/tenants/provision
 * {
 *   "name": "Business Name",
 *   "businessType": "service|retail|creator|etc",
 *   "domain": "optional-custom-domain.com",
 *   "subdomain": "business-slug",
 *   "guardianAngels": [
 *     {
 *       "name": "Primary Angel Name",
 *       "agentType": "guardian|business|etc",
 *       "personality": { "communicationStyle": "nurturing" }
 *     }
 *   ]
 * }
 */

interface ProvisionRequest {
  name: string
  businessType: 'service' | 'retail' | 'dumpster-rental' | 'salon' | 'cactus-farm' | 'bedbug-treatment' | 'other'
  domain?: string
  subdomain?: string
  description?: string
  guardianAngels?: Array<{
    name: string
    agentType: 'guardian' | 'business' | 'customer_service' | 'sales'
    spiritType?: 'primary' | 'service' | 'support'
    personality?: {
      communicationStyle?: 'nurturing' | 'professional' | 'friendly' | 'direct'
      brandVoice?: string
      coreValues?: string
    }
  }>
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body: ProvisionRequest = await request.json()

    // Validate required fields
    if (!body.name || !body.businessType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, businessType' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const slug = body.subdomain || body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    console.log(`[Tenant Provision] Creating tenant: ${body.name}`)

    // Step 1: Create the tenant
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: body.name,
        slug: slug,
        subdomain: body.subdomain || slug,
        domain: body.domain,
        status: 'active',
        businessType: body.businessType,
        jsonData: {
          description: body.description,
          provisionedAt: new Date().toISOString(),
          provisioningSource: 'api'
        }
      }
    })

    console.log(`[Tenant Provision] Created tenant: ${tenant.id}`)

    // TODO: Fix BusinessAgent humanPartner requirement, then re-enable
    // Step 2: Provision Guardian Angels  
    const createdAngels: any[] = []
    /* Temporarily disabled until BusinessAgent schema is fixed
    const angelConfigs = body.guardianAngels || getDefaultAngelsForBusinessType(body.businessType)

    for (const angelConfig of angelConfigs) {
      try {
        const angel = await payload.create({
          collection: 'business-agents',
          data: {
            tenant: tenant.id,
            name: angelConfig.name,
            spiritType: angelConfig.spiritType || 'primary',
            agentType: angelConfig.agentType,
            personality: angelConfig.personality || {},
            ops: {
              isActive: true,
            }
          }
        })

        createdAngels.push(angel)
        console.log(`[Tenant Provision] Created Guardian Angel: ${angel.name}`)
      } catch (error) {
        console.error(`[Tenant Provision] Failed to create angel ${angelConfig.name}:`, error)
        // Continue with other angels even if one fails
      }
    }
    */
    console.log(`[Tenant Provision] Business Agent creation temporarily disabled`)

    // Step 3: Create default space if needed
    let defaultSpace = null
    try {
      defaultSpace = await payload.create({
        collection: 'spaces',
        data: {
          tenant: tenant.id,
          name: `${body.name} Main Space`,
          slug: 'main',
          businessIdentity: {
            type: 'business', // Use generic business type for all
            industry: 'general' // Add required industry field
          },
          visibility: 'private',
          memberApproval: 'automatic'
        }
      })
      console.log(`[Tenant Provision] Created default space: ${defaultSpace.id}`)
    } catch (error) {
      console.error(`[Tenant Provision] Failed to create default space:`, error)
    }

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        subdomain: tenant.subdomain
      },
      guardianAngels: [], // Empty for now
      defaultSpace: defaultSpace ? {
        id: defaultSpace.id,
        name: defaultSpace.name,
        slug: defaultSpace.slug
      } : null,
      message: `Successfully provisioned ${body.name} (Guardian Angels temporarily disabled)`
    })

  } catch (error: any) {
    console.error('[Tenant Provision] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to provision tenant',
        details: error.message,
        success: false
      },
      { status: 500 }
    )
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/tenants/provision',
    purpose: 'Generic tenant provisioning with Guardian Angels',
    methods: ['POST'],
    status: 'active'
  })
}