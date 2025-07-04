import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { defaultLexical } from '../fields/defaultLexical'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Product',
    plural: 'Products',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Commerce',
    defaultColumns: ['title', 'price', 'status', 'tenant', 'updatedAt'],
    pagination: {
      defaultLimit: 10,
      limits: [10, 20, 50],
    },
    listSearchableFields: ['title', 'description', 'sku'],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Note: Tenant assignment should be done manually through the admin interface
        // since the User type doesn't include tenant information directly
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Short product description for listings and previews',
      },
    },
    {
      name: 'sku',
      type: 'text',
      label: 'SKU',
      unique: true,
      admin: {
        description: 'Stock Keeping Unit - unique product identifier',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ data, operation, value }) => {
            if (operation === 'create' || !value) {
              return data?.title
                ?.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
            }
            return value
          },
        ],
      },
    },
    // Image Gallery
    {
      name: 'gallery',
      type: 'array',
      label: 'Product Images',
      minRows: 1,
      maxRows: 10,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
      admin: {
        description: 'Upload product images. First image will be used as the main product image.',
      },
    },
    // Pricing
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'basePrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            step: 0.01,
            description: 'Base price in dollars',
          },
        },
        {
          name: 'salePrice',
          type: 'number',
          min: 0,
          admin: {
            step: 0.01,
            description: 'Sale price (if on sale)',
          },
        },
        {
          name: 'compareAtPrice',
          type: 'number',
          min: 0,
          admin: {
            step: 0.01,
            description: 'Compare at price (MSRP)',
          },
        },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'USD',
          options: [
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
            { label: 'GBP', value: 'GBP' },
            { label: 'CAD', value: 'CAD' },
          ],
        },
      ],
    },
    // Inventory
    {
      name: 'inventory',
      type: 'group',
      fields: [
        {
          name: 'trackQuantity',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Track inventory for this product',
          },
        },
        {
          name: 'quantity',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            condition: (data) => data.inventory?.trackQuantity,
            description: 'Current stock quantity',
          },
        },
        {
          name: 'lowStockThreshold',
          type: 'number',
          defaultValue: 5,
          min: 0,
          admin: {
            condition: (data) => data.inventory?.trackQuantity,
            description: 'Alert when stock falls below this number',
          },
        },
        {
          name: 'allowBackorder',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            condition: (data) => data.inventory?.trackQuantity,
            description: 'Allow purchases when out of stock',
          },
        },
      ],
    },
    // Product Details
    {
      name: 'details',
      type: 'group',
      fields: [
        {
          name: 'weight',
          type: 'number',
          admin: {
            step: 0.01,
            description: 'Weight in pounds',
          },
        },
        {
          name: 'dimensions',
          type: 'group',
          fields: [
            {
              name: 'length',
              type: 'number',
              admin: { step: 0.01 },
            },
            {
              name: 'width',
              type: 'number',
              admin: { step: 0.01 },
            },
            {
              name: 'height',
              type: 'number',
              admin: { step: 0.01 },
            },
            {
              name: 'unit',
              type: 'select',
              defaultValue: 'in',
              options: [
                { label: 'Inches', value: 'in' },
                { label: 'Centimeters', value: 'cm' },
                { label: 'Feet', value: 'ft' },
                { label: 'Meters', value: 'm' },
              ],
            },
          ],
        },
      ],
    },
    // Commission & Revenue Sharing
    {
      name: 'commission',
      type: 'group',
      label: 'Commission Settings',
      fields: [
        {
          name: 'useCustomRate',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Override tenant default commission rate for this product',
          },
        },
        {
          name: 'customCommissionRate',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            step: 0.1,
            description: 'Custom commission rate (%) for this product',
            condition: (data) => data.commission?.useCustomRate,
          },
        },
        {
          name: 'sourceMultipliers',
          type: 'group',
          label: 'Source-Based Rate Multipliers',
          fields: [
            {
              name: 'systemGenerated',
              type: 'number',
              defaultValue: 1.0,
              min: 0,
              max: 5,
              admin: {
                step: 0.1,
                description: 'Multiplier for system-generated appointments (1.0 = base rate)',
              },
            },
            {
              name: 'pickupJob',
              type: 'number',
              defaultValue: 0.5,
              min: 0,
              max: 5,
              admin: {
                step: 0.1,
                description: 'Multiplier for pickup/self-acquired jobs (0.5 = half rate)',
              },
            },
            {
              name: 'referralSource',
              type: 'number',
              defaultValue: 1.5,
              min: 0,
              max: 5,
              admin: {
                step: 0.1,
                description: 'Multiplier for referral-sourced business (1.5 = 150% rate)',
              },
            },
          ],
        },
      ],
    },
    // Categories and Organization
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Product categories for organization and filtering',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Tags for search and filtering',
      },
    },
    // Product Type (specific to your use cases)
    {
      name: 'productType',
      type: 'select',
      required: true,
      defaultValue: 'service',
      options: [
        { label: 'AI-Generated Print on Demand', value: 'ai_print_demand' },
        { label: 'One-on-One Consultation', value: 'consultation_solo' },
        { label: 'Group Session/Event', value: 'group_event' },
        { label: 'LiveKit Streaming Event', value: 'livekit_stream' },
        { label: 'Digital Download', value: 'digital_download' },
        { label: 'Physical Product', value: 'physical' },
        { label: 'Subscription Service', value: 'subscription' },
        { label: 'Course/Training Program', value: 'course_training' },
        { label: 'Business Service', value: 'business_service' },
        { label: 'Automation/Integration', value: 'automation' },
      ],
      admin: {
        description: 'Product type determines default commission rates and revenue sharing',
      },
    },
    // Commission Rate Templates by Product Type
    {
      name: 'commissionTemplate',
      type: 'group',
      label: 'Commission Rate Template',
      admin: {
        description: 'Default commission rates based on product type - can be overridden in Commission Settings above',
      },
      fields: [
        {
          name: 'defaultRate',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Calculated based on product type',
          },
        },
        {
          name: 'rationale',
          type: 'textarea',
          admin: {
            readOnly: true,
            description: 'Why this rate makes sense for this product type',
          },
        },
      ],
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (!data) return data

            const productType = data.productType
            let defaultRate = 3.0 // fallback
            let rationale = 'Standard platform rate'

            switch (productType) {
              case 'ai_print_demand':
                defaultRate = 15.0
                rationale = 'High margin digital product with AI generation costs, platform handles all fulfillment'
                break
              case 'consultation_solo':
                defaultRate = 8.0
                rationale = 'Personal expertise service, platform provides booking and payment processing'
                break
              case 'group_event':
                defaultRate = 12.0
                rationale = 'Scalable group delivery, platform provides infrastructure and participant management'
                break
              case 'livekit_stream':
                defaultRate = 20.0
                rationale = 'High-value streaming infrastructure with YouTube-scale capabilities via LiveKit'
                break
              case 'digital_download':
                defaultRate = 10.0
                rationale = 'Digital delivery with storage, bandwidth, and security infrastructure'
                break
              case 'physical':
                defaultRate = 5.0
                rationale = 'Lower margin physical goods, platform handles payment and order management'
                break
              case 'subscription':
                defaultRate = 6.0
                rationale = 'Recurring revenue model, platform provides subscription management'
                break
              case 'course_training':
                defaultRate = 15.0
                rationale = 'High-value educational content with platform-provided learning management system'
                break
              case 'business_service':
                defaultRate = 4.0
                rationale = 'Professional B2B services, platform provides business tools and client management'
                break
              case 'automation':
                defaultRate = 7.0
                rationale = 'Technical integration services with ongoing platform support'
                break
            }

            return {
              ...data,
              commissionTemplate: {
                defaultRate,
                rationale
              }
            }
          }
        ]
      }
    },
    // Digital Product Fields
    {
      name: 'digitalAssets',
      type: 'array',
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
      admin: {
        condition: (data) => ['digital', 'course'].includes(data.productType),
        description: 'Digital files delivered after purchase',
      },
    },
    // Service/Experience Fields
    {
      name: 'serviceDetails',
      type: 'group',
      fields: [
        {
          name: 'duration',
          type: 'number',
          admin: {
            description: 'Duration in minutes',
          },
        },
        {
          name: 'location',
          type: 'select',
          options: [
            { label: 'On-site', value: 'onsite' },
            { label: 'Remote/Virtual', value: 'remote' },
            { label: 'Customer Location', value: 'customer' },
            { label: 'Flexible', value: 'flexible' },
          ],
        },
        {
          name: 'maxParticipants',
          type: 'number',
          min: 1,
          admin: {
            description: 'Maximum number of participants',
          },
        },
        {
          name: 'bookingRequired',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
      admin: {
        condition: (data) => ['service', 'experience', 'consultation', 'course'].includes(data.productType),
      },
    },
    // Rich Content Description
    {
      name: 'content',
      type: 'richText',
      editor: defaultLexical,
      localized: true,
      admin: {
        description: 'Detailed product description with rich formatting',
      },
    },
    // SEO
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'keywords',
          type: 'text',
          localized: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    // Status and Visibility
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
        { label: 'Out of Stock', value: 'out_of_stock' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this product on homepage',
      },
    },
    // Multi-tenant Support
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Which tenant this product belongs to',
      },
    },
    // Related Products
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      maxDepth: 1,
      admin: {
        description: 'Related or recommended products',
      },
    },
    // Shipping (for physical products)
    {
      name: 'shipping',
      type: 'group',
      fields: [
        {
          name: 'requiresShipping',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'freeShipping',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            condition: (data) => data.shipping?.requiresShipping,
          },
        },
        {
          name: 'shippingClass',
          type: 'select',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Heavy/Oversized', value: 'heavy' },
            { label: 'Fragile', value: 'fragile' },
            { label: 'Hazardous', value: 'hazardous' },
            { label: 'Cold Chain', value: 'cold' },
          ],
          admin: {
            condition: (data) => data.shipping?.requiresShipping,
          },
        },
      ],
      admin: {
        condition: (data) => data.productType === 'physical',
      },
    },
    // Variants (for future expansion)
    {
      name: 'hasVariants',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Enable for products with size, color, or other variations',
      },
    },
    // Product Variations - COMPREHENSIVE IMPLEMENTATION
    // Temporarily disabled until database migration is ready
    /*
    {
      name: 'variations',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Variation name (e.g., "Large Pepperoni Pizza", "Red T-Shirt Size M")',
          },
        },
        // ... rest of variations fields would be here
      ],
      admin: {
        condition: (data) => data.hasVariants === true,
        description: 'Product variations with different sizes, colors, prices, and attributes',
      },
    },
    */
  ],
  timestamps: true,
}
