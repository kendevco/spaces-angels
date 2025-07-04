import type { CollectionConfig } from 'payload'

export const Venues: CollectionConfig = {
  slug: 'venues',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'organization', 'venueType', 'city', 'state', 'isActive'],
    group: 'Enterprise Management',
    description: 'Specific locations within organizations (medical practices, franchise locations, etc.)',
  },
  access: {
    create: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      if (req.user?.globalRole === 'platform_admin') return true
      // Organization admins can create venues for their org
      return { 'organization.members.user': { equals: req.user?.id } }
    },
    read: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      if (req.user?.globalRole === 'platform_admin') return true
      // Users can read venues they have access to
      return {
        or: [
          { 'organization.members.user': { equals: req.user?.id } },
          { 'staff.user': { equals: req.user?.id } },
        ]
      }
    },
    update: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      if (req.user?.globalRole === 'platform_admin') return true
      return { 'organization.members.user': { equals: req.user?.id } }
    },
    delete: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      return false
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Venue name (e.g., BJC Medical Group - West County, Junk King St. Louis)',
      },
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      admin: {
        description: 'Parent organization this venue belongs to',
      },
    },
    {
      name: 'venueType',
      type: 'select',
      required: true,
      options: [
        { label: 'Medical Practice', value: 'medical_practice' },
        { label: 'Franchise Location', value: 'franchise_location' },
        { label: 'Service Territory', value: 'service_territory' },
        { label: 'Mobile Service Route', value: 'mobile_route' },
        { label: 'Corporate Office', value: 'corporate_office' },
        { label: 'Warehouse/Distribution', value: 'warehouse' },
        { label: 'Retail Location', value: 'retail' },
        { label: 'Virtual Location', value: 'virtual' },
      ],
      defaultValue: 'franchise_location',
    },
    {
      name: 'displayName',
      type: 'text',
      admin: {
        description: 'Public-facing name if different from internal name',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description of this venue/location',
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Venue-specific website URL',
        placeholder: 'https://bjcmedicalgroup.org/west-county',
      },
    },
    {
      name: 'location',
      type: 'group',
      label: 'Physical Location',
      fields: [
        {
          name: 'address',
          type: 'group',
          fields: [
            { name: 'street', type: 'text', required: true },
            { name: 'suite', type: 'text', admin: { placeholder: 'Suite 100' } },
            { name: 'city', type: 'text', required: true },
            { name: 'state', type: 'text', required: true },
            { name: 'zipCode', type: 'text', required: true },
            { name: 'country', type: 'text', defaultValue: 'USA' },
          ],
        },
        {
          name: 'coordinates',
          type: 'group',
          fields: [
            {
              name: 'latitude',
              type: 'number',
              admin: {
                description: 'GPS latitude for geo-location services',
                step: 0.000001,
              },
            },
            {
              name: 'longitude',
              type: 'number',
              admin: {
                description: 'GPS longitude for geo-location services',
                step: 0.000001,
              },
            },
          ],
        },
        {
          name: 'serviceRadius',
          type: 'number',
          admin: {
            description: 'Service radius in miles (for mobile services)',
            placeholder: '25',
          },
        },
        {
          name: 'timezone',
          type: 'text',
          defaultValue: 'America/New_York',
          admin: {
            description: 'Local timezone for this venue',
          },
        },
      ],
    },
    {
      name: 'contactInfo',
      type: 'group',
      label: 'Contact Information',
      fields: [
        { name: 'phone', type: 'text', admin: { placeholder: '(555) 123-4567' } },
        { name: 'fax', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'emergencyContact', type: 'text' },
        { name: 'afterHoursContact', type: 'text' },
      ],
    },
    {
      name: 'businessHours',
      type: 'group',
      label: 'Operating Hours',
      fields: [
        {
          name: 'schedule',
          type: 'array',
          fields: [
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
            },
            { name: 'openTime', type: 'text', admin: { placeholder: '09:00' } },
            { name: 'closeTime', type: 'text', admin: { placeholder: '17:00' } },
            { name: 'isClosed', type: 'checkbox', defaultValue: false },
            { name: 'isEmergencyOnly', type: 'checkbox', defaultValue: false },
          ],
        },
        {
          name: 'specialHours',
          type: 'array',
          label: 'Special Hours/Holidays',
          fields: [
            { name: 'date', type: 'date', required: true },
            { name: 'description', type: 'text', admin: { placeholder: 'Holiday Hours' } },
            { name: 'openTime', type: 'text' },
            { name: 'closeTime', type: 'text' },
            { name: 'isClosed', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
    {
      name: 'staff',
      type: 'array',
      label: 'Staff & Providers',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Venue Manager', value: 'venue_manager' },
            { label: 'Medical Provider', value: 'medical_provider' },
            { label: 'Nurse/Assistant', value: 'nurse' },
            { label: 'Administrative Staff', value: 'admin_staff' },
            { label: 'Technician', value: 'technician' },
            { label: 'Service Provider', value: 'service_provider' },
            { label: 'Sales Representative', value: 'sales_rep' },
            { label: 'Customer Service', value: 'customer_service' },
          ],
          defaultValue: 'admin_staff',
        },
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Job title/position',
            placeholder: 'Family Medicine Physician',
          },
        },
        {
          name: 'specialties',
          type: 'array',
          fields: [
            { name: 'specialty', type: 'text' },
          ],
        },
        {
          name: 'schedule',
          type: 'group',
          fields: [
            {
              name: 'availability',
              type: 'array',
              fields: [
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
                },
                { name: 'startTime', type: 'text' },
                { name: 'endTime', type: 'text' },
                { name: 'isAvailable', type: 'checkbox', defaultValue: true },
              ],
            },
          ],
        },
        {
          name: 'contactInfo',
          type: 'group',
          fields: [
            { name: 'directPhone', type: 'text' },
            { name: 'directEmail', type: 'email' },
            { name: 'pager', type: 'text' },
          ],
        },
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'services',
      type: 'array',
      label: 'Services Offered',
      fields: [
        { name: 'serviceName', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'duration', type: 'number', admin: { description: 'Duration in minutes' } },
        { name: 'price', type: 'number', admin: { description: 'Base price' } },
        { name: 'isActive', type: 'checkbox', defaultValue: true },
        { name: 'requiresAppointment', type: 'checkbox', defaultValue: true },
        { name: 'category', type: 'text' },
      ],
    },
    {
      name: 'integrations',
      type: 'group',
      label: 'System Integrations',
      fields: [
        {
          name: 'crmSettings',
          type: 'group',
          fields: [
            {
              name: 'crmLocationId',
              type: 'text',
              admin: {
                description: 'Location ID in external CRM system',
              },
            },
            {
              name: 'syncEnabled',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'lastSync',
              type: 'date',
              admin: {
                readOnly: true,
                description: 'Last CRM synchronization',
              },
            },
          ],
        },
        {
          name: 'bookingSystem',
          type: 'group',
          fields: [
            {
              name: 'externalBookingUrl',
              type: 'text',
              admin: {
                description: 'External booking system URL',
              },
            },
            {
              name: 'bookingSystemType',
              type: 'select',
              options: [
                { label: 'Internal', value: 'internal' },
                { label: 'Epic MyChart', value: 'epic' },
                { label: 'InQuicker', value: 'inquicker' },
                { label: 'Acuity', value: 'acuity' },
                { label: 'Calendly', value: 'calendly' },
                { label: 'Custom', value: 'custom' },
              ],
              defaultValue: 'internal',
            },
            {
              name: 'inquickerConfig',
              type: 'group',
              label: 'InQuicker Configuration',
              admin: {
                condition: (data) => data?.bookingSystemType === 'inquicker',
              },
              fields: [
                {
                  name: 'locationId',
                  type: 'text',
                  admin: {
                    description: 'InQuicker location ID for this venue',
                  },
                },
                {
                  name: 'apiEndpoint',
                  type: 'text',
                  admin: {
                    description: 'InQuicker API endpoint',
                  },
                },
                {
                  name: 'enableRealTimeSync',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Enable real-time availability sync with InQuicker',
                  },
                },
                {
                  name: 'guardianAngelBooking',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Allow Guardian Angel to book appointments via InQuicker',
                  },
                },
                {
                  name: 'waitlistManagement',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Enable Guardian Angel waitlist management',
                  },
                },
                {
                  name: 'cancellationPolicy',
                  type: 'textarea',
                  admin: {
                    description: 'Venue-specific cancellation policy for Guardian Angel to communicate',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'paymentProcessing',
          type: 'group',
          fields: [
            {
              name: 'acceptsPayments',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'stripeAccountId',
              type: 'text',
              admin: {
                description: 'Stripe Connect account ID for this venue',
              },
            },
            {
              name: 'acceptedPaymentMethods',
              type: 'array',
              fields: [
                {
                  name: 'method',
                  type: 'select',
                  options: [
                    { label: 'Credit Card', value: 'credit_card' },
                    { label: 'Debit Card', value: 'debit_card' },
                    { label: 'ACH/Bank Transfer', value: 'ach' },
                    { label: 'Cash', value: 'cash' },
                    { label: 'Check', value: 'check' },
                    { label: 'Insurance', value: 'insurance' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      label: 'Performance Analytics',
      fields: [
        {
          name: 'enableAnalytics',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'performanceMetrics',
          type: 'group',
          fields: [
            {
              name: 'averageRating',
              type: 'number',
              admin: {
                readOnly: true,
                description: 'Average customer rating',
              },
            },
            {
              name: 'totalReviews',
              type: 'number',
              admin: {
                readOnly: true,
                description: 'Total number of reviews',
              },
            },
            {
              name: 'monthlyRevenue',
              type: 'number',
              admin: {
                readOnly: true,
                description: 'Monthly revenue (last 30 days)',
              },
            },
            {
              name: 'appointmentVolume',
              type: 'number',
              admin: {
                readOnly: true,
                description: 'Appointments this month',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'guardianAngel',
      type: 'group',
      label: 'Guardian Angel Assignment',
      fields: [
        {
          name: 'assignedAngel',
          type: 'relationship',
          relationTo: 'business-agents',
          admin: {
            description: 'Guardian Angel assigned to this venue',
          },
        },
        {
          name: 'angelCustomization',
          type: 'group',
          fields: [
            {
              name: 'venueSpecificGreeting',
              type: 'textarea',
              admin: {
                description: 'Venue-specific greeting message',
                placeholder: 'Welcome to BJC Medical Group - West County...',
              },
            },
            {
              name: 'venueSpecificServices',
              type: 'array',
              fields: [
                { name: 'service', type: 'text' },
                { name: 'description', type: 'textarea' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this venue is currently active and accepting business',
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Temporarily Closed', value: 'temp_closed' },
        { label: 'Under Construction', value: 'under_construction' },
        { label: 'Pending Approval', value: 'pending' },
        { label: 'Suspended', value: 'suspended' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this venue',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // Auto-assign venue manager role to creator
        if (operation === 'create' && req.user && !data.staff?.length) {
          data.staff = [{
            user: req.user.id,
            role: 'venue_manager',
            title: 'Venue Manager',
            isActive: true
          }]
        }
        return data
      },
    ],
    afterChange: [
      async ({ req, doc, operation }) => {
        if (operation === 'create') {
          // Log venue creation
          console.log(`[Venues] Created new venue: ${doc.name} (${doc.venueType})`)

          // TODO: Auto-assign Guardian Angel
          // TODO: Send welcome notification to organization
          // TODO: Create default services based on venue type
        }
      },
    ],
  },
}
