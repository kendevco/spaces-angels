# Web Capture & Spirit of the Endeavor System

## Overview

This system implements the **"Spirit of the Endeavor"** concept - where each business site is paired with one human as the ultimate egalitarian system. It includes:

1. **Nuclear Database Reset** - Bulletproof database management
2. **GoFullPage Integration** - Capture web content into tenant channels
3. **Business Agent Spirits** - AI embodiment of human business partners
4. **Widget System** - Extensible message widgets for rich interactions

## 🔥 Nuclear Database Reset

### Quick Start
```powershell
# Complete nuclear reset with new tenant
.\scripts\nuke-and-rebuild.ps1 -TenantName "Maria's Creative Studio" -BusinessType "creative" -Theme "creative"

# Force reset without confirmation (be careful!)
.\scripts\nuke-and-rebuild.ps1 -Force
```

### What It Does
1. **💣 Nuclear Database Reset** - Complete wipe via `/api/reseed`
2. **🔄 Schema Regeneration** - `pnpm run build`
3. **🚀 Fresh Tenant Provisioning** - Via `/api/tenant-control`
4. **✅ Ready for Development** - Pristine database with first tenant

### Database Operations
- **Additive**: `{"mode": "additive"}` - Safe content addition
- **Reset**: `{"mode": "reset"}` - Complete database wipe
- **Clean**: `{"mode": "clean"}` - Clean tenant-specific data

## 🌐 GoFullPage Integration

### API Endpoint: `/api/web-capture`

**Capture web content from anywhere and plop into channels!**

```javascript
// Browser Extension Integration
async function captureToSpaces(url, title, imageUrl) {
  const response = await fetch('/api/web-capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      title,
      captureType: 'full_page',
      source: 'gofullpage',
      imageUrl,
      spaceId: 'your-space-id',
      channelId: 'web-research',
      tags: ['research', 'inspiration']
    })
  })
  return response.json()
}
```

### Supported Capture Types
- **Screenshot** - Quick page captures
- **Full Page** - Complete page screenshots
- **PDF** - PDF exports
- **Selection** - Selected content areas
- **Article** - Extracted article content

### Sources
- **GoFullPage** - [Edge Extension](https://microsoftedge.microsoft.com/addons/detail/gofullpage-full-page-sc/hfaciehifhdcgoolaejkoncjciicbemc)
- **Browser Extensions** - Custom integrations
- **Automation** - Scripted captures
- **Manual** - Direct uploads

## 👻 Spirit of the Endeavor

### BusinessAgent Collection

Each business has a **Spirit** - the AI embodiment of the human behind the endeavor.

```typescript
// Example: Maria's Creative Spirit
{
  name: "Maria's Creative Spirit",
  spiritType: "primary",
  humanPartner: "maria-user-id",
  personality: {
    coreValues: "Authentic creativity, empowering others through design, sustainable practices",
    communicationStyle: "creative",
    brandVoice: "Always encouraging, mentions artistic inspiration, emphasizes uniqueness"
  },
  businessKnowledge: {
    services: [
      {
        name: "Brand Identity Design",
        spiritNotes: "I pour my heart into each logo, seeing the soul of the business"
      }
    ]
  }
}
```

### Spirit Types
- **Primary** - Overall business spirit
- **Service** - Specific service line spirits
- **Product** - Product-focused spirits
- **Creative** - Creative endeavor spirits
- **Community** - Community-building spirits
- **Support** - Customer support spirits

### The Ultimate Egalitarian System

**Maria's Choice:**
- **Option A**: List all services together under one spirit
- **Option B**: Separate branded endeavor for each activity

Each endeavor gets its own Spirit (BusinessAgent) that embodies the human's passion and expertise for that specific area.

## 🧩 Widget System

### Pluggable Architecture

```typescript
// Register new widget types
WidgetRegistry.register('web_capture', WebCaptureWidget)
WidgetRegistry.register('payment_collection', PaymentCollectionWidget)
WidgetRegistry.register('my_custom_widget', MyCustomWidget)
```

### Built-in Widgets

#### 1. Web Capture Widget
- Rich web content previews
- Image/PDF downloads
- Source attribution (GoFullPage, etc.)
- Channel routing

#### 2. Payment Collection Widget
- Emergency payment requests
- Progress tracking
- Multi-amount options
- Secure payment processing

#### 3. Address Verification Widget
- Address restriction checking
- Compliance verification
- Risk assessment display

### Creating Custom Widgets

```typescript
export const MyCustomWidget: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="bg-[#2f3136] border border-[#42464d] rounded-lg p-4">
      {/* Your custom widget UI */}
    </div>
  )
}

// Register it
WidgetRegistry.register('my_custom_widget', MyCustomWidget)
```

## 🏗️ Architecture Benefits

### 1. Tenant Flexibility
- **Maria's Studio**: All services under one roof
- **Joe's Empire**: Separate pizza, catering, events spirits

### 2. Human-AI Partnership
- AI carries forward human passion
- Authentic business personality
- Seamless human handoffs

### 3. Content Capture Ecosystem
- Capture inspiration anywhere
- Route to relevant channels
- Build knowledge base organically

### 4. Rapid Development
- Nuclear reset for clean iterations
- Pluggable widget system
- Spirit-driven AI interactions

## 🚀 Usage Examples

### Setting Up Maria's Creative Studio

```powershell
# 1. Nuclear reset
.\scripts\nuke-and-rebuild.ps1 -TenantName "Maria's Creative Studio" -BusinessType "creative"

# 2. Access at: https://marias-creative-studio.spaces.kendev.co
# 3. Create Maria's Spirit in admin panel
# 4. Configure web capture for design inspiration
```

### Capturing Design Inspiration

```javascript
// From GoFullPage or custom extension
fetch('/api/web-capture', {
  method: 'POST',
  body: JSON.stringify({
    url: 'https://dribbble.com/amazing-design',
    title: 'Amazing Logo Design',
    captureType: 'screenshot',
    source: 'gofullpage',
    imageUrl: 'capture-url-here',
    spaceId: 'marias-space-id',
    channelId: 'design-inspiration',
    tags: ['logos', 'inspiration', 'branding']
  })
})
```

### Spirit Interaction

The Spirit automatically handles:
- Customer inquiries with Maria's personality
- Service recommendations based on business knowledge
- Handoff to Maria when needed
- Authentic brand voice in all communications

## 🎯 Core Business Problem Solved

**For displaced persons (including sex offenders):**
- Find compliant housing through address verification
- Collect money for newly displaced persons
- Simple enough for AI agent to solve with Python

**For all businesses:**
- Authentic human presence at scale
- Rich content capture and organization
- Flexible multi-endeavor architecture
- Rapid iteration and deployment

## 🔮 Future Enhancements

1. **AI Agent Python Scripts** - Auto-solve common problems
2. **Advanced Spirit Personalities** - More nuanced AI behaviors
3. **Multi-Modal Capture** - Video, audio, AR content
4. **Cross-Tenant Spirit Collaboration** - Spirits helping other spirits
5. **Automated Compliance Checking** - Smart address/business verification

This system provides the foundation for the ultimate egalitarian business platform where every human can have their authentic spirit represented digitally while maintaining full control and flexibility over their endeavors.
