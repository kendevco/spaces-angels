# Tenant Control System - "Commerce Studio"

The Spaces Tenant Control System provides rapid provisioning, management, and deprovisioning of tenant sites. Think of it as a "Commerce Studio" - each tenant gets their own professional space that can be quickly configured to monetize any service, sale, rental, or work opportunity.

## Overview

This system allows you to:
- **Provision** new tenant sites in seconds
- **Manage** existing tenant configurations
- **Preview** tenant sites before going live
- **Deprovision** tenants when needed
- **Monitor** the health and status of all tenants

Each tenant gets their own subdomain at `tenant-slug.spaces.kendev.co` and can be configured with different business types, themes, and features.

## Access Points

### 1. Web Interface
Access the control panel at: `http://localhost:3000/tenant-control`

### 2. API Endpoint
Direct API access: `POST /api/tenant-control`

### 3. Command Line Tools
- **Node.js**: `node scripts/provision-tenant.js`
- **PowerShell**: `.\scripts\provision-tenant.ps1`

## Quick Start

### Provision Your First Tenant

**Via Web Interface:**
1. Go to `http://localhost:3000/tenant-control`
2. Click "Provision New Tenant"
3. Fill in the form and click "Provision Tenant"

**Via Command Line (PowerShell):**
```powershell
.\scripts\provision-tenant.ps1 -Action provision -Name "Joe's Pizza" -BusinessType pizza -Theme business
```

**Via Command Line (Node.js):**
```bash
node scripts/provision-tenant.js provision "Joe's Pizza" pizza business
```

**Via API:**
```javascript
fetch('/api/tenant-control', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'provision',
    tenantData: {
      name: "Joe's Pizza",
      slug: "joes-pizza",
      businessType: "pizza",
      theme: "business"
    }
  })
})
```

## Business Types & Templates

The system supports different business types, each with tailored features:

### Pizza Shop (`pizza`)
- Automatically generates pizza menu with size variants
- Category setup for pizzas, appetizers, drinks
- Order management integration
- Delivery/pickup options

### Restaurant (`restaurant`)
- Full menu management system
- Table reservation system
- Multi-category food organization
- Restaurant-specific themes

### Content Creator (`content_creator`)
- Merchandise/schwag store
- Blog/content management
- Social media integration
- Fan engagement tools

### Cactus Farm (`cactus_farm`)
- Plant catalog with care instructions
- Inventory management for different pot sizes
- Care guide integration
- Seasonal availability tracking

### Retail Store (`retail`)
- General product catalog
- Inventory management
- Category organization
- E-commerce features

### Service Business (`service`)
- Service listing and booking
- Appointment scheduling
- Client management
- Service portfolio

### General (`general`)
- Basic business presence
- Contact forms
- About/services pages
- Flexible configuration

## Themes

### Default
- Clean, professional design
- Suitable for most business types
- Blue and white color scheme

### Business
- Corporate-focused design
- Professional color palette
- Optimized for B2B interactions

### Creative
- Modern, artistic design
- Vibrant colors
- Perfect for creative professionals

### Minimal
- Ultra-clean design
- Maximum white space
- Focus on content

## Features

### Rapid Provisioning
- **Sub-30 second** tenant creation
- Automatic subdomain setup
- Default content seeding
- Database isolation

### Configuration Management
- Theme switching
- Feature toggles
- Business-specific settings
- Custom domain support

### Preview System
- Live preview before deployment
- Safe testing environment
- Configuration validation
- Rollback capabilities

### Monitoring
- Tenant health checks
- Performance metrics
- Error tracking
- Usage analytics

## API Reference

### Provision Tenant
```http
POST /api/tenant-control
Content-Type: application/json

{
  "action": "provision",
  "tenantData": {
    "name": "Business Name",
    "slug": "business-slug",
    "businessType": "pizza|restaurant|retail|service|content_creator|cactus_farm|general",
    "theme": "default|business|creative|minimal",
    "features": ["basic", "ecommerce", "booking"]
  }
}
```

### List Tenants
```http
POST /api/tenant-control
Content-Type: application/json

{
  "action": "list"
}
```

### Preview Tenant
```http
POST /api/tenant-control
Content-Type: application/json

{
  "action": "preview",
  "tenantId": "tenant-id-here"
}
```

### Configure Tenant
```http
POST /api/tenant-control
Content-Type: application/json

{
  "action": "configure",
  "tenantId": "tenant-id-here",
  "configuration": {
    "theme": "business",
    "features": ["ecommerce", "booking"],
    "customDomain": "example.com"
  }
}
```

### Deprovision Tenant
```http
POST /api/tenant-control
Content-Type: application/json

{
  "action": "deprovision",
  "tenantId": "tenant-id-here"
}
```

### Get Tenant Status
```http
POST /api/tenant-control
Content-Type: application/json

{
  "action": "status",
  "tenantId": "tenant-id-here"
}
```

## Command Line Reference

### PowerShell Commands

**Provision a tenant:**
```powershell
.\scripts\provision-tenant.ps1 -Action provision -Name "Business Name" -BusinessType pizza -Theme business
```

**List all tenants:**
```powershell
.\scripts\provision-tenant.ps1 -Action list
```

**Deprovision a tenant:**
```powershell
.\scripts\provision-tenant.ps1 -Action deprovision -TenantId "tenant-id"
```

### Node.js Commands

**Provision a tenant:**
```bash
node scripts/provision-tenant.js provision "Business Name" pizza business
```

**List all tenants:**
```bash
node scripts/provision-tenant.js list
```

**Deprovision a tenant:**
```bash
node scripts/provision-tenant.js deprovision tenant-id
```

## Domain Management

### Subdomain Structure
- Primary: `tenant-slug.spaces.kendev.co`
- Preview: `preview-tenant-slug.spaces.kendev.co` (future)
- Admin: `admin-tenant-slug.spaces.kendev.co` (future)

### Custom Domains
1. Provision tenant with custom domain
2. Configure DNS records
3. SSL certificate provisioning (automatic)
4. Redirect setup

## Security & Isolation

### Database Isolation
- Each tenant has isolated data
- Tenant-specific access controls
- Cross-tenant data protection

### Authentication
- Tenant-specific user management
- Role-based permissions
- API key management

### Privacy
- GDPR compliance ready
- Data export capabilities
- Right to deletion support

## Monitoring & Analytics

### Tenant Health
- Uptime monitoring
- Performance metrics
- Error rate tracking
- Resource usage

### Business Metrics
- Traffic analytics
- Conversion tracking
- Revenue reporting
- User engagement

## Troubleshooting

### Common Issues

**Tenant not accessible:**
1. Check DNS propagation
2. Verify tenant status
3. Check SSL certificate
4. Review error logs

**Provisioning fails:**
1. Check database connectivity
2. Verify available resources
3. Review configuration
4. Check for conflicts

**Performance issues:**
1. Monitor resource usage
2. Check database queries
3. Review caching
4. Optimize content delivery

### Debug Commands

**Check tenant status:**
```bash
node scripts/provision-tenant.js status tenant-id
```

**List all tenants with details:**
```bash
node scripts/provision-tenant.js list --detailed
```

## Best Practices

### Naming Conventions
- Use clear, descriptive tenant names
- Keep slugs short and memorable
- Avoid special characters in slugs
- Use consistent business type classifications

### Resource Management
- Monitor tenant resource usage
- Set appropriate limits
- Regular cleanup of inactive tenants
- Backup critical tenant data

### Configuration Management
- Test configurations in preview mode
- Document custom settings
- Use version control for configurations
- Regular configuration audits

## Integration Examples

### Webhook Integration
```javascript
// Listen for tenant events
app.post('/webhook/tenant-events', (req, res) => {
  const { event, tenant } = req.body

  switch (event) {
    case 'tenant.provisioned':
      console.log(`New tenant: ${tenant.name}`)
      // Send welcome email, setup monitoring, etc.
      break

    case 'tenant.deprovisioned':
      console.log(`Tenant removed: ${tenant.name}`)
      // Cleanup external resources, notify billing, etc.
      break
  }
})
```

### External API Integration
```javascript
// Provision tenant from external system
async function provisionFromExternal(externalData) {
  const response = await fetch('/api/tenant-control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'provision',
      tenantData: {
        name: externalData.businessName,
        slug: generateSlug(externalData.businessName),
        businessType: mapBusinessType(externalData.industry),
        theme: selectTheme(externalData.preferences)
      }
    })
  })

  return response.json()
}
```

## Future Enhancements

### Planned Features
- Automatic scaling based on usage
- Multi-region deployment
- Advanced analytics dashboard
- Tenant migration tools
- Bulk operations
- Template marketplace

### API Improvements
- Async provisioning with webhooks
- Batch operations
- GraphQL support
- WebSocket real-time updates

## Emergency Procedures

### Tenant Down
1. Check system status
2. Verify DNS resolution
3. Check application logs
4. Restart tenant if needed
5. Notify tenant owner

### Data Recovery
1. Stop tenant operations
2. Identify backup point
3. Restore from backup
4. Verify data integrity
5. Resume operations

### Security Incident
1. Isolate affected tenant
2. Assess impact scope
3. Implement containment
4. Notify stakeholders
5. Document incident

---

## Quick Reference Card

**Provision:** `.\scripts\provision-tenant.ps1 provision "Name" type [theme]`
**List:** `.\scripts\provision-tenant.ps1 list`
**Preview:** Open `https://tenant-slug.spaces.kendev.co`
**Control Panel:** `http://localhost:3000/tenant-control`
**API:** `POST /api/tenant-control`

---

*This system is designed for rapid deployment and scaling - perfect for getting tenants online quickly while maintaining full control and flexibility.*
