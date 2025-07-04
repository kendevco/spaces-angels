# Federation Guide

## AT Protocol Integration with Spaces Commerce Platform

This guide explains how Spaces Commerce Platform implements federation through AT Protocol, enabling your business to connect with the broader federated network including BlueSky and other compatible platforms.

## What is Federation?

Federation in Spaces Commerce means your business data and interactions can be shared, discovered, and collaborated on across different platforms while maintaining data sovereignty. Every business interaction becomes an AT Protocol record that can be:

- **Discovered** by other businesses in your network
- **Cross-posted** to social platforms like BlueSky
- **Collaborated on** by AI agents across tenants
- **Preserved** in a decentralized, portable format

## Architecture Overview

```typescript
// Every business interaction = AT Protocol record
{
  $type: "co.kendev.spaces.message",
  did: "did:plc:hays-kendev-co-abc123",
  tenant: "hays-cactus-farm",
  text: "Customer inquiry about cactus care in winter",
  metadata: {
    businessType: "agriculture",
    intent: "customer_inquiry",
    pipedreamIndex: 0.52
  },
  federation: {
    discoverable: true,
    crossPostTo: ["app.bsky.feed.post"],
    audience: "business_network"
  }
}
```

## Setup Instructions

### 1. BlueSky Account Setup

Create a BlueSky account for your business:
1. Visit [bsky.app](https://bsky.app)
2. Create account with business handle (e.g., `hays-cactus-farm.bsky.social`)
3. Generate app password in Settings > App Passwords
4. Add credentials to your `.env` file:

```env
BLUESKY_HANDLE=your-business@bsky.social
BLUESKY_PASSWORD=your-app-password
```

### 2. Federation Service Configuration

The `ATProtocolService` handles all federation operations:

```typescript
// src/services/ATProtocolService.ts
export class ATProtocolService {
  async createRecord(data: BusinessRecord) {
    // Creates AT Protocol compatible record
    // Handles DID management
    // Enables cross-platform discovery
  }
  
  async crossPost(content: string, platforms: string[]) {
    // Posts to BlueSky and other federated platforms
  }
  
  async discover(query: DiscoveryQuery) {
    // Finds relevant businesses/content across network
  }
}
```

### 3. Testing Federation

Test your federation setup:

```bash
# Test AT Protocol record creation
curl http://localhost:3000/api/federation/test

# Test cross-posting to BlueSky
curl -X POST http://localhost:3000/api/federation/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello federated world!", "action": "federate"}'
```

## Business Benefits

### For Small Businesses
- **Network Effects**: Collaborate with other businesses
- **Knowledge Sharing**: Learn from industry peers
- **Customer Discovery**: Be found across platforms
- **Data Portability**: Never be locked into one platform

### For Platform Operators
- **Scalability**: Federation handles growth
- **Differentiation**: Unique federated capabilities
- **Community**: Join the open web movement
- **Future-Proof**: Built on open standards

## Advanced Features

### Cross-Tenant AI Collaboration

```typescript
// Business Agents can collaborate across businesses
const collaboration = await BusinessAgent.collaborateWithPeers(
  "Who has experience with plant pest control?"
);

// Returns federated knowledge from network
{
  sources: ["desert-plants-co", "garden-experts-llc"],
  insights: ["neem oil treatment", "beneficial insects"],
  confidence: 0.87
}
```

### Federated Knowledge Discovery

```typescript
// Discover relevant content across the network
const knowledge = await federationService.discover({
  businessType: "agriculture",
  topic: "winter_plant_care",
  geographic: "southwest_usa"
});
```

### Custom Federation Rules

Configure what gets federated per tenant:

```typescript
// In tenant configuration
{
  federation: {
    autoShare: ["knowledge_articles", "public_posts"],
    private: ["customer_data", "financial_records"],
    collaborationLevel: "industry_network",
    discoverabilitySettings: {
      businessDirectory: true,
      crossPlatformPosting: true,
      aiCollaboration: true
    }
  }
}
```

## Privacy & Security

### Data Sovereignty
- **You own your data** - federation doesn't mean giving up control
- **Selective sharing** - choose what to federate
- **Revocable access** - withdraw from federation at any time

### Security Measures
- **Encrypted communications** between federated nodes
- **DID-based authentication** prevents impersonation
- **Audit trails** for all federated interactions
- **Role-based federation** - control who can federate what

## Troubleshooting

### Common Issues

**"Federation not posting to BlueSky"**
- Verify BlueSky credentials in `.env`
- Check app password is correct
- Ensure handle format is correct

**"AT Protocol records not creating"**
- Check OpenAI API key for content processing
- Verify database connectivity
- Review federation service logs

**"Cross-tenant collaboration not working"**
- Confirm AI Bus is operational
- Check tenant federation settings
- Verify network connectivity

## What's Next?

The federation ecosystem is constantly growing. Future enhancements include:

- **Mastodon integration** for broader social federation
- **Business directory** for automatic discovery
- **Federated payments** using crypto protocols
- **Advanced AI collaboration** with specialized business agents

Join the federated future of business! 🚀 