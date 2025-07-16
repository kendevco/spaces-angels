import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    depth: 2,
    verify: {
      generateEmailHTML: ({ token }: any) => `
        <div>
          <p>Verify your email address by clicking the link below:</p>
          <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/verify?token=${token}">Verify Email</a>
        </div>
      `,
      generateEmailSubject: () => 'Verify your email address',
    },
    forgotPassword: {
      generateEmailHTML: ({ token }: any) => `
        <div>
          <p>Reset your password by clicking the link below:</p>
          <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${token}">Reset Password</a>
        </div>
      `,
      generateEmailSubject: () => 'Reset your password',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'roles'],
  },
  fields: [
    // Identity & Profile
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
    },
    
    // Multi-tenant Support
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      defaultValue: 1, // Default tenant
    },
    
    // Role & Permissions System
    {
      name: 'roles',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Contributor', value: 'contributor' },
        { label: 'Subscriber', value: 'subscriber' },
        { label: 'Guardian Angel', value: 'guardian_angel' },
      ],
      hasMany: true,
      defaultValue: ['subscriber'],
    },
    
    // Angel OS Karma System
    {
      name: 'karma',
      type: 'group',
      fields: [
        {
          name: 'score',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'contributionTypes',
          type: 'select',
          options: [
            { label: 'Content Creation', value: 'content_creation' },
            { label: 'Community Support', value: 'community_support' },
            { label: 'Technical Contribution', value: 'technical_contribution' },
            { label: 'Mentorship', value: 'mentorship' },
            { label: 'Justice Advocacy', value: 'justice_advocacy' },
            { label: 'Guardian Angel Activity', value: 'guardian_angel' },
          ],
          hasMany: true,
        },
        {
          name: 'recognitions',
          type: 'array',
          fields: [
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Helpful Response', value: 'helpful_response' },
                { label: 'Quality Content', value: 'quality_content' },
                { label: 'Community Leadership', value: 'community_leadership' },
                { label: 'Technical Excellence', value: 'technical_excellence' },
                { label: 'Guardian Angel Action', value: 'guardian_angel_action' },
              ],
              required: true,
            },
            {
              name: 'points',
              type: 'number',
              required: true,
            },
            {
              name: 'reason',
              type: 'textarea',
            },
            {
              name: 'awardedBy',
              type: 'relationship',
              relationTo: 'users',
            },
            {
              name: 'awardedAt',
              type: 'date',
              defaultValue: () => new Date().toISOString(),
            },
          ],
        },
        {
          name: 'guardianAngelStatus',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'User has achieved Guardian Angel status through karma contributions',
          },
        },
      ],
    },
    
    // Multi-Tenant Memberships
    {
      name: 'tenantMemberships',
      type: 'array',
      fields: [
        {
          name: 'tenant',
          type: 'relationship',
          relationTo: 'tenants',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Owner', value: 'owner' },
            { label: 'Admin', value: 'admin' },
            { label: 'Editor', value: 'editor' },
            { label: 'Contributor', value: 'contributor' },
            { label: 'Viewer', value: 'viewer' },
          ],
          required: true,
        },
        {
          name: 'joinedAt',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
        },
        {
          name: 'permissions',
          type: 'select',
          options: [
            { label: 'Manage Content', value: 'manage_content' },
            { label: 'Manage Products', value: 'manage_products' },
            { label: 'Manage Forms', value: 'manage_forms' },
            { label: 'View Analytics', value: 'view_analytics' },
            { label: 'Manage Users', value: 'manage_users' },
            { label: 'Manage Settings', value: 'manage_settings' },
          ],
          hasMany: true,
        },
      ],
    },
    
    // Preferences & Settings
    {
      name: 'preferences',
      type: 'group',
      fields: [
        {
          name: 'notifications',
          type: 'group',
          fields: [
            {
              name: 'email',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'inApp',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'guardianAngelAlerts',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Receive alerts when Guardian Angel assistance is needed',
              },
            },
          ],
        },
        {
          name: 'privacy',
          type: 'group',
          fields: [
            {
              name: 'profileVisibility',
              type: 'select',
              options: [
                { label: 'Public', value: 'public' },
                { label: 'Members Only', value: 'members' },
                { label: 'Private', value: 'private' },
              ],
              defaultValue: 'members',
            },
            {
              name: 'karmaScoreVisible',
              type: 'checkbox',
              defaultValue: true,
            },
          ],
        },
      ],
    },
    
    // Timestamps
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data }: { data: any }) => {
        // Auto-assign Guardian Angel status based on karma score
        if (data.karma?.score >= 1000) {
          data.karma.guardianAngelStatus = true
          if (!data.roles.includes('guardian_angel')) {
            data.roles.push('guardian_angel')
          }
        }
        return data
      },
    ],
  },
} 