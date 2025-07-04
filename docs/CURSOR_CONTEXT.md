# Cursor Context: Multi-Tenant AI-Powered Commerce Platform

## 🎯 Project Overview
This is a **multi-tenant AI-powered commerce platform** built on **Payload CMS 3.0** with **PostgreSQL**, supporting businesses like dumpster rental, salons, cactus farms, etc. Each tenant gets their own subdomain (e.g., `hays.kendev.co`) with isolated data and custom branding.

## 📍 Current Status
- ✅ **Phase 1**: Foundation setup complete (Payload website template + PostgreSQL)
- ✅ **Phase 2**: Multi-tenancy 80% complete (Tenants & Users collections, middleware, utilities)
- 🔄 **Next**: Complete Phase 2 tenant layouts, then Phase 3 commerce layer

## 🏗️ Architecture Implemented
- **Multi-tenancy**: Subdomain routing via `src/middleware.ts`
- **Collections**: `Tenants` (business config) + enhanced `Users` (roles: super-admin, tenant-admin, site-agent, customer)
- **Database**: PostgreSQL on `74.208.87.243:5432` (kendev.co server)
- **Routing**: `tenant/[subdomain]` pattern for tenant-specific content

## 🚨 Environment Setup Required
Create `.env` file with:
```env
DATABASE_URI=postgresql://spaces_commerce_user:SpacesCommerce2024!@74.208.87.243:5432/spaces_commerce
PAYLOAD_SECRET=74e255eeb8b32e9f9c05307520b4325f673054860fe79a2b8c2b315ebb7294ca
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
```

## 🎯 Immediate Next Tasks
1. **Complete Phase 2**: Create tenant-specific page layouts in `src/app/(frontend)/tenant/[subdomain]/`
2. **Start Phase 3**: Add `Products`, `Categories`, `Orders` collections with tenant scoping
3. **Test**: Multi-tenant data isolation and subdomain routing

## 📁 Key Files
- `src/collections/Tenants.ts` - Core tenant management
- `src/collections/Users/index.ts` - Multi-role user system
- `src/utilities/getTenant.ts` - Tenant context helpers
- `src/middleware.ts` - Subdomain routing
- `PROGRESS.md` - Detailed status tracking

## 🚀 Quick Start
```bash
npm install
npm run dev  # Test database connection
```

**Goal**: Build the platform described in `prompt.md` with Hays Cactus Farm as the primary use case. Focus on multi-tenant isolation, commerce capabilities, and eventually Spaces communication, CRM, VAPI voice, and N8N workflows.
