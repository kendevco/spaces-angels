import React from 'react'
import TenantControlPanel from '@/components/TenantControlPanel'

export const metadata = {
  title: 'Tenant Control Panel | Spaces',
  description: 'Manage and provision tenant sites on the Spaces platform',
}

export default function TenantControlPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TenantControlPanel />
    </div>
  )
}
