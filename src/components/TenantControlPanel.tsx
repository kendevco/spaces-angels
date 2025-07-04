'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Tenant {
  id: string
  name: string
  slug: string
  businessType: string
  status: 'active' | 'provisioning' | 'error' | 'archived'
  domain: string
  previewUrl: string
  createdAt: string
  lastConfigured?: string
}

interface TenantSummary {
  active: number
  provisioning: number
  error: number
}

const TenantControlPanel: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [summary, setSummary] = useState<TenantSummary>({ active: 0, provisioning: 0, error: 0 })
  const [loading, setLoading] = useState(false)
  const [showProvisionForm, setShowProvisionForm] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)

  // Form state for new tenant
  const [newTenant, setNewTenant] = useState({
    name: '',
    slug: '',
    businessType: '',
    theme: 'default'
  })

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tenant-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      })

      const data = await response.json()
      if (data.success) {
        setTenants(data.tenants)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to load tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const provisionTenant = async () => {
    if (!newTenant.name || !newTenant.slug || !newTenant.businessType) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tenant-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'provision',
          tenantData: newTenant
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(`Tenant "${newTenant.name}" provisioned successfully!\nAccess at: ${data.tenant.previewUrl}`)
        setShowProvisionForm(false)
        setNewTenant({ name: '', slug: '', businessType: '', theme: 'default' })
        loadTenants()
      } else {
        alert(`Provisioning failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Provisioning failed:', error)
      alert('Provisioning failed: Network error')
    } finally {
      setLoading(false)
    }
  }

  const deprovisionTenant = async (tenantId: string, tenantName: string) => {
    if (!confirm(`Are you sure you want to deprovision "${tenantName}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tenant-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deprovision',
          tenantId
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(`Tenant "${tenantName}" deprovisioned successfully`)
        loadTenants()
      } else {
        alert(`Deprovisioning failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Deprovisioning failed:', error)
      alert('Deprovisioning failed: Network error')
    } finally {
      setLoading(false)
    }
  }

  const previewTenant = async (tenantId: string) => {
    try {
      const response = await fetch('/api/tenant-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview',
          tenantId
        })
      })

      const data = await response.json()
      if (data.success) {
        window.open(data.previewUrl, '_blank')
      } else {
        alert(`Preview failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Preview failed:', error)
      alert('Preview failed: Network error')
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setNewTenant({
      ...newTenant,
      name,
      slug: generateSlug(name)
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'provisioning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenant Control Panel</h1>
          <p className="text-gray-600 mt-1">Business Launch Pad - Configuration & Management</p>
        </div>
        <Button
          onClick={() => setShowProvisionForm(!showProvisionForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showProvisionForm ? 'Cancel' : 'Provision New Tenant'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{summary.active}</div>
            <p className="text-sm text-gray-600">Active Tenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">{summary.provisioning}</div>
            <p className="text-sm text-gray-600">Provisioning</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">{summary.error}</div>
            <p className="text-sm text-gray-600">Errors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{tenants.length}</div>
            <p className="text-sm text-gray-600">Total Tenants</p>
          </CardContent>
        </Card>
      </div>

      {/* Provision Form */}
      {showProvisionForm && (
        <Card>
          <CardHeader>
            <CardTitle>Provision New Tenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={newTenant.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={newTenant.slug}
                  onChange={(e) => setNewTenant({...newTenant, slug: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="auto-generated"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be accessible at: {newTenant.slug}.spaces.kendev.co
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type *
                </label>
                <select
                  value={newTenant.businessType}
                  onChange={(e) => setNewTenant({...newTenant, businessType: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select business type"
                >
                  <option value="">Select business type</option>
                  <option value="pizza">Pizza Shop</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="retail">Retail Store</option>
                  <option value="service">Service Business</option>
                  <option value="content_creator">Content Creator</option>
                  <option value="cactus_farm">Cactus Farm</option>
                  <option value="general">General Business</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={newTenant.theme}
                  onChange={(e) => setNewTenant({...newTenant, theme: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select theme"
                >
                  <option value="default">Default</option>
                  <option value="business">Business</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={provisionTenant}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Provisioning...' : 'Provision Tenant'}
              </Button>
              <Button
                onClick={() => setShowProvisionForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tenants List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Active Tenants</CardTitle>
            <Button onClick={loadTenants} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading tenants...</div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tenants found. Create your first tenant above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Domain</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Created</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{tenant.name}</td>
                      <td className="p-3">
                        <a
                          href={tenant.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {tenant.domain}
                        </a>
                      </td>
                      <td className="p-3 capitalize">{tenant.businessType}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => previewTenant(tenant.id)}
                            size="sm"
                            variant="outline"
                          >
                            Preview
                          </Button>
                          <Button
                            onClick={() => deprovisionTenant(tenant.id, tenant.name)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            Deprovision
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TenantControlPanel
