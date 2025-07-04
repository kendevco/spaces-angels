import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'domain', 'businessType', 'status'],
    group: 'Platform Management',
    description: 'Multi-tenant organizations and their configurations',
  },
  access: {
    // Only super admins can manage tenants
    read: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      // TODO: Implement proper tenant-based access using TenantMemberships
      if (req.user?.globalRole === 'platform_admin') return true
      return false
    },
    create: ({ req }) => req.user?.globalRole === 'super_admin',
    update: ({ req }) => req.user?.globalRole === 'super_admin',
    delete: ({ req }) => req.user?.globalRole === 'super_admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'The display name for this tenant (e.g., "Hays Cactus Farm")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g., "hays-cactus-farm")',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === 'string') {
              return value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
            }
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Custom domain (optional) - e.g., "hayscactus.com"',
      },
    },
    {
      name: 'subdomain',
      type: 'text',
      admin: {
        description: 'Subdomain for multi-tenancy - e.g., "hays" for hays.kendev.co',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.slug) {
              return data.slug
            }
            return value
          },
        ],
      },
    },
    {
      name: 'businessType',
      type: 'select',
      required: true,
      options: [
        { label: 'Dumpster Rental', value: 'dumpster-rental' },
        { label: 'Bedbug Treatment', value: 'bedbug-treatment' },
        { label: 'Hair Salon', value: 'salon' },
        { label: 'Cactus Farm', value: 'cactus-farm' },
        { label: 'General Retail', value: 'retail' },
        { label: 'Service Business', value: 'service' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'other',
    },
    {
      name: 'revenueSharing',
      type: 'group',
      label: 'Revenue Sharing & Partnership',
      fields: [
        {
          name: 'setupFee',
          type: 'number',
          label: 'Setup Fee ($)',
          admin: {
            description: 'One-time setup fee charged for onboarding',
          },
          defaultValue: 299,
        },
        {
          name: 'revenueShareRate',
          type: 'number',
          label: 'Revenue Share Rate (%)',
          min: 0,
          max: 15,
          admin: {
            description: 'Percentage of sales revenue shared with Spaces Commerce',
            step: 0.1,
          },
          defaultValue: 3.0,
        },
        {
          name: 'partnershipTier',
          type: 'select',
          label: 'Partnership Tier',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Preferred Partner', value: 'preferred' },
            { label: 'Strategic Partner', value: 'strategic' },
            { label: 'Enterprise Partner', value: 'enterprise' },
            { label: 'Referral Source', value: 'referral_source' },
          ],
          defaultValue: 'standard',
          admin: {
            description: 'Partnership level affecting rates and terms',
          },
        },
        {
          name: 'negotiatedTerms',
          type: 'textarea',
          label: 'Negotiated Terms',
          admin: {
            description: 'Custom partnership terms and agreements',
          },
        },
        {
          name: 'minimumMonthlyRevenue',
          type: 'number',
          label: 'Minimum Monthly Revenue ($)',
          admin: {
            description: 'Minimum monthly revenue for rate adjustments',
          },
        },
        {
          name: 'volumeDiscounts',
          type: 'array',
          label: 'Volume Discounts',
          fields: [
            {
              name: 'threshold',
              type: 'number',
              label: 'Monthly Revenue Threshold ($)',
              required: true,
            },
            {
              name: 'discountRate',
              type: 'number',
              label: 'Discounted Rate (%)',
              min: 0,
              max: 15,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'referralProgram',
      type: 'group',
      label: 'Referral Program',
      fields: [
        {
          name: 'referredBy',
          type: 'relationship',
          relationTo: 'users',
          label: 'Referred By',
          admin: {
            description: 'Solution provider or partner who referred this tenant',
          },
        },
        {
          name: 'referralCode',
          type: 'text',
          label: 'Referral Code',
          admin: {
            description: 'Unique code used for this referral',
          },
        },
        {
          name: 'referralCommissionRate',
          type: 'number',
          label: 'Referral Commission Rate (%)',
          min: 0,
          max: 50,
          admin: {
            description: 'Percentage of revenue share paid to referrer',
            step: 0.1,
          },
          defaultValue: 30.0,
        },
        {
          name: 'referralTerms',
          type: 'select',
          label: 'Referral Terms',
          options: [
            { label: 'Lifetime Commission', value: 'lifetime' },
            { label: '12 Months', value: '12_months' },
            { label: '24 Months', value: '24_months' },
            { label: 'First Year Only', value: 'first_year' },
          ],
          defaultValue: 'lifetime',
        },
        {
          name: 'referralStatus',
          type: 'select',
          label: 'Referral Status',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Expired', value: 'expired' },
            { label: 'Suspended', value: 'suspended' },
          ],
          defaultValue: 'active',
          admin: {
            condition: (data) => data.referredBy,
          },
        },
      ],
    },
    {
      name: 'revenueTracking',
      type: 'group',
      label: 'Revenue Tracking',
      admin: {
        description: 'Automated revenue tracking and commission calculations',
      },
      fields: [
        {
          name: 'monthlyRevenue',
          type: 'number',
          label: 'Current Monthly Revenue ($)',
          admin: {
            readOnly: true,
            description: 'Auto-calculated from orders',
          },
        },
        {
          name: 'totalRevenue',
          type: 'number',
          label: 'Total Revenue ($)',
          admin: {
            readOnly: true,
            description: 'Total revenue generated since launch',
          },
        },
        {
          name: 'lastRevenueCalculation',
          type: 'date',
          label: 'Last Calculation',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'commissionsPaid',
          type: 'number',
          label: 'Total Commissions Paid ($)',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'currentEffectiveRate',
          type: 'number',
          label: 'Current Effective Rate (%)',
          admin: {
            readOnly: true,
            description: 'Current rate after volume discounts',
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Setup', value: 'setup' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'setup',
    },
    {
      name: 'configuration',
      type: 'group',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          admin: {
            description: 'Primary brand color (hex code)',
          },
          defaultValue: '#3b82f6',
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Tenant logo for branding',
          },
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Custom favicon',
          },
        },
        {
          name: 'contactEmail',
          type: 'email',
          admin: {
            description: 'Primary contact email for this tenant',
          },
        },
        {
          name: 'contactPhone',
          type: 'text',
          admin: {
            description: 'Primary contact phone number',
          },
        },
        {
          name: 'address',
          type: 'group',
          fields: [
            {
              name: 'street',
              type: 'text',
            },
            {
              name: 'city',
              type: 'text',
            },
            {
              name: 'state',
              type: 'text',
            },
            {
              name: 'zipCode',
              type: 'text',
            },
            {
              name: 'country',
              type: 'text',
              defaultValue: 'US',
            },
          ],
        },
      ],
    },
    {
      name: 'features',
      type: 'group',
      fields: [
        {
          name: 'ecommerce',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable e-commerce functionality',
          },
        },
        {
          name: 'spaces',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable Spaces communication platform',
          },
        },
        {
          name: 'crm',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable CRM functionality',
          },
        },
        {
          name: 'vapi',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable VAPI voice integration',
          },
        },
        {
          name: 'n8n',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable N8N workflow automation',
          },
        },
        {
          name: 'memberPortal',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable member engagement portal',
          },
        },
      ],
    },
    {
      name: 'limits',
      type: 'group',
      fields: [
        {
          name: 'maxUsers',
          type: 'number',
          defaultValue: 10,
          admin: {
            description: 'Maximum number of users for this tenant',
          },
        },
        {
          name: 'maxProducts',
          type: 'number',
          defaultValue: 100,
          admin: {
            description: 'Maximum number of products',
          },
        },
        {
          name: 'maxStorage',
          type: 'number',
          defaultValue: 1000, // MB
          admin: {
            description: 'Maximum storage in MB',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        // Log tenant changes for auditing
        console.log(`Tenant ${operation}: ${doc.name} (${doc.slug})`)

        // TODO: Trigger tenant setup workflows when status changes to 'active'
        if (operation === 'create' || (operation === 'update' && doc.status === 'active')) {
          // Future: Trigger automated site setup based on businessType
        }
      },
    ],
  },
}
