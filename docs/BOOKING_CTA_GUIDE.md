# Booking Call-to-Action (CTA) Templates Guide

## Overview

This guide provides comprehensive templates for booking-oriented call-to-action blocks designed for various service businesses. These templates are optimized for conversion and user engagement.

## Available Booking CTA Templates

### 1. Dumpster Rental Service
Perfect for construction, renovation, and cleanup services.
- Same-day delivery emphasis
- Pricing transparency
- Competitive positioning

### 2. Local Tour Guide
Ideal for tourism, local experiences, and cultural tours.
- Experience-focused messaging
- Customization emphasis
- Local expertise highlighting

### 3. General Service Booking
Versatile template for various professional services.
- Professional positioning
- Free estimates offer
- Experienced team emphasis

## Implementation Guide

### Step 1: Import the Template
```typescript
import { bookingCTAs } from '@/endpoints/seed/booking-ctas'
```

### Step 2: Use in Page Layout
```typescript
export const yourServicePage = () => ({
  slug: 'your-service',
  title: 'Your Service',
  layout: [
    {
      ...bookingCTAs.dumpsterRental,
      links: [
        {
          link: {
            type: 'custom',
            url: '/your-booking-url',
            label: 'Your Custom Button Text',
            appearance: 'default'
          }
        }
      ]
    }
  ]
})
```

## Available Templates

- `dumpsterRental` - Construction/cleanup services
- `tourGuide` - Tourism and local experiences
- `serviceBooking` - General professional services
- `homeServices` - Emergency home repairs
- `eventPlanning` - Event coordination services
- `equipmentRental` - Tool and equipment rental
- `fitnessTraining` - Personal training services
- `catering` - Food and catering services
- `spa` - Wellness and spa services
- `photography` - Photography services

## Best Practices

1. **Headlines**: Use action-oriented language
2. **Descriptions**: Focus on benefits and trust signals
3. **Buttons**: Clear primary actions with alternatives
4. **URLs**: SEO-friendly and trackable

## Integration with Appointments

Link directly to your booking system:
```typescript
{
  link: {
    type: 'reference',
    reference: { relationTo: 'pages', value: 'consultation-booking' },
    label: 'Book Appointment',
    appearance: 'default'
  }
}
```
