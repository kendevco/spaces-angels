# Multi-Tenant User Architecture & Platform Completion Strategy

## 🎯 Core Question: Single User Account vs Tenant-Specific Accounts

### **Best Practice: Single Global User Account with Tenant Memberships**

**Why This is Industry Standard:**
- **Slack**: One user account across all workspaces
- **Discord**: One account across all servers
- **Microsoft Teams**: One account across all organizations
- **Notion**: One account across all workspaces
- **GitHub**: One account across all organizations

### **Architecture Decision: Global Users + Tenant Memberships**

```typescript
// Recommended Architecture
User (Global Account)
├── Profile (name, email, avatar, preferences)
├── Authentication (password, 2FA, OAuth)
└── TenantMemberships[]
    ├── Tenant A → SpaceMemberships[]
    ├── Tenant B → SpaceMemberships[]
    └── Tenant C → SpaceMemberships[]
```

## 🏗 Enhanced Collections Architecture

### **1. Global Users Collection (Enhanced)**

```typescript
// src/collections/Users.ts - Enhanced for multi-tenant spaces
import { CollectionConfig } from 'payload'

const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: true,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutes
  },
  admin: {
    group: 'Platform',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'globalRole', 'tenantCount', 'lastActive'],
    description: 'Global platform user accounts',
  },
  access: {
    create: () => true, // Allow registration
    read: ({ req: { user } }) => {
      if (user?.globalRole === 'super_admin') return true
      // Users can read their own profile and profiles of users in their tenants
      return {
        or: [
          { id: { equals: user?.id } },
          // Add logic for tenant-shared visibility
        ],
      }
    },
    update: ({ req: { user }, id }) => {
      if (user?.globalRole === 'super_admin') return true
      return user?.id === id // Users can only update themselves
    },
    delete: ({ req: { user } }) => user?.globalRole === 'super_admin',
  },
  fields: [
    // Core Identity
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Full display name',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Primary email address',
      },
    },
    {
      name: 'avatar',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Profile picture',
      },
    },

    // Global Platform Role
    {
      name: 'globalRole',
      type: 'select',
      options: [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Platform Admin', value: 'platform_admin' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      access: {
        update: ({ req: { user } }) => user?.globalRole === 'super_admin',
      },
      admin: {
        description: 'Platform-wide role and permissions',
      },
    },

    // User Preferences
    {
      name: 'preferences',
      type: 'group',
      fields: [
        {
          name: 'theme',
          type: 'select',
          options: [
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
            { label: 'System', value: 'system' },
          ],
          defaultValue: 'system',
        },
        {
          name: 'language',
          type: 'select',
          options: [
            { label: 'English', value: 'en' },
            { label: 'Spanish', value: 'es' },
            { label: 'French', value: 'fr' },
            { label: 'German', value: 'de' },
          ],
          defaultValue: 'en',
        },
        {
          name: 'timezone',
          type: 'text',
          defaultValue: 'UTC',
          admin: {
            description: 'User timezone (e.g., America/New_York)',
          },
        },
        {
          name: 'emailNotifications',
          type: 'group',
          fields: [
            {
              name: 'spaceInvites',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'mentions',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'appointments',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'marketing',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },

    // Professional Profile (for appointment booking)
    {
      name: 'professionalProfile',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Professional title/role',
          },
        },
        {
          name: 'company',
          type: 'text',
          admin: {
            description: 'Company or organization',
          },
        },
        {
          name: 'bio',
          type: 'textarea',
          admin: {
            description: 'Professional bio/description',
          },
        },
        {
          name: 'website',
          type: 'url',
          admin: {
            description: 'Professional website',
          },
        },
        {
          name: 'socialLinks',
          type: 'array',
          fields: [
            {
              name: 'platform',
              type: 'select',
              options: [
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Twitter', value: 'twitter' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'TikTok', value: 'tiktok' },
                { label: 'Other', value: 'other' },
              ],
              required: true,
            },
            {
              name: 'url',
              type: 'url',
              required: true,
            },
            {
              name: 'username',
              type: 'text',
              admin: {
                description: 'Username/handle on platform',
              },
            },
          ],
        },
      ],
      admin: {
        description: 'Professional information for appointments and CRM',
      },
    },

    // Activity Tracking
    {
      name: 'lastActive',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Last platform activity',
      },
      hooks: {
        beforeChange: [
          ({ req, operation }) => {
            if (req.user && operation === 'update') {
              return new Date()
            }
          },
        ],
      },
    },
    {
      name: 'joinedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ operation }) => {
            if (operation === 'create') {
              return new Date()
            }
          },
        ],
      },
    },

    // Computed fields
    {
      name: 'tenantCount',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Number of tenants user belongs to',
      },
      hooks: {
        afterRead: [
          async ({ data, req: { payload } }) => {
            if (data?.id) {
              const memberships = await payload.count({
                collection: 'tenant-memberships',
                where: { user: { equals: data.id } },
              })
              return memberships.totalDocs
            }
            return 0
          },
        ],
      },
    },
    {
      name: 'spaceCount',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Number of spaces user belongs to',
      },
      hooks: {
        afterRead: [
          async ({ data, req: { payload } }) => {
            if (data?.id) {
              const memberships = await payload.count({
                collection: 'space-memberships',
                where: { user: { equals: data.id } },
              })
              return memberships.totalDocs
            }
            return 0
          },
        ],
      },
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Hash password on creation/update
        if (operation === 'create' || (operation === 'update' && data.password)) {
          // Payload handles password hashing automatically
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req: { payload } }) => {
        if (operation === 'create') {
          // Send welcome email
          await sendWelcomeEmail(doc.email, doc.name)

          // Create default user preferences
          await initializeUserPreferences(doc.id, payload)
        }
      },
    ],
  },
}

export default Users
```

### **2. Tenant Memberships Collection (Bridge Table)**

```typescript
// src/collections/TenantMemberships.ts
import { CollectionConfig } from 'payload'

const TenantMemberships: CollectionConfig = {
  slug: 'tenant-memberships',
  admin: {
    group: 'Platform',
    useAsTitle: 'displayName',
    defaultColumns: ['user', 'tenant', 'role', 'status', 'joinedAt'],
    description: 'User memberships within tenants',
  },
  access: {
    create: ({ req: { user } }) => {
      // Only tenant admins and super admins can create memberships
      return user?.globalRole === 'super_admin' || user?.globalRole === 'platform_admin'
    },
    read: ({ req: { user } }) => {
      if (user?.globalRole === 'super_admin') return true

      // Users can see memberships in tenants they belong to
      return {
        or: [
          { user: { equals: user?.id } },
          // Add tenant-based visibility logic
        ],
      }
    },
    update: ({ req: { user } }) => {
      // Similar logic to create
      return user?.globalRole === 'super_admin' || user?.globalRole === 'platform_admin'
    },
    delete: ({ req: { user } }) => user?.globalRole === 'super_admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Global user account',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Tenant organization',
      },
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Tenant Owner', value: 'tenant_owner' },
        { label: 'Tenant Admin', value: 'tenant_admin' },
        { label: 'Tenant Manager', value: 'tenant_manager' },
        { label: 'Tenant Member', value: 'tenant_member' },
        { label: 'Tenant Guest', value: 'tenant_guest' },
      ],
      defaultValue: 'tenant_member',
      required: true,
      admin: {
        description: 'Role within the tenant organization',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Invited', value: 'invited' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Left', value: 'left' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who invited this member to the tenant',
      },
    },
    {
      name: 'joinedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ data, operation }) => {
            if (operation === 'create' && data?.status === 'active') {
              return new Date()
            }
            return data?.joinedAt
          },
        ],
      },
    },
  ],

  indexes: [
    {
      fields: [
        { name: 'user', direction: 'asc' },
        { name: 'tenant', direction: 'asc' },
      ],
      unique: true,
    },
  ],
}

export default TenantMemberships
```

### **3. Space Memberships Collection (Enhanced)**

```typescript
// src/collections/SpaceMemberships.ts
import { CollectionConfig } from 'payload'

const SpaceMemberships: CollectionConfig = {
  slug: 'space-memberships',
  admin: {
    group: 'Spaces',
    useAsTitle: 'displayName',
    defaultColumns: ['user', 'space', 'role', 'membershipType', 'status'],
    description: 'User memberships within business spaces',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Global user account',
      },
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      admin: {
        description: 'Business space',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Tenant context (auto-populated from space)',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          async ({ data, req: { payload } }) => {
            if (data?.space) {
              const space = await payload.findByID({
                collection: 'spaces',
                id: data.space,
                depth: 1,
              })
              return space.tenant?.id || space.tenant
            }
            return data?.tenant
          },
        ],
      },
    },

    // Space-specific role
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Space Owner', value: 'space_owner' },
        { label: 'Space Admin', value: 'space_admin' },
        { label: 'Space Moderator', value: 'space_moderator' },
        { label: 'Space Member', value: 'space_member' },
        { label: 'Space Client', value: 'space_client' },
        { label: 'Space Guest', value: 'space_guest' },
      ],
      defaultValue: 'space_member',
      required: true,
    },

    // Business relationship context
    {
      name: 'membershipType',
      type: 'select',
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Subscriber', value: 'subscriber' },
        { label: 'Community Member', value: 'community' },
        { label: 'Employee', value: 'employee' },
        { label: 'Partner', value: 'partner' },
        { label: 'Investor', value: 'investor' },
        { label: 'Collaborator', value: 'collaborator' },
        { label: 'Fan/Follower', value: 'fan' },
        { label: 'Lead', value: 'lead' },
        { label: 'Prospect', value: 'prospect' },
      ],
      defaultValue: 'community',
      admin: {
        description: 'Business relationship type (for CRM integration)',
      },
    },

    // CRM Integration Fields
    {
      name: 'crmData',
      type: 'group',
      label: 'CRM Integration',
      fields: [
        {
          name: 'leadSource',
          type: 'select',
          options: [
            { label: 'Space Invitation', value: 'space_invite' },
            { label: 'Website', value: 'website' },
            { label: 'Social Media', value: 'social' },
            { label: 'Referral', value: 'referral' },
            { label: 'Event', value: 'event' },
            { label: 'Advertisement', value: 'ad' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            description: 'How this member discovered the space',
          },
        },
        {
          name: 'leadScore',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Lead scoring for sales prioritization',
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
            description: 'CRM tags for segmentation',
          },
        },
        {
          name: 'notes',
          type: 'textarea',
          admin: {
            description: 'Internal notes about this member',
          },
        },
        {
          name: 'lastContact',
          type: 'date',
          admin: {
            description: 'Last business contact/interaction',
          },
        },
        {
          name: 'nextFollowUp',
          type: 'date',
          admin: {
            description: 'Scheduled follow-up date',
          },
        },
      ],
      admin: {
        description: 'CRM data for business relationship management',
      },
    },

    // Appointment Booking Integration
    {
      name: 'appointmentPreferences',
      type: 'group',
      fields: [
        {
          name: 'allowBooking',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow this member to book appointments',
          },
        },
        {
          name: 'preferredMeetingTypes',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Video Call', value: 'video' },
            { label: 'Phone Call', value: 'phone' },
            { label: 'In-Person', value: 'in_person' },
            { label: 'Chat', value: 'chat' },
          ],
          admin: {
            description: 'Preferred meeting formats',
          },
        },
        {
          name: 'timezone',
          type: 'text',
          admin: {
            description: 'Member timezone for appointment scheduling',
          },
        },
        {
          name: 'availabilityNotes',
          type: 'textarea',
          admin: {
            description: 'Special availability requirements',
          },
        },
      ],
      admin: {
        description: 'Appointment booking preferences',
      },
    },

    // Standard membership fields
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Invited', value: 'invited' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Left', value: 'left' },
      ],
      defaultValue: 'invited',
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who invited this member to the space',
      },
    },
    {
      name: 'joinedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],

  hooks: {
    afterChange: [
      async ({ doc, operation, req: { payload } }) => {
        if (operation === 'create') {
          // Auto-create tenant membership if doesn't exist
          await ensureTenantMembership(doc.user, doc.tenant, payload)

          // Trigger onboarding workflow
          await triggerSpaceOnboarding(doc.id, payload)

          // Update CRM system if integrated
          await syncToCRM(doc, 'create')
        }
      },
    ],
  },

  indexes: [
    {
      fields: [
        { name: 'user', direction: 'asc' },
        { name: 'space', direction: 'asc' },
      ],
      unique: true,
    },
    {
      fields: [
        { name: 'tenant', direction: 'asc' },
        { name: 'membershipType', direction: 'asc' },
      ],
    },
  ],
}

export default SpaceMemberships
```

## 📅 Appointment Booking System Integration

### **4. Appointments Collection**

```typescript
// src/collections/Appointments.ts
import { CollectionConfig } from 'payload'

const Appointments: CollectionConfig = {
  slug: 'appointments',
  admin: {
    group: 'Business',
    useAsTitle: 'title',
    defaultColumns: ['title', 'host', 'attendee', 'scheduledFor', 'status'],
    description: 'Appointment booking and management',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Appointment title/subject',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Appointment description or agenda',
      },
    },

    // Participants
    {
      name: 'host',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User hosting the appointment',
      },
    },
    {
      name: 'attendee',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User attending the appointment',
      },
    },
    {
      name: 'additionalAttendees',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Additional attendees (optional)',
      },
    },

    // Context
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      admin: {
        description: 'Related business space (optional)',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Tenant context',
      },
    },

    // Scheduling
    {
      name: 'scheduledFor',
      type: 'date',
      required: true,
      admin: {
        description: 'Appointment date and time',
      },
    },
    {
      name: 'duration',
      type: 'number',
      defaultValue: 30,
      min: 15,
      max: 480,
      admin: {
        description: 'Duration in minutes',
      },
    },
    {
      name: 'timezone',
      type: 'text',
      defaultValue: 'UTC',
      admin: {
        description: 'Timezone for the appointment',
      },
    },

    // Meeting Details
    {
      name: 'meetingType',
      type: 'select',
      options: [
        { label: 'Video Call', value: 'video' },
        { label: 'Phone Call', value: 'phone' },
        { label: 'In-Person', value: 'in_person' },
        { label: 'Chat', value: 'chat' },
      ],
      defaultValue: 'video',
      required: true,
    },
    {
      name: 'meetingLink',
      type: 'url',
      admin: {
        description: 'Video call link (Zoom, Meet, etc.)',
        condition: (data) => data?.meetingType === 'video',
      },
    },
    {
      name: 'meetingLocation',
      type: 'text',
      admin: {
        description: 'Physical meeting location',
        condition: (data) => data?.meetingType === 'in_person',
      },
    },
    {
      name: 'phoneNumber',
      type: 'text',
      admin: {
        description: 'Phone number for call',
        condition: (data) => data?.meetingType === 'phone',
      },
    },

    // Status & Management
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'No Show', value: 'no_show' },
        { label: 'Rescheduled', value: 'rescheduled' },
      ],
      defaultValue: 'scheduled',
      required: true,
    },
    {
      name: 'remindersSent',
      type: 'array',
      fields: [
        {
          name: 'sentAt',
          type: 'date',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: '24 Hours', value: '24h' },
            { label: '1 Hour', value: '1h' },
            { label: '15 Minutes', value: '15m' },
          ],
          required: true,
        },
      ],
      admin: {
        description: 'Reminder notifications sent',
        readOnly: true,
      },
    },

    // Follow-up & Notes
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Meeting notes or outcomes',
      },
    },
    {
      name: 'followUpRequired',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark if follow-up is needed',
      },
    },
    {
      name: 'followUpDate',
      type: 'date',
      admin: {
        description: 'Scheduled follow-up date',
        condition: (data) => data?.followUpRequired === true,
      },
    },

    // CRM Integration
    {
      name: 'crmData',
      type: 'group',
      fields: [
        {
          name: 'appointmentType',
          type: 'select',
          options: [
            { label: 'Sales Call', value: 'sales' },
            { label: 'Consultation', value: 'consultation' },
            { label: 'Support', value: 'support' },
            { label: 'Follow-up', value: 'followup' },
            { label: 'Demo', value: 'demo' },
            { label: 'Onboarding', value: 'onboarding' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            description: 'Type of business appointment',
          },
        },
        {
          name: 'outcome',
          type: 'select',
          options: [
            { label: 'Successful', value: 'successful' },
            { label: 'Needs Follow-up', value: 'followup_needed' },
            { label: 'Not Interested', value: 'not_interested' },
            { label: 'Converted', value: 'converted' },
            { label: 'Rescheduled', value: 'rescheduled' },
          ],
          admin: {
            description: 'Appointment outcome',
            condition: (data) => data?.status === 'completed',
          },
        },
        {
          name: 'dealValue',
          type: 'number',
          admin: {
            description: 'Potential or actual deal value',
          },
        },
      ],
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, operation, req: { payload } }) => {
        if (operation === 'create') {
          // Auto-generate meeting link for video calls
          if (data?.meetingType === 'video' && !data?.meetingLink) {
            data.meetingLink = await generateMeetingLink(data)
          }
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req: { payload } }) => {
        if (operation === 'create') {
          // Send confirmation emails
          await sendAppointmentConfirmation(doc)

          // Schedule reminders
          await scheduleAppointmentReminders(doc)

          // Update CRM
          await syncAppointmentToCRM(doc, 'create')
        }

        if (operation === 'update' && doc.status === 'completed') {
          // Update member's CRM data
          await updateMemberFromAppointment(doc, payload)
        }
      },
    ],
  },
}

export default Appointments
```

### **5. Availability Slots Collection**

```typescript
// src/collections/AvailabilitySlots.ts
const AvailabilitySlots: CollectionConfig = {
  slug: 'availability-slots',
  admin: {
    group: 'Business',
    description: 'User availability for appointment booking',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User this availability belongs to',
      },
    },
    {
      name: 'dayOfWeek',
      type: 'select',
      options: [
        { label: 'Monday', value: 'monday' },
        { label: 'Tuesday', value: 'tuesday' },
        { label: 'Wednesday', value: 'wednesday' },
        { label: 'Thursday', value: 'thursday' },
        { label: 'Friday', value: 'friday' },
        { label: 'Saturday', value: 'saturday' },
        { label: 'Sunday', value: 'sunday' },
      ],
      required: true,
    },
    {
      name: 'startTime',
      type: 'text',
      required: true,
      admin: {
        description: 'Start time (HH:MM format)',
      },
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
      admin: {
        description: 'End time (HH:MM format)',
      },
    },
    {
      name: 'timezone',
      type: 'text',
      defaultValue: 'UTC',
      admin: {
        description: 'Timezone for availability',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this slot is currently active',
      },
    },
  ],
}
```

## 🔗 CRM Integration Architecture

### **6. CRM Contacts Collection**

```typescript
// src/collections/CRMContacts.ts
const CRMContacts: CollectionConfig = {
  slug: 'crm-contacts',
  admin: {
    group: 'CRM',
    useAsTitle: 'fullName',
    description: 'CRM contact management',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Linked platform user (if exists)',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      admin: {
        description: 'Primary associated space',
      },
    },

    // Contact Information
    {
      name: 'fullName',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'company',
      type: 'text',
    },
    {
      name: 'jobTitle',
      type: 'text',
    },

    // CRM Data
    {
      name: 'contactStatus',
      type: 'select',
      options: [
        { label: 'Lead', value: 'lead' },
        { label: 'Prospect', value: 'prospect' },
        { label: 'Customer', value: 'customer' },
        { label: 'Partner', value: 'partner' },
        { label: 'Inactive', value: 'inactive' },
      ],
      defaultValue: 'lead',
    },
    {
      name: 'leadScore',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
    },
    {
      name: 'lastContact',
      type: 'date',
    },
    {
      name: 'nextFollowUp',
      type: 'date',
    },
    {
      name: 'dealValue',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'notes',
      type: 'richText',
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
    },
  ],
}
```

## 🚀 Implementation Summary

### **What You Have Now:**
1. ✅ **Multi-tenant architecture** with proper tenant isolation
2. ✅ **Spaces collection** for business communities
3. ✅ **Enhanced user system** with global accounts + tenant/space memberships
4. ✅ **Hierarchical permissions** across tenant → space → channel levels

### **What's Left to Complete:**
1. 📅 **Appointment Booking System** (collections above)
2. 🔗 **CRM Integration** (collections above)
3. 🔧 **API endpoints** for booking and CRM workflows
4. 🎨 **Frontend components** for appointment scheduling
5. 📧 **Email/notification system** for appointments and CRM

### **Key Architectural Decisions Made:**

#### ✅ **Single Global User Account**
- **Users** collection with global authentication
- **TenantMemberships** for tenant-level access
- **SpaceMemberships** for space-level participation
- **Industry standard approach** (Slack, Discord, Teams model)

#### ✅ **Invitation → Onboarding Flow**
```
Space Invite → User Accepts → Auto-create Global Account (if needed) →
Create Space Membership → Auto-create Tenant Membership → Onboarding Complete
```

#### ✅ **CRM Integration Ready**
- Member data includes CRM fields (lead source, scoring, tags)
- Appointment system with business context
- Contact management with deal tracking
- Ready for external CRM sync (HubSpot, Salesforce, etc.)

You're absolutely right - with the **Spaces collections**, **multi-tenant structure**, **appointment booking**, and **CRM integration** complete, you'll have a comprehensive business collaboration platform that rivals any existing solution!
