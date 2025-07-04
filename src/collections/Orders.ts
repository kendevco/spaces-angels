import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Order',
    plural: 'Orders',
  },
  admin: {
    useAsTitle: 'orderNumber',
    group: 'Commerce',
    defaultColumns: ['orderNumber', 'customer', 'total', 'status', 'tenant', 'createdAt'],
    pagination: {
      defaultLimit: 20,
      limits: [10, 20, 50],
    },
    listSearchableFields: ['orderNumber', 'customer', 'customerEmail'],
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // Note: Tenant assignment should be done manually through the admin interface
        // since the User type doesn't include tenant information directly

        // Generate order number if creating new order
        if (operation === 'create' && !data.orderNumber) {
          const timestamp = Date.now().toString().slice(-8)
          const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
          data.orderNumber = `ORD-${timestamp}-${random}`
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated unique order number',
      },
    },
    // Customer Information
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Registered customer (if applicable)',
      },
    },
    {
      name: 'customerInfo',
      type: 'group',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
        },
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
          name: 'phone',
          type: 'text',
        },
      ],
    },
    // Billing Address
    {
      name: 'billingAddress',
      type: 'group',
      fields: [
        {
          name: 'street',
          type: 'text',
          required: true,
        },
        {
          name: 'street2',
          type: 'text',
          label: 'Street 2',
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'state',
          type: 'text',
          required: true,
        },
        {
          name: 'zipCode',
          type: 'text',
          required: true,
        },
        {
          name: 'country',
          type: 'select',
          required: true,
          defaultValue: 'US',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'GB' },
            { label: 'Australia', value: 'AU' },
            // Add more countries as needed
          ],
        },
      ],
    },
    // Shipping Address
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        {
          name: 'sameAsBilling',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Use billing address for shipping',
          },
        },
        {
          name: 'street',
          type: 'text',
          admin: {
            condition: (data) => !data.shippingAddress?.sameAsBilling,
          },
        },
        {
          name: 'street2',
          type: 'text',
          label: 'Street 2',
          admin: {
            condition: (data) => !data.shippingAddress?.sameAsBilling,
          },
        },
        {
          name: 'city',
          type: 'text',
          admin: {
            condition: (data) => !data.shippingAddress?.sameAsBilling,
          },
        },
        {
          name: 'state',
          type: 'text',
          admin: {
            condition: (data) => !data.shippingAddress?.sameAsBilling,
          },
        },
        {
          name: 'zipCode',
          type: 'text',
          admin: {
            condition: (data) => !data.shippingAddress?.sameAsBilling,
          },
        },
        {
          name: 'country',
          type: 'select',
          defaultValue: 'US',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'GB' },
            { label: 'Australia', value: 'AU' },
          ],
          admin: {
            condition: (data) => !data.shippingAddress?.sameAsBilling,
          },
        },
      ],
    },
    // Order Items
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            step: 0.01,
            description: 'Price at time of purchase',
          },
        },
        {
          name: 'total',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            step: 0.01,
            description: 'Line total (price × quantity)',
          },
        },
        {
          name: 'productSnapshot',
          type: 'group',
          admin: {
            description: 'Product details at time of purchase',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'sku',
              type: 'text',
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
    // Order Totals
    {
      name: 'totals',
      type: 'group',
      fields: [
        {
          name: 'subtotal',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            step: 0.01,
            description: 'Sum of all line items',
          },
        },
        {
          name: 'tax',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            step: 0.01,
          },
        },
        {
          name: 'shipping',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            step: 0.01,
          },
        },
        {
          name: 'discount',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            step: 0.01,
          },
        },
        {
          name: 'total',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            step: 0.01,
            description: 'Final total amount',
          },
        },
        {
          name: 'currency',
          type: 'select',
          required: true,
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
    // Payment Information
    {
      name: 'payment',
      type: 'group',
      fields: [
        {
          name: 'method',
          type: 'select',
          required: true,
          options: [
            { label: 'Credit Card', value: 'credit_card' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Stripe', value: 'stripe' },
            { label: 'Bank Transfer', value: 'bank_transfer' },
            { label: 'Cash on Delivery', value: 'cod' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Processing', value: 'processing' },
            { label: 'Paid', value: 'paid' },
            { label: 'Failed', value: 'failed' },
            { label: 'Refunded', value: 'refunded' },
            { label: 'Partially Refunded', value: 'partially_refunded' },
          ],
        },
        {
          name: 'transactionId',
          type: 'text',
          admin: {
            description: 'Payment processor transaction ID',
          },
        },
        {
          name: 'paidAt',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    // Shipping Information
    {
      name: 'shipping',
      type: 'group',
      fields: [
        {
          name: 'method',
          type: 'select',
          options: [
            { label: 'Standard Shipping', value: 'standard' },
            { label: 'Express Shipping', value: 'express' },
            { label: 'Overnight Shipping', value: 'overnight' },
            { label: 'Local Pickup', value: 'pickup' },
            { label: 'Digital Delivery', value: 'digital' },
          ],
        },
        {
          name: 'trackingNumber',
          type: 'text',
        },
        {
          name: 'carrier',
          type: 'select',
          options: [
            { label: 'UPS', value: 'ups' },
            { label: 'FedEx', value: 'fedex' },
            { label: 'USPS', value: 'usps' },
            { label: 'DHL', value: 'dhl' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'shippedAt',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'deliveredAt',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    // Order Status
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'On Hold', value: 'on_hold' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    // Notes and Communication
    {
      name: 'notes',
      type: 'array',
      fields: [
        {
          name: 'note',
          type: 'textarea',
          required: true,
        },
        {
          name: 'isCustomerVisible',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Show this note to the customer',
          },
        },
        {
          name: 'addedBy',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'addedAt',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
      admin: {
        description: 'Internal notes and customer communications',
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
        description: 'Which tenant this order belongs to',
      },
    },
    // Fulfillment
    {
      name: 'fulfillment',
      type: 'group',
      fields: [
        {
          name: 'requiresFulfillment',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Does this order require physical fulfillment?',
          },
        },
        {
          name: 'fulfilledAt',
          type: 'date',
          admin: {
            condition: (data) => data.fulfillment?.requiresFulfillment,
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'fulfilledBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            condition: (data) => data.fulfillment?.requiresFulfillment,
          },
        },
      ],
    },
  ],
  timestamps: true,
}
