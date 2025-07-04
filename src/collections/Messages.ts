import type { CollectionConfig } from 'payload'

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['content', 'messageType', 'space', 'author', 'createdAt'],
    group: 'Collaboration',
    description: 'Real-time messaging system with threading, reactions, and rich content support',
  },
  access: {
    // Tenant-scoped access control
    create: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      // TODO: Implement proper tenant-based access using TenantMemberships
      if (req.user?.globalRole === 'platform_admin') return true
      return false
    },
    read: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      // TODO: Implement proper tenant-based filtering using TenantMemberships
      if (req.user?.globalRole === 'platform_admin') return true
      return false
    },
    update: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      // TODO: Implement proper tenant-based access using TenantMemberships
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
    // AT Protocol Core Fields
    {
      name: 'atProtocol',
      type: 'group',
      label: 'AT Protocol Data',
      admin: {
        description: 'BlueSky/AT Protocol compatibility fields',
      },
      fields: [
        {
          name: 'type',
          type: 'text',
          required: true,
          defaultValue: 'co.kendev.spaces.message',
          admin: {
            description: 'AT Protocol record type (lexicon)',
            readOnly: true,
          },
        },
        {
          name: 'did',
          type: 'text',
          admin: {
            description: 'Decentralized identifier for this message',
            readOnly: true,
          },
        },
        {
          name: 'uri',
          type: 'text',
          admin: {
            description: 'AT Protocol URI for this record',
            readOnly: true,
          },
        },
        {
          name: 'cid',
          type: 'text',
          admin: {
            description: 'Content identifier hash',
            readOnly: true,
          },
        },
      ],
    },

    // Core Message Fields
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who created this message',
      },
      hooks: {
        beforeValidate: [
          ({ req, data }) => {
            // Auto-set author from current user
            if (data && !data.author && req.user?.id) {
              return req.user.id
            }
            return data?.author
          },
        ],
      },
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      admin: {
        description: 'Space this message belongs to',
      },
    },
    {
      name: 'channel',
      type: 'text',
      admin: {
        description: 'Channel within the space (optional)',
      },
    },

    // Legacy tenant field for backward compatibility
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: {
        description: 'Legacy tenant field - derived from space.tenant',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ req, data }) => {
            // Note: Tenant assignment should be done manually through the admin interface
            // since the User type doesn't include tenant information directly
            return data?.tenant
          },
        ],
      },
    },

    // Message Content
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The actual message content',
      },
    },
    {
      name: 'messageType',
      type: 'select',
      required: true,
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Image', value: 'image' },
        { label: 'File', value: 'file' },
        { label: 'Widget', value: 'widget' },
        { label: 'System', value: 'system' },
        { label: 'Announcement', value: 'announcement' },
        { label: 'AI Agent', value: 'ai_agent' },
        { label: 'Web Chat', value: 'web_chat' },
        { label: 'Voice AI', value: 'voice_ai' },
        { label: 'Customer Inquiry', value: 'customer_inquiry' },
        { label: 'Live Handoff', value: 'live_handoff' },
        { label: 'System Alert', value: 'system_alert' },
      ],
      defaultValue: 'text',
      admin: {
        description: 'Type of message for proper handling and display',
      },
    },

    // Widget Content Support
    {
      name: 'widgetData',
      type: 'group',
      label: 'Widget Content',
      admin: {
        description: 'Interactive widget content embedded in the message',
        condition: (data) => data.messageType === 'widget',
      },
      fields: [
        {
          name: 'widgetType',
          type: 'select',
          required: true,
          options: [
            { label: 'Address Verification', value: 'address_verification' },
            { label: 'Web Capture', value: 'web_capture' },
            { label: 'Order Form', value: 'order_form' },
            { label: 'Approval Workflow', value: 'approval_workflow' },
            { label: 'Poll/Survey', value: 'poll' },
            { label: 'Calendar Booking', value: 'calendar_booking' },
            { label: 'Payment Request', value: 'payment_request' },
            { label: 'Document Signature', value: 'document_signature' },
            { label: 'Custom Widget', value: 'custom' },
          ],
          admin: {
            description: 'Type of widget to display',
          },
        },
        {
          name: 'widgetTitle',
          type: 'text',
          admin: {
            description: 'Display title for the widget',
          },
        },
        {
          name: 'widgetData',
          type: 'json',
          admin: {
            description: 'Widget-specific data and configuration',
          },
        },
        {
          name: 'isInteractive',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Whether users can interact with this widget',
          },
        },
        {
          name: 'allowedRoles',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'All Members', value: 'all' },
            { label: 'Admins Only', value: 'admin' },
            { label: 'Space Owners', value: 'owner' },
            { label: 'Moderators', value: 'moderator' },
          ],
          defaultValue: ['all'],
          admin: {
            description: 'Who can interact with this widget',
          },
        },
        {
          name: 'expiresAt',
          type: 'date',
          admin: {
            description: 'When this widget expires (optional)',
          },
        },
        {
          name: 'responses',
          type: 'json',
          admin: {
            description: 'User responses/interactions with the widget',
            readOnly: true,
          },
        },
      ],
    },

    // Threading Support
    {
      name: 'parentMessage',
      type: 'relationship',
      relationTo: 'messages',
      admin: {
        description: 'Parent message if this is a reply',
      },
    },
    {
      name: 'threadReplies',
      type: 'relationship',
      relationTo: 'messages',
      hasMany: true,
      admin: {
        description: 'Replies to this message',
        readOnly: true,
      },
    },

    // Rich Content Support
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Attached files, images, or media',
      },
    },
    {
      name: 'mentions',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Users mentioned in this message',
      },
    },
    {
      name: 'reactions',
      type: 'array',
      fields: [
        {
          name: 'emoji',
          type: 'text',
          required: true,
          admin: {
            description: 'Emoji used for reaction',
          },
        },
        {
          name: 'users',
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
          admin: {
            description: 'Users who reacted with this emoji',
          },
        },
        {
          name: 'count',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of reactions',
            readOnly: true,
          },
        },
      ],
      admin: {
        description: 'Emoji reactions to this message',
      },
    },

    // Moderation
    {
      name: 'isEdited',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this message has been edited',
        readOnly: true,
      },
    },
    {
      name: 'editHistory',
      type: 'array',
      fields: [
        {
          name: 'content',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Previous content',
          },
        },
        {
          name: 'editedAt',
          type: 'date',
          required: true,
          admin: {
            description: 'When the edit was made',
          },
        },
        {
          name: 'editedBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Who made the edit',
          },
        },
      ],
      admin: {
        description: 'History of edits to this message',
        condition: (data) => data.isEdited === true,
      },
    },
    {
      name: 'isDeleted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this message has been deleted',
      },
    },
    {
      name: 'deletedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Who deleted this message',
        condition: (data) => data.isDeleted === true,
      },
    },
    {
      name: 'deletedAt',
      type: 'date',
      admin: {
        description: 'When this message was deleted',
        condition: (data) => data.isDeleted === true,
      },
    },

    // Timestamp
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'Message timestamp',
      },
    },

    // Progressive JSON Metadata Structure
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Progressive JSON structure for extensible metadata',
      },
    },

    // Business Context
    {
      name: 'businessContext',
      type: 'group',
      label: 'Business Context',
      fields: [
        {
          name: 'department',
          type: 'select',
          options: [
            { label: 'Sales', value: 'sales' },
            { label: 'Support', value: 'support' },
            { label: 'Operations', value: 'operations' },
            { label: 'Marketing', value: 'marketing' },
            { label: 'General', value: 'general' },
          ],
        },
        {
          name: 'workflow',
          type: 'select',
          options: [
            { label: 'Lead Generation', value: 'lead' },
            { label: 'Quote Process', value: 'quote' },
            { label: 'Sale Transaction', value: 'sale' },
            { label: 'Fulfillment', value: 'fulfillment' },
            { label: 'Support Request', value: 'support' },
            { label: 'Knowledge Sharing', value: 'knowledge' },
          ],
        },
        {
          name: 'customerJourney',
          type: 'select',
          options: [
            { label: 'Discovery', value: 'discovery' },
            { label: 'Consideration', value: 'consideration' },
            { label: 'Purchase Intent', value: 'purchase_intent' },
            { label: 'Active Customer', value: 'active_customer' },
            { label: 'Support Request', value: 'support_request' },
            { label: 'Retention Risk', value: 'retention_risk' },
          ],
          admin: {
            description: 'Customer journey stage for this interaction',
          },
        },
        {
          name: 'integrationSource',
          type: 'select',
          options: [
            { label: 'Web Chat Widget', value: 'web_widget' },
            { label: 'VAPI Voice Call', value: 'vapi_call' },
            { label: 'Internal Chat', value: 'internal_chat' },
            { label: 'Email Integration', value: 'email' },
            { label: 'API Webhook', value: 'api_webhook' },
          ],
          admin: {
            description: 'Source system for this message',
          },
        },
        {
          name: 'priority',
          type: 'select',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Normal', value: 'normal' },
            { label: 'High', value: 'high' },
            { label: 'Urgent', value: 'urgent' },
          ],
          defaultValue: 'normal',
        },
      ],
    },

    // Knowledge Repository Features
    {
      name: 'knowledge',
      type: 'group',
      label: 'Knowledge Repository',
      fields: [
        {
          name: 'searchable',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Include in knowledge search results',
          },
        },
        {
          name: 'category',
          type: 'select',
          options: [
            { label: 'FAQ', value: 'faq' },
            { label: 'Procedure', value: 'procedure' },
            { label: 'Customer Data', value: 'customer_data' },
            { label: 'Product Info', value: 'product_info' },
            { label: 'Best Practice', value: 'best_practice' },
            { label: 'Training', value: 'training' },
          ],
        },
        {
          name: 'tags',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'Tags for categorization and search',
          },
        },
        {
          name: 'embedding',
          type: 'json',
          admin: {
            description: 'AI vector embedding for semantic search',
            readOnly: true,
          },
        },
      ],
    },

    // Threading Support
    {
      name: 'thread',
      type: 'relationship',
      relationTo: 'messages',
      admin: {
        description: 'Parent message for threading',
      },
    },
    {
      name: 'threadRoot',
      type: 'relationship',
      relationTo: 'messages',
      admin: {
        description: 'Root message of the thread',
      },
    },

    // Rich Content Support (AT Protocol Embeds)
    {
      name: 'embeds',
      type: 'group',
      label: 'Rich Content',
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          admin: {
            description: 'Images, videos, files attached to this message',
          },
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            {
              name: 'url',
              type: 'text',
              required: true,
            },
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
          ],
        },
      ],
    },

    // Federation Settings
    {
      name: 'federation',
      type: 'group',
      label: 'Federation Settings',
      fields: [
        {
          name: 'discoverable',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Make this message discoverable on federated networks',
          },
        },
        {
          name: 'crossPostTo',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'BlueSky', value: 'app.bsky.feed.post' },
            { label: 'Mastodon', value: 'mastodon' },
            { label: 'ActivityPub', value: 'activitypub' },
          ],
          admin: {
            description: 'Platforms to cross-post this message to',
          },
        },
        {
          name: 'audience',
          type: 'select',
          options: [
            { label: 'Private', value: 'private' },
            { label: 'Business Network', value: 'business_network' },
            { label: 'Public', value: 'public' },
          ],
          defaultValue: 'private',
        },
      ],
    },

    // AI Agent Context (From Constitution)
    {
      name: 'aiAgent',
      type: 'group',
      label: 'AI Agent Context',
      fields: [
        {
          name: 'ceoAnalysis',
          type: 'json',
          admin: {
            description: 'Analysis from tenant Business AI agent',
            readOnly: true,
          },
        },
        {
          name: 'suggestedActions',
          type: 'textarea',
          admin: {
            description: 'AI-suggested follow-up actions',
            readOnly: true,
          },
        },
        {
          name: 'pipedreamIndex',
          type: 'number',
          admin: {
            description: 'Pipedream Index value for this message',
            readOnly: true,
          },
        },
      ],
    },

    // Language Support (AT Protocol)
    {
      name: 'langs',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
      ],
      defaultValue: ['en'],
    },
  ],

  hooks: {
    beforeValidate: [
      // Auto-generate AT Protocol fields
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          // Generate DID for the message author if not exists
          if (data && !data.atProtocol?.did && req.user) {
            // Format: did:plc:user-id (tenant assignment should be done manually)
            data.atProtocol = {
              ...data.atProtocol,
              did: `did:plc:${req.user.id}`,
              type: 'co.kendev.spaces.message',
            }
          }
        }
        return data
      },
    ],
    afterChange: [
      // Generate AT Protocol URI and CID
      async ({ doc, operation }) => {
        if (operation === 'create') {
          // Generate URI and CID based on doc ID
          const uri = `at://${doc.atProtocol?.did}/co.kendev.spaces.message/${doc.id}`
          const cid = `bafyrei${doc.id.toString().padStart(32, '0')}` // Simplified CID

          // Update the document with generated values
          // Note: This would be done with a direct database update in production
          console.log(`Generated AT Protocol URI: ${uri}, CID: ${cid}`)
        }
      },
    ],
  },

  timestamps: true,
}
