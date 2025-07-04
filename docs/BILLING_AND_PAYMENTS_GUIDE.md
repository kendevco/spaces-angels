# Billing and Payments Guide

## Overview

This guide covers the complete billing and payments architecture for the KenDev Commerce Platform, implementing Stripe Connect for multi-party payments, revenue splitting, and automated billing.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Marketplace Payments (Collect then Transfer)](#marketplace-payments)
3. [SaaS Platform Billing](#saas-platform-billing)
4. [Connected Account Management](#connected-account-management)
5. [Revenue Splitting & Fee Calculation](#revenue-splitting)
6. [Implementation Details](#implementation-details)
7. [Testing & Security](#testing--security)
8. [Troubleshooting](#troubleshooting)
9. [Accounting Software Integration](#accounting-software-integration)

## Architecture Overview

Our platform implements **dual payment flows** following [Stripe Connect best practices](https://docs.stripe.com/connect/collect-then-transfer-guide):

### 1. Marketplace Model (Collect then Transfer)
- **Use Case**: Content creators, service providers, physical goods sellers
- **Flow**: Platform collects payment → Transfers to creator's connected account
- **Revenue**: Application fees + processing fees

### 2. SaaS Platform Model (Direct Payments)
- **Use Case**: Business subscriptions, platform fees, enterprise accounts
- **Flow**: Direct payments to platform account
- **Revenue**: Subscription fees + feature charges

## Marketplace Payments

### Connected Account Creation

Following the [Stripe onboarding guide](https://docs.stripe.com/connect/collect-then-transfer-guide):

```typescript
// Create connected account for creator/seller
const account = await stripe.accounts.create({
  controller: {
    losses: { payments: 'application' },
    fees: { payer: 'application' },
    stripe_dashboard: { type: 'express' }
  },
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true }
  }
});

// Generate onboarding link
const accountLink = await stripe.accountLinks.create({
  account: connectedAccountId,
  refresh_url: `${baseUrl}/connect/refresh`,
  return_url: `${baseUrl}/connect/return`,
  type: 'account_onboarding'
});
```

### Account Verification Status

```typescript
const account = await stripe.accounts.retrieve(connectedAccountId);
const canAcceptPayments = account.charges_enabled;
const hasOutstandingRequirements = account.requirements.currently_due.length > 0;
```

### Destination Charges

For marketplace transactions, we use **destination charges** as recommended in the [collect then transfer guide](https://docs.stripe.com/connect/collect-then-transfer-guide):

```typescript
// Current implementation in /api/subscriptions/create/route.ts
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalAmount,
  currency: 'usd',
  application_fee_amount: platformFee, // Platform's revenue
  transfer_data: {
    destination: space.monetization?.merchantAccount // Creator's account
  },
  metadata: {
    spaceId,
    userId,
    platformFeePercent: platformFeePercent.toString(),
    creatorAmount: creatorAmount.toString()
  }
});
```

## SaaS Platform Billing

### Subscription Management

For platform subscriptions and business accounts:

```typescript
// Direct platform subscription
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{
    price: priceId,
    quantity: 1
  }],
  metadata: {
    tenantId,
    planType: 'enterprise',
    features: JSON.stringify(enabledFeatures)
  }
});
```

### Usage-Based Billing

For API usage, storage, and feature-based charges:

```typescript
// Report usage for metered billing
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  {
    quantity: apiCalls,
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment'
  }
);
```

## Connected Account Management

### Account Verification Status

Monitor account status following [Stripe's account management guide](https://docs.stripe.com/connect/collect-then-transfer-guide#handle-users-that-havent-completed-onboarding):

```typescript
// Check account capabilities and requirements
const account = await stripe.accounts.retrieve(connectedAccountId);

const canAcceptPayments = account.charges_enabled;
const hasOutstandingRequirements = account.requirements.currently_due.length > 0;
const detailsSubmitted = account.details_submitted;
```

### Webhook Handling

Essential webhooks for account management:

```typescript
// Handle account updates
app.post('/webhook', (req, res) => {
  const event = req.body;

  switch (event.type) {
    case 'account.updated':
      // Update local account status
      updateAccountStatus(event.data.object);
      break;

    case 'payment_intent.succeeded':
      // Process successful marketplace payment
      handleSuccessfulPayment(event.data.object);
      break;

    case 'transfer.created':
      // Log revenue transfer to creator
      logRevenueTransfer(event.data.object);
      break;
  }
});
```

## Revenue Splitting

### Competitive Fee Structure 🎯
- **KenDev Platform Fee**: 20% (includes full service package)
- **OnlyFans**: 20% (content-only platform)
- **YouTube**: 30% (45% for Shorts)
- **Patreon**: 5-12% + payment processing
- **Substack**: 10% + payment processing
- **Twitch**: 50% of ad revenue

**Our Advantage**: Same rate as OnlyFans but with **comprehensive business automation**, social media management, custom websites, and AI-powered marketing tools.

### Value Proposition at 20%
For every $100 earned:
- Creator receives: **$77.10** (after Stripe fees)
- Platform fee: **$20.00**
- Stripe processing: **$2.90**

What the 20% includes:
- Social media automation ($3,000/month value)
- Custom website & storefront ($500/month value)
- Business analytics & optimization ($200/month value)
- AI-powered content marketing ($400/month value)
- 24/7 platform infrastructure ($100/month value)
- Payment processing integration (included)
- Customer support & dispute handling

### Revenue Sharing Tiers

#### 1. Standard Rate (20%)
- **Default**: 20% platform fee
- **Includes**: Full service package
- **Best for**: Most creators and businesses

#### 2. High-Performance Discount (8-15%)
- **Qualification**: Volume thresholds, platform promotion
- **Rate**: Negotiated based on performance
- **Includes**: Enhanced support, priority features

#### 3. Enterprise Rates (20-30%)
- **For**: Large businesses requiring custom features
- **Includes**: Dedicated support, custom integrations
- **Rate**: Based on complexity and resource requirements

### Dynamic Fee Calculation

Our platform implements **intelligent fee calculation** based on performance and agreement type:

#### Volume-Based Pricing
- **$0-$1K/month**: 20% (standard rate)
- **$1K-$5K/month**: 18% (volume discount)
- **$5K-$10K/month**: 15% (high-volume discount)
- **$10K+/month**: 12% (enterprise discount)

#### Performance-Based Adjustments
- **Content Quality Bonus**: -2% for high engagement
- **Platform Promotion**: -1% for featuring our platform
- **Community Building**: -1% for active engagement
- **Innovation Bonus**: -2% for platform feature adoption

#### AI-Optimized Rates (Beta)
- **Range**: 12-25% based on algorithmic optimization
- **Factors**: Revenue velocity, user engagement, market conditions
- **Goal**: Maximize creator earnings while ensuring platform sustainability

### Fee Transparency

Complete breakdown provided to users:

```typescript
const feeBreakdown = {
  youPay: `$${(totalAmount / 100).toFixed(2)}`,
  creatorReceives: `$${(creatorAmount / 100).toFixed(2)}`,
  platformFee: `$${(platformFee / 100).toFixed(2)} (${platformFeePercent}%)`,
  processingFee: `$${(processingFee / 100).toFixed(2)}`,
  valueProvided: [
    "Social media automation ($3K/month value)",
    "Custom website & storefront ($500/month value)",
    "Business analytics & optimization"
  ]
};
```

## Implementation Details

### Current File Structure

```
src/app/api/
├── subscriptions/
│   ├── create/route.ts          # Marketplace subscription creation
│   ├── manage/route.ts          # Subscription management
│   └── webhook/route.ts         # Stripe webhooks
├── billing/
│   ├── usage/route.ts           # Usage-based billing
│   └── invoices/route.ts        # Invoice generation
└── connect/
    ├── onboard/route.ts         # Connected account onboarding
    ├── accounts/route.ts        # Account management
    └── payouts/route.ts         # Payout management
```

### Security Best Practices

1. **Webhook Verification**
   ```typescript
   const sig = req.headers['stripe-signature'];
   const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
   ```

2. **API Key Management**
   - Separate keys for test/live environments
   - Environment-specific configuration
   - Secure key rotation

3. **Connected Account Security**
   - OAuth-style account linking
   - Temporary account link URLs
   - Authenticated user verification

## Testing & Security

### Test Card Numbers

Following [Stripe's testing guide](https://docs.stripe.com/connect/collect-then-transfer-guide#testing):

- **Successful payment**: `4242424242424242`
- **Requires authentication**: `4000002500003155`
- **Declined payment**: `4000000000009995`
- **UnionPay variable length**: `6205500000000000004`

### Security Considerations

1. **PCI Compliance**: Stripe handles PCI compliance for card data
2. **Account Verification**: Follow KYC requirements for connected accounts
3. **Dispute Management**: Platform handles disputes as settlement merchant
4. **Refund Processing**: Implement proper refund workflows

### Webhook Testing

```bash
# Install Stripe CLI for local testing
stripe listen --forward-to localhost:3000/api/webhook

# Test specific events
stripe trigger payment_intent.succeeded
stripe trigger account.updated
```

## Troubleshooting

### Common Issues

1. **Account Not Charges Enabled**
   - Check `account.charges_enabled`
   - Review `account.requirements.currently_due`
   - Generate new account link for completion

2. **Transfer Failures**
   - Verify connected account capabilities
   - Check account verification status
   - Ensure sufficient balance for transfers

3. **Application Fee Errors**
   - Verify fee amount ≤ charge amount
   - Check connected account agreement
   - Validate fee calculation logic

### Error Handling

```typescript
try {
  const paymentIntent = await stripe.paymentIntents.create({...});
} catch (error) {
  if (error.type === 'StripeCardError') {
    // Card was declined
    return handleCardDeclined(error);
  } else if (error.type === 'StripeInvalidRequestError') {
    // Invalid parameters
    return handleInvalidRequest(error);
  } else {
    // Other Stripe errors
    return handleStripeError(error);
  }
}
```

## Monitoring & Analytics

### Key Metrics to Track

1. **Revenue Metrics**
   - Gross payment volume
   - Platform fee revenue
   - Creator payouts
   - Processing fee costs

2. **Account Health**
   - Connected account onboarding completion rate
   - Account verification time
   - Failed payment rates

3. **Platform Performance**
   - Payment success rates
   - Dispute rates
   - Refund percentages
   - Average transaction size

### Dashboard Integration

```typescript
// Revenue analytics for platform dashboard
const revenueAnalytics = {
  totalVolume: await calculateTotalVolume(),
  platformRevenue: await calculatePlatformFees(),
  creatorPayouts: await calculateCreatorPayouts(),
  growthRate: await calculateGrowthRate()
};
```

---

## Accounting Software Integration

### **Automated Accounting by Business Type**

Our platform provides intelligent accounting integration that adapts to each business model:

#### **🏗️ Physical Services** (Asphalt Companies, Construction)
- **Job Costing**: Track materials, labor, and overhead per project
- **Invoice Automation**: Generate professional invoices for high-value jobs
- **Equipment Tracking**: Depreciation and maintenance cost allocation
- **Payment Terms**: Net 30 with late fee automation

**Example: $50,000 Asphalt Job**
```json
{
  "job_costing": {
    "materials": 15000,
    "labor": 12000,
    "equipment_rental": 8000,
    "overhead": 3000,
    "profit": 12000
  },
  "platform_fee": 1000,
  "accounting_sync": "real_time"
}
```

#### **🎨 AI-Generated Products** (Print-on-Demand)
- **Multi-Platform Consolidation**: CafePress, Etsy, Amazon KDP revenue
- **Zero-Inventory Tracking**: No material costs for AI designs
- **Fulfillment Cost Allocation**: Per-item production tracking
- **Design Profitability**: ROI analysis per design

**Example: Multi-Platform Sales**
```json
{
  "platforms": {
    "cafepress_mugs": { "sales": 1200, "fulfillment": 180 },
    "etsy_tshirts": { "sales": 2500, "fulfillment": 450 },
    "amazon_covers": { "sales": 800, "fulfillment": 0 }
  },
  "total_net": 3870,
  "platform_fee": 270
}
```

#### **🎯 Content Creators**
- **Revenue Categorization**: Subscriptions vs tips vs merchandise
- **Equipment Deductions**: Camera, software, marketing expenses
- **1099 Generation**: Automatic tax form preparation
- **International Compliance**: Global audience tax handling

### **Integration Tools**

**Primary: [Merge.dev](https://merge.dev)**
- Single API for 100+ accounting platforms
- Unified data model across QuickBooks, Xero, FreshBooks
- Built-in error handling and retry logic

**Direct Integrations:**
- QuickBooks Online API (80% of SMBs)
- Xero API (International markets)
- FreshBooks API (Service businesses)

### **Automated Features**

#### **Smart Categorization**
```typescript
// AI-powered expense categorization
const categorizeExpense = async (expense, businessType) => {
  switch (businessType) {
    case 'physical_service':
      return categorizeServiceExpense(expense)
    case 'ai_products':
      return categorizeProductExpense(expense)
    case 'content_creator':
      return categorizeCreatorExpense(expense)
  }
}
```

#### **Tax Optimization**
- Quarterly tax estimate preparation
- Deduction identification by business type
- Equipment depreciation tracking
- Sales tax automation by location

#### **Reporting**
- Monthly P&L by business type
- Job profitability (service businesses)
- Design performance (AI products)
- Cash flow forecasting

### **Setup Process**

1. **Business Type Detection**: Platform auto-configures based on space type
2. **Chart of Accounts**: Industry-specific account structure
3. **Sync Configuration**: Real-time vs batch based on transaction volume
4. **Integration Testing**: Verify data mapping accuracy
5. **Ongoing Monitoring**: Automated error detection and resolution

---

## References

- [Stripe Connect Collect then Transfer Guide](https://docs.stripe.com/connect/collect-then-transfer-guide)
- [Stripe SaaS Platform Guide](https://docs.stripe.com/connect/enable-payment-acceptance-guide)
- [Stripe Connect Integration Design](https://docs.stripe.com/connect/design-an-integration)
- [Stripe Billing Connect Integration](https://docs.stripe.com/connect/accounts-v2/integrate-billing-connect)

---

*Last Updated: December 2024*
*Platform: KenDev Commerce Platform*
*Stripe API Version: 2025-05-28.basil*
