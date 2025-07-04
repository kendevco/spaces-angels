import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Category',
    plural: 'Categories',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Commerce',
    defaultColumns: ['title', 'parent', 'productCount', 'isActive', 'displayOrder', 'tenant'],
    pagination: {
      defaultLimit: 20,
      limits: [10, 20, 50],
    },
    listSearchableFields: ['title', 'description'],
    description: 'Organize products into searchable categories with hierarchy support',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Note: Tenant assignment should be done manually through the admin interface
        // since the User type doesn't include tenant membership information directly
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        // Update product count after category changes
        try {
          const productCount = await req.payload.count({
            collection: 'products',
            where: {
              categories: { contains: doc.id },
              status: { equals: 'active' },
            },
          })

          // Update the category with the new product count
          // Use a separate request context to avoid recursion
          await req.payload.update({
            collection: 'categories',
            id: doc.id,
            data: { productCount: productCount.totalDocs },
            context: {
              disableHooks: true, // Disable hooks to prevent recursion
            },
          })
        } catch (error) {
          // Log error but don't fail the operation
          // This is especially important during seeding when categories are created before products
          req.payload.logger.warn(`Failed to update product count for category ${doc.id}: ${error instanceof Error ? error.message : String(error)}`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Category name displayed to customers',
      },
    },
    ...slugField(),
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Category description for SEO and listing pages',
        rows: 3,
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Category featured image for listings and banners',
      },
    },
    // Hierarchy Support
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        description: 'Parent category for nested organization (leave empty for top-level)',
        position: 'sidebar',
      },
      // Prevent circular references
      validate: (value: unknown, { data }: { data: Record<string, unknown> }) => {
        if (value && data?.id && value === data.id) {
          return 'A category cannot be its own parent'
        }
        return true
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order for category display (lower numbers appear first)',
        position: 'sidebar',
        step: 1,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Show this category on the frontend',
      },
    },
    {
      name: 'productCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Automatically calculated active product count',
      },
    },
    // Business-specific fields
    {
      name: 'businessType',
      type: 'select',
      options: [
        { label: 'Physical Products', value: 'physical' },
        { label: 'Digital Products', value: 'digital' },
        { label: 'Services', value: 'services' },
        { label: 'Experiences/Tours', value: 'experiences' },
        { label: 'Consultations', value: 'consultations' },
        { label: 'Mixed', value: 'mixed' },
      ],
      defaultValue: 'physical',
      admin: {
        description: 'Primary business type for products in this category',
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this category on homepage and navigation',
      },
    },
    // Rich Content Description
    {
      name: 'content',
      type: 'richText',
      localized: true,
      admin: {
        description: 'Detailed category content with rich formatting for category pages',
      },
    },
    // SEO fields
    {
      name: 'meta',
      type: 'group',
      label: 'SEO Settings',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: {
            description: 'Custom SEO title (defaults to category title if empty)',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          admin: {
            description: 'SEO meta description (recommended: 150-160 characters)',
            rows: 3,
          },
        },
        {
          name: 'keywords',
          type: 'text',
          localized: true,
          admin: {
            description: 'SEO keywords (comma-separated)',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Custom SEO image (defaults to category image)',
          },
        },
      ],
      admin: {
        description: 'Search engine optimization settings',
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
        description: 'Which tenant this category belongs to',
      },
    },
    // Category Settings
    {
      name: 'settings',
      type: 'group',
      label: 'Category Settings',
      fields: [
        {
          name: 'showProductCount',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show product count in category listings',
          },
        },
        {
          name: 'defaultSort',
          type: 'select',
          options: [
            { label: 'Featured First', value: 'featured' },
            { label: 'Newest First', value: 'newest' },
            { label: 'Price: Low to High', value: 'price_asc' },
            { label: 'Price: High to Low', value: 'price_desc' },
            { label: 'Name A-Z', value: 'name' },
          ],
          defaultValue: 'featured',
          admin: {
            description: 'Default sort order for products in this category',
          },
        },
        {
          name: 'productsPerPage',
          type: 'number',
          defaultValue: 12,
          min: 4,
          max: 48,
          admin: {
            description: 'Number of products to show per page (4-48)',
            step: 4,
          },
        },
      ],
      admin: {
        description: 'Category display and behavior settings',
      },
    },
  ],
  timestamps: true,
}
