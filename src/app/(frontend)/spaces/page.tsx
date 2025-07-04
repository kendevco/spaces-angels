import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SpacesInterface } from '@/components/spaces/SpacesInterface'
import type { Space, User as PayloadUser } from '@/payload-types'

export const metadata = {
  title: 'Spaces - Discord-Style Collaboration',
  description: 'Real-time collaboration spaces with AI-powered business intelligence',
}

export default async function SpacesPage() {
  const payload = await getPayload({ config })
  const cookieStore = await cookies()
  let currentUser: PayloadUser | null = null

  try {
    const token = cookieStore.get('payload-token')?.value
    if (token) {
      const headers = new Headers()
      headers.set('Authorization', `Bearer ${token}`)
      const { user } = await payload.auth({ headers })
      currentUser = user as PayloadUser
    }
  } catch (error) {
    console.error('Failed to authenticate user:', error)
  }

  if (!currentUser) {
    redirect('/admin/login?redirect=/spaces')
  }

  const tenantId = typeof currentUser.tenant === 'object' ? currentUser.tenant?.id : currentUser.tenant

  if (!tenantId || typeof tenantId !== 'number' || isNaN(tenantId) || tenantId <= 0) {
    console.error('Invalid tenant ID:', tenantId, 'User:', currentUser.id)
    redirect('/admin/login?error=invalid-tenant')
  }

  let spaces: Space[] = []

  try {
    const spacesQuery = await payload.find({
      collection: 'spaces',
      where: { tenant: { equals: tenantId } },
      depth: 2,
      limit: 50,
      sort: 'name',
    })
    spaces = spacesQuery.docs as Space[]
  } catch (error) {
    console.error('Failed to load spaces:', error)
  }

  return <SpacesInterface initialSpaces={spaces} currentUser={currentUser} />
}
