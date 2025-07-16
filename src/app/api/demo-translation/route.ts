import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BusinessAgentFactory } from '@/services/BusinessAgent'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') || '1'
    const language = searchParams.get('language') || 'es'
    const text = searchParams.get('text') || 'Welcome to our amazing cactus collection!'

    const payload = await getPayload({ config: configPromise })

    // Get tenant for business context
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Create BusinessAgent for this tenant
    const businessAgent = BusinessAgentFactory.createForTenant(tenant)

    // Demonstrate different translation capabilities
    const translations = {
      // Simple text translation
      simpleText: await businessAgent.translateWithBusinessContext(text, language),

      // Product data translation
      sampleProduct: await businessAgent.translateSiteContent({
        title: 'Golden Barrel Cactus',
        description: 'Beautiful desert plant perfect for beginners',
        care: {
          watering: 'Monthly watering',
          light: 'Full sun exposure',
          difficulty: 'Easy care'
        }
      }, language),

      // Page content translation
      samplePage: await businessAgent.autoTranslatePage({
        title: 'Welcome to Hays Cactus Farm',
        content: {
          intro: 'Discover our amazing collection of desert plants',
          features: [
            'Expert growing advice',
            'Healthy plants guaranteed',
            'Fast shipping nationwide'
          ]
        },
        meta: {
          title: 'Hays Cactus Farm - Premium Desert Plants',
          description: 'Quality cacti and succulents for your home and garden'
        }
      }, language)
    }

    return NextResponse.json({
      success: true,
      demo: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          businessType: tenant.businessType
        },
        sourceLanguage: 'en',
        targetLanguage: language,
        translations
      },
      message: `BusinessAgent translation demo for ${tenant.businessType} business`
    })

  } catch (error) {
    console.error('[Translation Demo API] Error:', error)
    return NextResponse.json(
      {
        error: 'Translation demo failed',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, targetLanguage, content } = body

    if (!tenantId || !targetLanguage || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, targetLanguage, content' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const businessAgent = BusinessAgentFactory.createForTenant(tenant)

    // Translate the provided content
    const translatedContent = await businessAgent.translateSiteContent(content, targetLanguage)

    return NextResponse.json({
      success: true,
      original: content,
      translated: translatedContent,
      sourceLanguage: 'en',
      targetLanguage,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        businessType: tenant.businessType
      }
    })

  } catch (error) {
    console.error('[Translation Demo API] POST Error:', error)
    return NextResponse.json(
      {
        error: 'Translation failed',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
