# Getting Started with Spaces Commerce Platform

Welcome to **Spaces Commerce** - the world's first federated AI-powered business operating system! This guide will walk you through setting up your own multi-tenant business platform with AT Protocol federation and AI agents.

## 🎯 **What You'll Build**

By the end of this guide, you'll have:
- ✅ A running multi-tenant business platform
- ✅ Business AI agents for each tenant
- ✅ AT Protocol federation with BlueSky
- ✅ Universal knowledge management system
- ✅ Multiple business types configured (cactus farm, equipment rental, etc.)

## 📋 **Prerequisites**

### System Requirements
- **Node.js** 18.0 or higher
- **PostgreSQL** 12.0 or higher
- **Git** for version control
- **Domain name** with wildcard DNS support (for multi-tenancy)

### Required Accounts
- **OpenAI API** account (for AI agents)
- **BlueSky** account (for federation)
- **Database hosting** (local PostgreSQL or cloud provider)

## 🚀 **Step 1: Installation**

### Clone the Repository
```bash
git clone https://github.com/your-org/spaces-commerce.git
cd spaces-commerce
```

### Install Dependencies
```bash
# Using npm
npm install

# Or using pnpm (recommended)
pnpm install
```

## 🔧 **Step 2: Environment Configuration**

### Create Environment File
```bash
cp .env.example .env
```

### Essential Environment Variables
```env
# === DATABASE CONFIGURATION ===
DATABASE_URI=postgresql://username:password@localhost:5432/spaces_commerce

# === PAYLOAD CMS CONFIGURATION ===
PAYLOAD_SECRET=your-secure-64-character-secret-key-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# === AT PROTOCOL & FEDERATION ===
BLUESKY_HANDLE=your-business@bsky.social
BLUESKY_PASSWORD=your-app-password

# === AI SERVICES ===
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# === MULTI-TENANT CONFIGURATION ===
TENANT_DOMAIN=yourdomain.com
TENANT_SUBDOMAIN_PATTERN={tenant}.yourdomain.com
```

### Generate Secure Keys
```bash
# Generate a secure 64-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🗄️ **Step 3: Database Setup**

### Local PostgreSQL Setup
```bash
# Create database
createdb spaces_commerce

# Create user
psql -c "CREATE USER spaces_user WITH ENCRYPTED PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE spaces_commerce TO spaces_user;"
```

### Test Database Connection
```bash
npm run db:test
```

## 🏃‍♂️ **Step 4: First Run**

### Start Development Server
```bash
npm run dev
```

### Access the Admin Panel
1. Visit `http://localhost:3000/admin`
2. Create your first admin user
3. You'll see the Payload CMS admin interface

## 🏢 **Step 5: Create Your First Tenant**

### Navigate to Tenants Collection
1. In the admin panel, go to **Collections > Tenants**
2. Click **Create New**

### Configure Your First Business
```json
{
  "name": "Hays Cactus Farm",
  "subdomain": "hays",
  "businessType": "agriculture",
  "status": "active",
  "features": {
    "ecommerce": true,
    "spaces": true,
    "ai_agent": true,
    "federation": true
  },
  "branding": {
    "primaryColor": "#10B981",
    "logo": "upload-your-logo.png",
    "description": "Premium cactus plants and expert care advice"
  }
}
```

### Test Tenant Access
Visit `http://hays.localhost:3000` (you may need to add this to your `/etc/hosts` file for local development)

## 🤖 **Step 6: Activate AI Agents**

### Verify Business Agent Creation
```bash
# Check that Business Agent was created for your tenant
curl http://localhost:3000/api/federation/test
```

### Test AI Analysis
```bash
curl -X POST http://localhost:3000/api/federation/test \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Customer asking about cactus care in winter",
    "tenant": {"name": "Hays Cactus Farm", "businessType": "agriculture"},
    "action": "analyze"
  }'
```

## 🌐 **Step 7: Federation Setup**

### BlueSky Integration
1. Create a BlueSky account for your business
2. Generate an app password in BlueSky settings
3. Add credentials to your `.env` file
4. Test federation:

```bash
curl -X POST http://localhost:3000/api/federation/test \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello from the federated business network!",
    "action": "federate"
  }'
```

## 🎨 **Step 8: Customize Your Business**

### Add Your First Product
1. Go to **Collections > Products**
2. Create a product relevant to your business type:

```json
{
  "name": "Golden Barrel Cactus",
  "type": "physical",
  "price": 2999,
  "inventory": 50,
  "businessContext": {
    "careLevel": "beginner",
    "lightRequirement": "full_sun",
    "wateringFrequency": "monthly"
  }
}
```

### Create Knowledge Articles
1. Go to **Collections > Messages**
2. Add business knowledge:

```json
{
  "type": "knowledge_article",
  "title": "Winter Cactus Care Guide",
  "content": "During winter months, reduce watering frequency...",
  "metadata": {
    "category": "plant_care",
    "season": "winter",
    "difficulty": "beginner"
  }
}
```

## 🧪 **Step 9: Test Federation**

### Verify Your Tenant is Discoverable
```bash
# Test AT Protocol record creation
curl http://localhost:3000/api/federation/discover?businessType=agriculture
```

### Cross-Tenant Communication
1. Create a second tenant (e.g., equipment rental)
2. Test AI agent collaboration:

```bash
curl -X POST http://localhost:3000/api/ai-bus/collaborate \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Who has experience with plant equipment?",
    "fromTenant": "hays-cactus-farm"
  }'
```

## 🚀 **Step 10: Production Deployment**

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Configure Wildcard DNS
Add these DNS records to your domain:
```
A     yourdomain.com          → your-vercel-ip
CNAME *.yourdomain.com        → yourdomain.com
```

### Test Production Federation
```bash
curl https://api.yourdomain.com/federation/test
```

## ✅ **Verification Checklist**

- [ ] Admin panel accessible at `/admin`
- [ ] First tenant created and accessible via subdomain
- [ ] Business AI agent responding to business queries
- [ ] AT Protocol records being created
- [ ] BlueSky federation posting successfully
- [ ] Multi-tenant isolation working
- [ ] Knowledge management operational
- [ ] Product/service catalog functional

## 🎉 **Success! What's Next?**

Congratulations! You now have a fully operational federated business platform. Here's what to explore next:

### **Immediate Actions**
1. **Invite team members** to your tenant
2. **Configure additional business types** 
3. **Set up automated workflows**
4. **Connect additional AI services**

### **Advanced Features**
1. **Voice AI integration** (VAPI)
2. **Workflow automation** (N8N)
3. **Advanced analytics** and business intelligence
4. **Custom AI agent behaviors**

### **Community & Support**
- Join our [GitHub Discussions](https://github.com/your-org/spaces-commerce/discussions)
- Read the [complete documentation](./docs/)
- Connect with the [AT Protocol community](https://atproto.com/)

## 🔧 **Troubleshooting**

### Common Issues

**"Database connection failed"**
- Verify PostgreSQL is running
- Check DATABASE_URI format
- Ensure user has proper permissions

**"Tenant not found"**
- Check subdomain configuration
- Verify DNS/hosts file setup
- Confirm tenant status is 'active'

**"AI agent not responding"**
- Verify OpenAI API key
- Check API rate limits
- Review logs: `npm run logs`

**"Federation not working"**
- Confirm BlueSky credentials
- Check AT Protocol service status
- Verify network connectivity

### Get Help
- **Issues**: [GitHub Issues](https://github.com/your-org/spaces-commerce/issues)
- **Documentation**: [Full Docs](./docs/)
- **Community**: [Discussions](https://github.com/your-org/spaces-commerce/discussions)

---

**🎊 Welcome to the federated future of business!** You're now part of a network where small businesses can collaborate, share knowledge, and grow together while maintaining their independence and data sovereignty. 