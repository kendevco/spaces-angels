# Accounting Software Integration Guide

## 🎯 Overview

This guide covers the comprehensive accounting software integration strategy for the KenDev Commerce Platform, providing business-type-specific accounting automation that adapts to each tenant's unique needs.

## Table of Contents

1. [Integration Strategy](#integration-strategy)
2. [Supported Platforms](#supported-platforms)
3. [Business-Type Data Mapping](#business-type-data-mapping)
4. [API Implementation](#api-implementation)
5. [Setup & Configuration](#setup--configuration)
6. [Automated Features](#automated-features)
7. [Troubleshooting](#troubleshooting)

## Integration Strategy

### **Philosophy: "One Integration, All Business Types"**

Instead of forcing all businesses to use the same accounting categories, our platform intelligently maps transaction data based on business type and industry best practices.

### **Unified API Approach**

**Primary Integration Tool: [Merge.dev](https://merge.dev)**
- Single API endpoint for 100+ accounting systems
- Unified data model across platforms
- Built-in rate limiting and error handling
- Automatic webhook management

**Fallback Direct Integrations:**
- QuickBooks Online API (80% of SMBs)
- Xero API (International markets)
- FreshBooks API (Service businesses)
- Wave API (Free tier users)

### **Real-Time vs. Batch Processing**

| Business Type | Sync Method | Frequency | Rationale |
|---------------|-------------|-----------|-----------|
| **Physical Service** | Real-time | Immediate | High-value transactions need instant tracking |
| **Content Creator** | Batch | Daily | Many small transactions, daily summary efficient |
| **AI Products** | Real-time | Per sale | Important for inventory-free cost tracking |
| **Retail** | Real-time | Per sale | Inventory sync critical |
| **POS Only** | Batch | End of day | Simple transaction logging |

## Supported Platforms

### **Tier 1: Fully Integrated**
- ✅ **QuickBooks Online** - Complete feature set
- ✅ **Xero** - Full integration with multi-currency
- ✅ **FreshBooks** - Service business optimized

### **Tier 2: Core Features**
- ✅ **Wave Accounting** - Basic sync capabilities
- ✅ **Sage Business Cloud** - Enterprise features
- ✅ **NetSuite** - Large business integration

### **Tier 3: API-Only**
- ✅ **Bench** - Data export only
- ✅ **Zoho Books** - Basic transaction sync
- ✅ **Kashoo** - Limited feature set

## Business-Type Data Mapping

### **🎨 Content Creators & Digital Services**

#### **Revenue Transactions**
```json
{
  "transaction_type": "revenue",
  "account_mapping": {
    "gross_revenue": "Digital Content Sales",
    "platform_fee": "Platform Commission Expense",
    "net_revenue": "Net Digital Revenue",
    "processing_fees": "Payment Processing Fees"
  },
  "categories": {
    "subscription_revenue": "Recurring Revenue",
    "tip_income": "Gratuity Income",
    "merchandise_sales": "Product Sales"
  },
  "tax_handling": {
    "1099_threshold": 600,
    "sales_tax": "service_location_based",
    "deductions": ["equipment", "software", "marketing"]
  }
}
```

### **🏗️ Physical Services** (Asphalt, Construction, Consulting)

#### **Project-Based Accounting**
```json
{
  "job_costing_integration": {
    "project_setup": {
      "job_id": "parking_lot_marriott_dec2024",
      "client": "Marriott Hotel Chain",
      "location": "1234 Main St, Dallas, TX",
      "estimated_value": 50000,
      "start_date": "2024-12-01"
    },
    "cost_tracking": {
      "materials": {
        "asphalt": { "quantity": "200 tons", "cost": 15000 },
        "equipment_rental": { "description": "Paver rental", "cost": 8000 },
        "permits": { "description": "City permits", "cost": 500 }
      },
      "labor": {
        "crew_wages": 12000,
        "overtime": 2000,
        "benefits": 1500
      },
      "overhead": {
        "insurance": 1000,
        "fuel": 800,
        "truck_maintenance": 600
      }
    },
    "revenue_recognition": {
      "payment_schedule": "milestone_based",
      "invoice_triggers": ["50% upfront", "completion"]
    }
  }
}
```

### **🎨 AI-Generated Products & Print-on-Demand**

#### **Multi-Platform Revenue Consolidation**
```json
{
  "sales_channels": {
    "cafepress": {
      "product_type": "mugs",
      "gross_sales": 1200,
      "platform_commission": 360,
      "net_earnings": 840,
      "fulfillment_costs": 180
    },
    "etsy": {
      "product_type": "t_shirts",
      "gross_sales": 2500,
      "etsy_fees": 375,
      "net_earnings": 2125,
      "fulfillment_costs": 450
    },
    "amazon_kdp": {
      "product_type": "book_covers",
      "gross_sales": 800,
      "amazon_commission": 240,
      "net_earnings": 560,
      "fulfillment_costs": 0
    }
  },
  "cost_structure": {
    "ai_design_tools": 0,
    "print_fulfillment": "variable_per_item",
    "marketing": "platform_automated",
    "inventory_cost": 0
  }
}
```

### **🛍️ Retail & E-commerce**

#### **Inventory Integration**
```json
{
  "inventory_sync": {
    "shopify_integration": {
      "product_sync": "real_time",
      "cost_method": "FIFO",
      "reorder_points": "automated",
      "dead_stock_alerts": "enabled"
    },
    "amazon_fba": {
      "inventory_tracking": "amazon_api",
      "storage_fees": "monthly_allocation",
      "return_processing": "automated"
    }
  }
}
```

## API Implementation

### **Core Integration Service**

```typescript
// src/services/AccountingIntegrationService.ts

export class AccountingIntegrationService {
  private mergeClient: MergeAPIClient
  private directClients: Map<string, any> = new Map()

  async syncTransaction(
    spaceId: string,
    transaction: Transaction,
    businessType: BusinessType
  ): Promise<SyncResult> {
    const integration = await this.getIntegrationForSpace(spaceId)
    const mappedData = this.mapTransactionData(transaction, businessType)

    try {
      switch (integration.provider) {
        case 'quickbooks':
          return await this.syncToQuickBooks(mappedData, integration)
        case 'xero':
          return await this.syncToXero(mappedData, integration)
        case 'merge':
          return await this.syncViaMerge(mappedData, integration)
        default:
          throw new Error(`Unsupported provider: ${integration.provider}`)
      }
    } catch (error) {
      await this.logSyncError(spaceId, transaction.id, error)
      throw error
    }
  }

  private mapTransactionData(
    transaction: Transaction,
    businessType: BusinessType
  ): AccountingData {
    const mapper = BusinessTypeMappers[businessType]
    return mapper.mapTransaction(transaction)
  }
}
```

### **Physical Service Mapper**

```typescript
// src/services/mappers/PhysicalServiceMapper.ts

export class PhysicalServiceMapper implements BusinessTypeMapper {
  mapTransaction(transaction: Transaction): AccountingData {
    return {
      type: 'revenue',
      account: 'Service Revenue',
      amount: transaction.totalAmount,
      date: transaction.createdAt,
      description: transaction.jobDescription,
      customer: transaction.customerName,
      job_costing: {
        job_id: transaction.jobId,
        materials_cost: transaction.materialsCost,
        labor_cost: transaction.laborCost,
        overhead_allocation: transaction.overheadCost,
        profit_margin: transaction.totalAmount - transaction.totalCost
      },
      categories: {
        gross_revenue: transaction.totalAmount,
        platform_fee: transaction.platformFee,
        net_revenue: transaction.contractorAmount
      },
      payment_terms: transaction.paymentTerms || 'Net 30'
    }
  }

  generateInvoice(job: ServiceJob): InvoiceData {
    return {
      invoice_number: `INV-${job.id}`,
      customer: job.customer,
      line_items: job.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate
      })),
      subtotal: job.subtotal,
      tax: job.taxAmount,
      total: job.total,
      payment_terms: job.paymentTerms,
      due_date: this.calculateDueDate(job.createdAt, job.paymentTerms)
    }
  }
}
```

### **AI Products Mapper**

```typescript
// src/services/mappers/AIProductsMapper.ts

export class AIProductsMapper implements BusinessTypeMapper {
  mapTransaction(transaction: Transaction): AccountingData {
    return {
      type: 'revenue',
      account: 'Digital Product Sales',
      amount: transaction.totalAmount,
      date: transaction.createdAt,
      description: `${transaction.productType} sale - ${transaction.designTitle}`,
      product_tracking: {
        design_id: transaction.designId,
        platform: transaction.salesChannel,
        product_type: transaction.productType,
        fulfillment_cost: transaction.fulfillmentCost,
        profit_per_item: transaction.totalAmount - transaction.fulfillmentCost
      },
      categories: {
        gross_sales: transaction.totalAmount,
        platform_commission: transaction.platformFee,
        fulfillment_cost: transaction.fulfillmentCost,
        net_profit: transaction.netProfit
      },
      cost_of_goods: {
        design_cost: 0,
        production_cost: transaction.fulfillmentCost,
        shipping: transaction.shippingCost
      }
    }
  }

  consolidatePlatformSales(sales: PlatformSale[]): AccountingData[] {
    const consolidated = sales.reduce((acc, sale) => {
      const platform = sale.platform
      if (!acc[platform]) {
        acc[platform] = {
          total_sales: 0,
          total_fees: 0,
          total_fulfillment: 0,
          item_count: 0
        }
      }

      acc[platform].total_sales += sale.amount
      acc[platform].total_fees += sale.platformFee
      acc[platform].total_fulfillment += sale.fulfillmentCost
      acc[platform].item_count += 1

      return acc
    }, {} as Record<string, any>)

    return Object.entries(consolidated).map(([platform, data]) => ({
      type: 'revenue_summary',
      account: `${platform} Sales`,
      amount: data.total_sales,
      description: `Daily ${platform} sales summary - ${data.item_count} items`,
      cost_breakdown: {
        platform_fees: data.total_fees,
        fulfillment_costs: data.total_fulfillment,
        net_earnings: data.total_sales - data.total_fees - data.total_fulfillment
      }
    }))
  }
}
```

## Setup & Configuration

### **Integration Setup API**

```typescript
// src/app/api/accounting/setup/route.ts

export async function POST(request: NextRequest) {
  const { spaceId, provider, credentials } = await request.json()

  try {
    // Step 1: Validate credentials
    const validation = await validateAccountingCredentials(provider, credentials)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
    }

    // Step 2: Set up chart of accounts based on business type
    const space = await getSpaceById(spaceId)
    const chartOfAccounts = await setupChartOfAccounts(space.businessType, provider)

    // Step 3: Configure sync preferences
    const syncConfig = {
      frequency: getSyncFrequency(space.businessType),
      auto_categorization: true,
      invoice_generation: space.businessType === 'physical_service',
      job_costing: ['physical_service', 'construction'].includes(space.businessType),
      inventory_sync: ['retail', 'ecommerce'].includes(space.businessType)
    }

    // Step 4: Store integration configuration
    const integration = await storeIntegrationConfig({
      spaceId,
      provider,
      credentials: encryptCredentials(credentials),
      chartOfAccounts,
      syncConfig,
      status: 'active'
    })

    // Step 5: Perform initial sync
    await performInitialSync(integration)

    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        provider,
        status: 'active',
        chartOfAccounts: chartOfAccounts.length,
        nextSync: calculateNextSync(syncConfig.frequency)
      }
    })

  } catch (error) {
    console.error('Accounting setup failed:', error)
    return NextResponse.json({
      error: 'Setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

## Automated Features

### **🤖 AI-Powered Categorization**

```typescript
export class AICategorizationService {
  async categorizeExpense(expense: RawExpense, businessType: BusinessType): Promise<CategorizedExpense> {
    const prompt = this.buildCategorizationPrompt(expense, businessType)
    const aiResponse = await this.openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      functions: [{
        name: 'categorize_expense',
        parameters: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            confidence: { type: 'number' },
            business_percentage: { type: 'number' },
            deductible: { type: 'boolean' }
          }
        }
      }]
    })

    const categorization = JSON.parse(aiResponse.choices[0].message.function_call?.arguments || '{}')

    return {
      ...expense,
      category: categorization.category,
      business_percentage: categorization.business_percentage,
      deductible: categorization.deductible,
      confidence_score: categorization.confidence,
      ai_categorized: true
    }
  }
}
```

### **📊 Automated Reporting**

```typescript
export class AutomatedReportingService {
  async generateMonthlyReport(spaceId: string, month: string): Promise<BusinessReport> {
    const space = await getSpaceById(spaceId)
    const transactions = await getTransactionsForMonth(spaceId, month)

    const report = {
      business_type: space.businessType,
      period: month,
      revenue_summary: await this.calculateRevenueSummary(transactions, space.businessType),
      expense_summary: await this.calculateExpenseSummary(transactions, space.businessType),
      profit_analysis: await this.calculateProfitAnalysis(transactions, space.businessType),
      tax_estimates: await this.calculateTaxEstimates(transactions, space.location),
      recommendations: await this.generateRecommendations(transactions, space.businessType)
    }

    // Auto-send to accounting software
    await this.syncReportToAccounting(spaceId, report)

    // Generate tax documents if needed
    if (this.isQuarterEnd(month)) {
      await this.generateQuarterlyTaxDocuments(spaceId, report)
    }

    return report
  }
}
```

## Troubleshooting

### **Common Integration Issues**

#### **QuickBooks Connection Errors**
```typescript
async function handleQuickBooksError(error: QuickBooksError, spaceId: string) {
  switch (error.code) {
    case 'INVALID_TOKEN':
      await this.refreshQuickBooksToken(spaceId)
      break
    case 'RATE_LIMIT_EXCEEDED':
      await this.scheduleRetry(spaceId, '15_minutes')
      break
    case 'INVALID_ACCOUNT':
      await this.notifyUserReconnection(spaceId)
      break
    default:
      await this.logError(spaceId, error)
  }
}
```

#### **Business-Type-Specific Issues**

**Physical Service:**
- Job costing mismatch - Verify material costs per job
- Invoice timing - Milestone payments trigger correct entries
- Equipment depreciation - Proper asset tracking

**AI Products:**
- Multi-platform revenue - Daily sales consolidation
- Zero COGS - Handle AI-generated designs correctly
- Platform fee allocation - Different commission structures

**Content Creator:**
- 1099 preparation - Creator payments >$600
- Subscription vs tip revenue - Correct categorization
- International payments - Tax implications

---

## Real-World Examples

### **Asphalt Company Setup**
```json
{
  "business_type": "physical_service",
  "integration": "quickbooks_online",
  "features_enabled": {
    "job_costing": true,
    "invoice_automation": true,
    "equipment_tracking": true,
    "mileage_tracking": true
  },
  "chart_of_accounts": {
    "revenue": ["Service Revenue", "Material Sales"],
    "expenses": ["Materials", "Labor", "Equipment", "Fuel"],
    "assets": ["Equipment", "Vehicles", "Tools"]
  }
}
```

### **AI Product Designer Setup**
```json
{
  "business_type": "ai_generated_products",
  "integration": "xero",
  "features_enabled": {
    "multi_platform_sync": true,
    "design_profitability": true,
    "zero_inventory_tracking": true
  },
  "sales_channels": ["cafepress", "etsy", "amazon_kdp", "shopify"]
}
```

---

## Summary

This accounting integration system provides:

✅ **Business-Type Optimization** - Relevant accounting features per business model
✅ **Automated Data Mapping** - Smart categorization based on business context
✅ **Real-Time Sync** - Critical transactions sync immediately
✅ **Tax Optimization** - AI-powered deduction analysis
✅ **Multi-Platform Support** - Works with all major accounting software
✅ **Error Handling** - Robust retry logic and notifications

**Result**: Business owners focus on their work while accounting happens automatically, optimized for their specific industry and business model. 🚀

---

*Last Updated: December 2024*
*Platform: KenDev Commerce Platform*
*Integration Partners: Merge.dev, QuickBooks, Xero, FreshBooks*
