import type { CollectionConfig } from 'payload'

export const ChannelManagement: CollectionConfig = {
  slug: 'channelManagement',
  labels: {
    singular: 'Channel',
    plural: 'Channel Management',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Customer Engagement',
    description: 'Virtual channel configuration and routing rules',
    defaultColumns: ['name', 'space', 'channelType', 'status'],
  },
  access: {
    create: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      if (req.user?.globalRole === 'platform_admin') return true
      return false
    },
    read: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      // For now, allow platform admins to read all channels
      // TODO: Implement proper tenant-based filtering using TenantMemberships
      if (req.user?.globalRole === 'platform_admin') return true
      return false
    },
    update: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      if (req.user?.globalRole === 'platform_admin') return true
      return false
    },
    delete: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      if (req.user?.globalRole === 'platform_admin') return true
      return false
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
    },
    {
      name: 'channelType',
      type: 'select',
      required: true,
      options: [
        { label: 'Customer Support', value: 'customer_support' },
        { label: 'Sales Inquiries', value: 'sales_inquiries' },
        { label: 'Technical Support', value: 'technical_support' },
        { label: 'Billing Questions', value: 'billing' },
        { label: 'General Chat', value: 'general' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Maintenance', value: 'maintenance' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'assignedAgents',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
    },
    {
      name: 'autoAssignment',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'n8nWorkflowId',
      type: 'text',
    },
    {
      name: 'vapiEnabled',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'webChatEnabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
  timestamps: true,
}
