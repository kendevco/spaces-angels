import { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const JobQueue: CollectionConfig = {
  slug: 'job-queue',
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'AI Generation', value: 'ai_generation' },
        { label: 'Photo Processing', value: 'photo_processing' },
        { label: 'Social Media', value: 'social_media' },
        { label: 'Revenue Analytics', value: 'revenue_analytics' },
        { label: 'Email Processing', value: 'email_processing' },
      ],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Higher numbers = higher priority',
      },
    },
    {
      name: 'payload',
      type: 'json',
      required: true,
      admin: {
        description: 'Job data and parameters',
      },
    },
    {
      name: 'result',
      type: 'json',
      admin: {
        description: 'Job result data',
      },
    },
    {
      name: 'error',
      type: 'textarea',
      admin: {
        description: 'Error message if job failed',
      },
    },
    {
      name: 'attempts',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'maxAttempts',
      type: 'number',
      defaultValue: 3,
    },
    {
      name: 'scheduledFor',
      type: 'date',
      admin: {
        description: 'When to process this job (leave empty for immediate)',
      },
    },
    {
      name: 'processedAt',
      type: 'date',
    },
    {
      name: 'completedAt',
      type: 'date',
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'update' && data.status === 'processing' && !data.processedAt) {
          data.processedAt = new Date()
        }
        if (operation === 'update' && data.status === 'completed' && !data.completedAt) {
          data.completedAt = new Date()
        }
      },
    ],
  },
} 