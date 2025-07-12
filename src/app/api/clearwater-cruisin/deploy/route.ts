import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '../../../../payload.config'
import { queueWorker } from '../../../../services/QueueWorkerService'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    console.log('[Clearwater Cruisin] Starting flagship tenant deployment...')

    // Create Clearwater Cruisin Tenant
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Clearwater Cruisin',
        subdomain: 'clearwater',
        domain: 'clearwatercruisin.com',
        status: 'active',
        tenantType: 'flagship',
        businessProfile: {
          businessType: 'service_business',
          industry: 'home_services',
          description: 'Premium junk removal and home services with AI-powered Guardian Angels',
          targetMarket: 'residential_commercial',
          serviceArea: 'Clearwater, FL and surrounding areas'
        },
        commerceSettings: {
          enableServices: true,
          enableBookings: true,
          enableQuotes: true,
          enablePayments: true,
          enableInventory: true,
          paymentProcessing: {
            stripeEnabled: true,
            acceptCash: true,
            acceptCheck: true
          }
        },
        integrations: {
          route4me: {
            enabled: true,
            apiKey: process.env.ROUTE4ME_API_KEY || 'demo_key'
          },
          vapi: {
            enabled: true,
            assistantId: process.env.VAPI_ASSISTANT_ID || 'demo_assistant'
          },
          twilio: {
            enabled: true,
            phoneNumber: '+1-727-CRUISIN'
          }
        },
        revenueTracking: {
          monthlyRevenue: 0,
          currentEffectiveRate: 15.0, // Start at 15% platform fee
          totalRevenue: 0,
          commissionsPaid: 0,
          lastRevenueCalculation: new Date().toISOString()
        }
      }
    })

    console.log(`[Clearwater Cruisin] Created tenant: ${tenant.id}`)

    // Create Guardian Angel Marina (Junk Removal Specialist)
    const marina = await payload.create({
      collection: 'business-agents',
      data: {
        tenant: tenant.id,
        name: 'Marina',
        role: 'Guardian Angel - Junk Removal Specialist',
        personality: {
          voiceStyle: 'friendly_professional',
          communicationStyle: 'warm_efficient',
          brandVoice: 'Clearwater Cruisin - We make your junk disappear like magic!',
          greeting: "Hi there! I'm Marina, your Guardian Angel for junk removal. Let's get that clutter cleared out so you can enjoy your beautiful Clearwater space!"
        },
        capabilities: [
          'junk_removal_quotes',
          'scheduling_appointments',
          'route_optimization',
          'customer_communication',
          'photo_inventory_analysis'
        ],
        knowledgeBase: {
          services: [
            'Residential junk removal',
            'Commercial cleanouts',
            'Construction debris removal',
            'Appliance removal',
            'Furniture removal',
            'Yard waste removal'
          ],
          pricing: {
            baseRate: 150,
            volumeDiscounts: true,
            sameDay: 'available',
            weekendService: 'available'
          },
          serviceArea: 'Clearwater, St. Petersburg, Tampa Bay area'
        },
        isActive: true,
        status: 'active'
      }
    })

    console.log(`[Clearwater Cruisin] Created Guardian Angel Marina: ${marina.id}`)

    // Create Guardian Angel Pacific (Handyman Services)
    const pacific = await payload.create({
      collection: 'business-agents',
      data: {
        tenant: tenant.id,
        name: 'Pacific',
        role: 'Guardian Angel - Handyman Services',
        personality: {
          voiceStyle: 'skilled_reliable',
          communicationStyle: 'detail_oriented',
          brandVoice: 'Clearwater Cruisin - Quality repairs that last like the ocean tides!',
          greeting: "Hello! I'm Pacific, your Guardian Angel for handyman services. Whether it's a small repair or a big project, I'll help you get it done right the first time."
        },
        capabilities: [
          'handyman_quotes',
          'repair_scheduling',
          'material_estimation',
          'project_management',
          'quality_assurance'
        ],
        knowledgeBase: {
          services: [
            'Plumbing repairs',
            'Electrical work',
            'Drywall repair',
            'Painting',
            'Flooring installation',
            'Cabinet installation',
            'Deck repairs',
            'Fence installation'
          ],
          pricing: {
            hourlyRate: 85,
            minimumCharge: 150,
            emergencyService: 'available',
            warranty: '1 year on all work'
          },
          serviceArea: 'Clearwater, St. Petersburg, Tampa Bay area'
        },
        isActive: true,
        status: 'active'
      }
    })

    console.log(`[Clearwater Cruisin] Created Guardian Angel Pacific: ${pacific.id}`)

    // Create initial service offerings
    const services = [
      {
        name: 'Junk Removal - Residential',
        description: 'Complete residential junk removal service',
        category: 'junk_removal',
        price: 150,
        assignedAngel: marina.id,
        availability: 'same_day'
      },
      {
        name: 'Junk Removal - Commercial',
        description: 'Commercial cleanout and junk removal',
        category: 'junk_removal',
        price: 250,
        assignedAngel: marina.id,
        availability: 'scheduled'
      },
      {
        name: 'Handyman Services - Basic',
        description: 'Basic handyman repairs and maintenance',
        category: 'handyman',
        price: 85,
        assignedAngel: pacific.id,
        availability: 'scheduled'
      },
      {
        name: 'Handyman Services - Project',
        description: 'Larger handyman projects and installations',
        category: 'handyman',
        price: 150,
        assignedAngel: pacific.id,
        availability: 'scheduled'
      }
    ]

    const createdServices = []
    for (const service of services) {
      const created = await payload.create({
        collection: 'products',
        data: {
          tenant: tenant.id,
          title: service.name,
          description: service.description,
          productType: 'service',
          price: service.price,
          category: service.category,
          isActive: true,
          meta: {
            assignedAngel: service.assignedAngel,
            availability: service.availability
          }
        }
      })
      createdServices.push(created)
    }

    console.log(`[Clearwater Cruisin] Created ${createdServices.length} service offerings`)

    // Initialize queue worker if not already running
    if (!queueWorker.payload) {
      await queueWorker.initialize()
    }

    // Add initial jobs to demonstrate the system
    const demoJobs = [
      {
        jobType: 'clearwater_job',
        data: {
          jobType: 'junk_removal',
          customerData: {
            name: 'Demo Customer',
            phone: '727-555-0123',
            address: '123 Beach Ave, Clearwater, FL'
          },
          serviceDetails: {
            description: 'Living room furniture removal',
            estimatedVolume: 'truck_load',
            preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        },
        priority: 1
      },
      {
        jobType: 'revenue_processing',
        data: {
          tenantId: tenant.id,
          processType: 'monthly_calculation'
        },
        priority: 0
      }
    ]

    const jobIds = []
    for (const job of demoJobs) {
      const jobId = await queueWorker.addJob(job.jobType, job.data, job.priority)
      jobIds.push(jobId)
    }

    console.log(`[Clearwater Cruisin] Added ${jobIds.length} demo jobs to queue`)

    // Start the queue worker
    await queueWorker.startWorker()

    return NextResponse.json({
      success: true,
      message: 'Clearwater Cruisin flagship tenant deployed successfully!',
      deployment: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          domain: tenant.domain
        },
        guardianAngels: [
          {
            id: marina.id,
            name: 'Marina',
            specialty: 'Junk Removal',
            status: 'active'
          },
          {
            id: pacific.id,
            name: 'Pacific',
            specialty: 'Handyman Services',
            status: 'active'
          }
        ],
        services: createdServices.map(s => ({
          id: s.id,
          name: s.title,
          price: s.price
        })),
        queueSystem: {
          initialized: true,
          workerRunning: true,
          demoJobsAdded: jobIds.length
        }
      },
      nextSteps: [
        'Visit clearwater.spaces.kendev.co to see the deployment',
        'Test Guardian Angel interactions',
        'Monitor queue processing at /api/queue/worker?action=stats',
        'Begin processing Raj\'s 20 use cases for revenue generation'
      ],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Clearwater Cruisin] Deployment failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deployment error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 