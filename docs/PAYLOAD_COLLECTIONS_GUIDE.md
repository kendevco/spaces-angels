# Payload Collections Architecture Guide

## Overview
This guide provides comprehensive documentation for the **KenDev.Co Spaces Professional AI Business Platform** collections. The architecture supports **multi-tenant business operations** with **dedicated BusinessAgent partners** and **Leo platform coordination**.

**Architecture Principles:**
- **Multi-tenant isolation** with tenant-scoped access controls
- **BusinessAgent partnership model** where each person can have multiple agents for different endeavors
- **Professional platform operations** with transparent, fair partnerships
- **Federation-ready** for cross-platform business collaboration
- **Template-driven** dynamic site generation from business logic

## Environment Setup

### Required Environment Variables
```bash
# Database Configuration
DATABASE_URI=postgresql://spaces_commerce_user:SpacesCommerce2024!@localhost:5432/spaces_commerce

# Payload CMS Core
PAYLOAD_SECRET=74e255eeb8b32e9f9c05307520b4325f673054860fe79a2b8c2b315ebb7294ca
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# AI Services (BusinessAgents & Leo)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Business Operations
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Communication & Automation
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
VAPI_API_KEY=...
N8N_WEBHOOK_URL=http://localhost:5678/webhook/...

# Federation
BLUESKY_HANDLE=your-business@bsky.social
BLUESKY_PASSWORD=your-app-password

# Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

## Collections Architecture Overview

**Current Implementation Status**: ✅ **ACTIVE & DEPLOYED**

### **Phase 1: Platform Foundation** ✅ **IMPLEMENTED**
Core collections for multi-tenant platform operations
- ✅ **Tenants** - Business tenant isolation and configuration  
- ✅ **Users** - Platform users with tenant-scoped access
- ✅ **TenantMemberships** - User-tenant relationship management
- ✅ **Media** - File storage with tenant isolation

### **Phase 2: Communication & Collaboration** ✅ **IMPLEMENTED**
Real-time business communication and workspace management
- ✅ **Messages** - Universal messaging system for all communications
- ✅ **Spaces** - Business collaboration workspaces
- ✅ **SpaceMemberships** - Space access and role management
- ✅ **ChannelManagement** - Virtual channel configuration and routing
- ✅ **WebChatSessions** - Customer support automation

### **Phase 3: Business Operations** ✅ **IMPLEMENTED**
E-commerce and professional business management
- ✅ **Products** - Business product catalogs
- ✅ **Orders** - Transaction and fulfillment management
- ✅ **Invoices** - Professional billing system
- ✅ **Donations** - Payment collection and processing
- ✅ **Appointments** - Booking and scheduling system
- ✅ **Contacts** - Customer and lead management
- ✅ **Documents** - Business document management

### **Phase 4: Content Management** ✅ **IMPLEMENTED**
Professional content and site management
- ✅ **Pages** - Template-driven business site content
- ✅ **Posts** - Business blog and content publishing
- ✅ **Categories** - Content organization and taxonomy
- ✅ **Forms** - Dynamic form collection
- ✅ **Form-Submissions** - Form response management

### **Phase 5: Integration & Automation** ✅ **IMPLEMENTED**
Cross-platform communication and third-party integrations
- ✅ **SocialMediaBots** - Cross-platform communication automation
- ✅ **LinkedAccounts** - Third-party service integrations
- ✅ **Redirects** - URL management and SEO
- ✅ **Search** - Platform-wide search functionality

### **Future Phase: AI Partnership System** 🚧 **PLANNED**
BusinessAgent partnership and AI coordination (Leo + tenant agents)
- 🚧 **BusinessAgents** - AI partners for business endeavors *(in development)*
- 🚧 **AI Integration APIs** - Automated business assistance *(planned)*

---

## **Quick Navigation Index**

### **🏗️ Core Platform (Always Start Here)**
1. [**Tenants**](#1-tenants-collection) - Multi-tenant business isolation
2. [**Users**](#2-users-collection) - Platform user management  
3. [**TenantMemberships**](#3-tenantmemberships-collection) - User-tenant relationships
4. [**Media**](#4-media-collection) - File storage and management

### **💬 Communication System**
5. [**Messages**](#5-messages-collection) - Universal messaging interface
6. [**Spaces**](#6-spaces-collection) - Business collaboration workspaces
7. [**SpaceMemberships**](#7-spacememberships-collection) - Space access control
8. [**ChannelManagement**](#8-channelmanagement-collection) - Virtual channels
9. [**WebChatSessions**](#9-webchatsessions-collection) - Customer support

### **💼 Business Operations**
10. [**Products**](#10-products-collection) - Product catalog management
11. [**Orders**](#11-orders-collection) - Transaction processing
12. [**Invoices**](#12-invoices-collection) - Professional billing
13. [**Donations**](#13-donations-collection) - Payment collection
14. [**Appointments**](#14-appointments-collection) - Scheduling system
15. [**Contacts**](#15-contacts-collection) - Customer relationship management
16. [**Documents**](#16-documents-collection) - Business document storage

### **📝 Content & Publishing**
17. [**Pages**](#17-pages-collection) - Site content management
18. [**Posts**](#18-posts-collection) - Blog and content publishing
19. [**Categories**](#19-categories-collection) - Content organization
20. [**Forms**](#20-forms-collection) - Dynamic form creation
21. [**Form-Submissions**](#21-form-submissions-collection) - Form response handling

### **🔗 Integration & Automation**  
22. [**SocialMediaBots**](#22-socialmediabots-collection) - Cross-platform automation
23. [**LinkedAccounts**](#23-linkedaccounts-collection) - Third-party integrations
24. [**Redirects**](#24-redirects-collection) - URL management
25. [**Search**](#25-search-collection) - Platform search functionality

---

## **Collection Summary Table**

For efficient AI and human reference, here's the complete collection mapping:

| Collection | Status | Purpose | Key Relationships | File Location |
|------------|--------|---------|-------------------|---------------|
| **tenants** | ✅ | Multi-tenant isolation | → users, tenantMemberships | `src/collections/Tenants.ts` |
| **users** | ✅ | Platform users | → tenants, tenantMemberships | `src/collections/Users.ts` |
| **tenantMemberships** | ✅ | User-tenant relationships | users ↔ tenants | `src/collections/TenantMemberships.ts` |
| **spaceMemberships** | ✅ | Space access control | users ↔ spaces | `src/collections/SpaceMemberships.ts` |
| **messages** | ✅ | Universal messaging | → users, spaces | `src/collections/Messages.ts` |
| **spaces** | ✅ | Business workspaces | → tenants, spaceMemberships | `src/collections/Spaces.ts` |
| **channelManagement** | ✅ | Virtual channels | → spaces | `src/collections/ChannelManagement.ts` |
| **webChatSessions** | ✅ | Customer support | → contacts, users | `src/collections/WebChatSessions.ts` |
| **products** | ✅ | Product catalog | → categories, media | `src/collections/Products.ts` |
| **orders** | ✅ | Transaction processing | → products, users | `src/collections/Orders.ts` |
| **invoices** | ✅ | Professional billing | → orders, users | `src/collections/Invoices.ts` |
| **donations** | ✅ | Payment collection | → users | `src/collections/Donations.ts` |
| **appointments** | ✅ | Scheduling system | → users, contacts | `src/collections/Appointments.ts` |
| **contacts** | ✅ | Customer management | → tenants | `src/collections/Contacts.ts` |
| **documents** | ✅ | Document storage | → users, spaces | `src/collections/Documents.ts` |
| **pages** | ✅ | Site content | → media, categories | `src/collections/Pages.ts` |
| **posts** | ✅ | Blog publishing | → media, categories, users | `src/collections/Posts.ts` |
| **categories** | ✅ | Content taxonomy | → pages, posts, products | `src/collections/Categories.ts` |
| **media** | ✅ | File management | → tenants, users | `src/collections/Media.ts` |
| **forms** | ✅ | Dynamic forms | → pages | `src/collections/Forms.ts` |
| **form-submissions** | ✅ | Form responses | → forms | `src/collections/FormSubmissions.ts` |
| **socialMediaBots** | ✅ | Cross-platform automation | → linkedAccounts | `src/collections/SocialMediaBots.ts` |
| **linkedAccounts** | ✅ | Third-party integrations | → users, tenants | `src/collections/LinkedAccounts.ts` |
| **redirects** | ✅ | URL management | → pages | `src/collections/Redirects.ts` |
| **search** | ✅ | Platform search | Global content index | `src/collections/Search.ts` |

### **System Collections** (Auto-managed)
| Collection | Purpose | Notes |
|------------|---------|--------|
| **payload-jobs** | Background task queue | Automated system management |
| **payload-locked-documents** | Document locking | Prevents concurrent edits |
| **payload-preferences** | User preferences | Admin panel customization |
| **payload-migrations** | Database versioning | Schema change tracking |

---

## **Architecture Patterns & Standards**

### **Multi-Tenant Access Control Pattern**
All business collections implement this standard pattern:

```typescript
access: {
  read: ({ req }) => {
    if (req.user?.globalRole === 'super_admin') return true
    const tenantId = typeof req.user?.tenant === 'object' ? req.user?.tenant?.id : req.user?.tenant
    return tenantId ? { tenant: { equals: tenantId } } : false
  },
  // ... similar for create, update, delete
}
```

### **Relationship Naming Conventions**
- **Tenant Association**: `tenant` field linking to tenants collection
- **User Association**: `author`, `owner`, `creator`, or `assignedTo` depending on context
- **Cross-Collection**: Use descriptive names (`product`, `customer`, `space`)
- **Self-Reference**: `parent` for hierarchical relationships

### **Field Naming Conventions**
- **Status Fields**: `status`, `isActive`, `isPublished`
- **Metadata**: `createdAt`, `updatedAt`, `deletedAt`
- **Content**: `title`, `name`, `description`, `content`
- **References**: Use full collection name (`userId`, `tenantId`, `spaceId`)

### **Hook Pattern for Tenant Assignment**
```typescript
hooks: {
  beforeChange: [
    ({ data, req }) => {
      if (req.user?.tenant && !data.tenant) {
        data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
      }
      return data
    },
  ],
}
```

---

## **Maintenance Guidelines**

### **For AI Agents**
- Always check collection status (✅ vs 🚧) before referencing
- Use the collection summary table for quick relationship mapping
- Follow standard access control patterns for new collections
- Reference this guide as the source of truth for architecture

### **For Human Developers**
- Update status indicators when implementing new collections
- Follow naming conventions strictly for consistency
- Test multi-tenant isolation for all new collections
- Keep this guide synchronized with actual implementation
- Use the navigation index for quick access to specific collections

### **Update Checklist**
When adding new collections:
- [ ] Add to payload.config.ts collections array
- [ ] Implement standard multi-tenant access controls
- [ ] Add tenant field and beforeChange hook
- [ ] Update collection summary table
- [ ] Add to appropriate phase in collections overview
- [ ] Update navigation index with anchor links
- [ ] Generate TypeScript types with `pnpm run generate:types`

This guide serves as **decompressed check bits** for the entire platform architecture, enabling efficient maintenance and extension while preserving the professional multi-tenant business platform vision. 🎯

This architecture provides a **professional AI business platform** where every business can have dedicated AI partners while maintaining **transparent, fair, and scalable operations** coordinated by Leo with **Jason Statham efficiency**. 🚀 