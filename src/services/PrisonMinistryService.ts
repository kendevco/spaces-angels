import { getPayload } from 'payload'
import configPromise from '../payload.config'
import type { Payload } from 'payload'

export class PrisonMinistryService {
  private payload: Payload | null = null

  async initialize() {
    this.payload = await getPayload({ config: configPromise })
  }

  private ensurePayload(): Payload {
    if (!this.payload) throw new Error('Not initialized')
    return this.payload
  }

  async allocateDonation(amount: number, recipientType: 'literal' | 'digital' | 'economic' | 'spiritual') {
    const payload = this.ensurePayload()
    const donation = await payload.create({
      collection: 'donations',
      data: {
        amount,
        recipientType,
        status: 'pending',
        ministryNote: 'Serving the least of these - Matthew 25:36'
      }
    })
    console.log(`[PrisonMinistry] Allocated $${amount} to ${recipientType} prisoners`)
    return donation
  }

  async processReentrySupport(tenantId: string, revenueShare: number) {
    const payload = this.ensurePayload()
    const tenant = await payload.findByID({ collection: 'tenants', id: tenantId })
    const monthlyRevenue = tenant.revenueTracking?.monthlyRevenue ?? 0
    const shareAmount = monthlyRevenue * (revenueShare / 100)
    return this.allocateDonation(shareAmount, 'literal')
  }
}

export const prisonMinistry = new PrisonMinistryService() 