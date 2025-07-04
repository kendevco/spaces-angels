# API Reference

## Spaces Commerce Platform API

This document covers the key API endpoints for the federated business platform, including federation, AI agents, and multi-tenant operations.

## Authentication

Most API endpoints require authentication via Payload CMS session or API key.

```bash
# Using session authentication
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/endpoint

# Using API key
curl -H "X-API-Key: YOUR_API_KEY" \
  http://localhost:3000/api/endpoint
```

## Federation API

### Test Federation System
```http
GET /api/federation/test
```

**Response:**
```json
{
  "status": "success",
  "federation": {
    "atProtocolRecords": 3,
    "blueskyPosts": 2,
    "federatedNetworks": 2
  },
  "aiAgents": {
    "BusinessAgentCount": 1,
    "pipedreamIndex": 0.5215,
    "suggestedActions": [
      "Create support ticket",
      "Search knowledge base",
      "Notify support team"
    ]
  },
  "aiCollaboration": {
    "crossTenantQueries": 1,
    "sharedKnowledge": [
      "Great tips for cactus care in winter!"
    ]
  }
}
```

### Create Federated Record
```http
POST /api/federation/test
Content-Type: application/json

{
  "message": "Customer inquiry about winter cactus care",
  "tenant": {
    "name": "Hays Cactus Farm",
    "businessType": "agriculture"
  },
  "action": "analyze"
}
```

**Response:**
```json
{
  "analysis": {
    "intent": "customer_support",
    "priority": "medium",
    "department": "plant_care",
    "pipedreamIndex": 0.67
  },
  "suggestedActions": [
    "Create support ticket",
    "Send care guide",
    "Schedule consultation"
  ],
  "federatedResponse": {
    "atRecord": "at://did:plc:hays-cactus-farm/co.kendev.spaces.message/abc123",
    "crossPost": "Winter cactus care: reduce watering, bright light! 🌵",
    "discoverable": true
  }
}
```

## AI Agent API

### Get Business Agent Status
```http
GET /api/ai-agents/{tenantId}/ceo/status
```

**Response:**
```json
{
  "agent": {
    "id": "ceo-hays-cactus-farm",
    "did": "did:plc:hays-kendev-co-ceo-001",
    "tenant": "hays-cactus-farm",
    "status": "active",
    "pipedreamIndex": 0.73,
    "lastActivity": "2024-01-15T10:30:00Z"
  },
  "metrics": {
    "responsesGenerated": 156,
    "federatedCollaborations": 12,
    "businessInsights": 8,
    "automatedActions": 23
  }
}
```

### Analyze Business Event
```http
POST /api/ai-agents/{tenantId}/ceo/analyze
Content-Type: application/json

{
  "event": {
    "type": "customer_inquiry",
    "content": "My cactus is turning yellow",
    "context": {
      "customerType": "repeat",
      "season": "winter",
      "productCategory": "succulents"
    }
  }
}
```

**Response:**
```json
{
  "analysis": {
    "intent": "urgent_plant_care",
    "confidence": 0.89,
    "category": "customer_retention_critical",
    "pipedreamIndex": 0.82
  },
  "recommendations": [
    {
      "action": "create_priority_support_ticket",
      "priority": "high",
      "reasoning": "Repeat customer with urgent plant issue"
    },
    {
      "action": "send_winter_care_guide",
      "priority": "immediate",
      "reasoning": "Seasonal care guidance needed"
    }
  ],
  "federatedInsights": {
    "similarIssues": 3,
    "expertSources": ["desert-plants-co", "succulent-experts"],
    "recommendedSolution": "Reduce watering frequency in winter"
  }
}
```

### Cross-Tenant Collaboration
```http
POST /api/ai-bus/collaborate
Content-Type: application/json

{
  "query": "Who has experience with large cactus transplanting?",
  "fromTenant": "hays-cactus-farm",
  "businessTypes": ["equipment_rental", "landscaping", "agriculture"]
}
```

**Response:**
```json
{
  "collaboratingAgents": [
    "equipment-rental-co-ceo",
    "desert-landscaping-ceo"
  ],
  "recommendations": [
    {
      "business": "Southwest Equipment Rental",
      "service": "Mini excavator with plant attachment",
      "expertise": "Large plant transplanting",
      "availability": "next_week"
    }
  ],
  "sharedKnowledge": [
    "Best season for cactus transplanting",
    "Root system preservation techniques",
    "Equipment safety protocols"
  ]
}
```

## Multi-Tenant API

### Get Tenant Configuration
```http
GET /api/tenants/{subdomain}
```

**Response:**
```json
{
  "tenant": {
    "id": "tenant_123",
    "name": "Hays Cactus Farm",
    "subdomain": "hays",
    "businessType": "agriculture",
    "status": "active",
    "features": {
      "ecommerce": true,
      "ai_agent": true,
      "federation": true,
      "spaces": true
    },
    "branding": {
      "primaryColor": "#10B981",
      "logo": "hays-logo.png",
      "description": "Premium cactus plants and care expertise"
    }
  }
}
```

### Create New Tenant
```http
POST /api/tenants
Content-Type: application/json

{
  "name": "Desert Landscaping Co",
  "subdomain": "desert-landscaping",
  "businessType": "landscaping",
  "features": {
    "ecommerce": true,
    "ai_agent": true,
    "federation": true
  },
  "branding": {
    "primaryColor": "#F59E0B",
    "description": "Professional desert landscaping services"
  }
}
```

## Messages API

### Create Universal Message
```http
POST /api/messages
Content-Type: application/json

{
  "type": "customer_inquiry",
  "content": "Do you have any cold-hardy cactus varieties?",
  "metadata": {
    "tenant": "hays-cactus-farm",
    "department": "sales",
    "priority": "medium",
    "customerContext": {
      "location": "colorado",
      "experience": "beginner"
    }
  },
  "federation": {
    "discoverable": true,
    "shareLevel": "public"
  }
}
```

### Search Knowledge Base
```http
GET /api/messages/search?q=winter%20cactus%20care&tenant=hays-cactus-farm
```

**Response:**
```json
{
  "results": [
    {
      "id": "msg_456",
      "type": "knowledge_article",
      "title": "Winter Cactus Care Guide",
      "content": "During winter months, reduce watering...",
      "relevance": 0.95,
      "metadata": {
        "category": "plant_care",
        "season": "winter",
        "difficulty": "beginner"
      }
    }
  ],
  "federatedResults": [
    {
      "source": "desert-plants-co",
      "title": "Cold Weather Succulent Protection",
      "relevance": 0.87,
      "federatedLink": "at://did:plc:desert-plants-co/knowledge/xyz789"
    }
  ]
}
```

## Health & Monitoring

### System Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "ai_services": "operational",
  "federation": "active",
  "uptime": "99.8%",
  "version": "1.0.0"
}
```

### Federation Status
```http
GET /api/federation/status
```

**Response:**
```json
{
  "atProtocol": {
    "status": "connected",
    "recordsCreated": 1247,
    "lastSync": "2024-01-15T10:45:00Z"
  },
  "bluesky": {
    "status": "authenticated",
    "postsShared": 89,
    "followers": 234
  },
  "aiCollaboration": {
    "activeAgents": 5,
    "collaborations": 23,
    "knowledgeExchanges": 67
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "TENANT_NOT_FOUND",
    "message": "The specified tenant does not exist",
    "details": {
      "tenant": "nonexistent-tenant",
      "suggestion": "Check tenant subdomain spelling"
    }
  }
}
```

### Common Error Codes
- `AUTHENTICATION_REQUIRED` - Missing or invalid authentication
- `TENANT_NOT_FOUND` - Invalid tenant subdomain
- `AI_SERVICE_UNAVAILABLE` - AI service temporarily down
- `FEDERATION_ERROR` - AT Protocol or BlueSky connection issue
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Webhooks

### Federation Events
```http
POST /api/webhooks/federation
Content-Type: application/json

{
  "event": "record_created",
  "data": {
    "atUri": "at://did:plc:tenant/co.kendev.spaces.message/abc123",
    "tenant": "hays-cactus-farm",
    "type": "customer_inquiry"
  }
}
```

### AI Agent Events
```http
POST /api/webhooks/ai-agents
Content-Type: application/json

{
  "event": "insight_generated",
  "data": {
    "agent": "ceo-hays-cactus-farm",
    "pipedreamIndex": 0.78,
    "insight": "Increased winter plant care inquiries suggest content opportunity"
  }
}
```

This API enables the full power of the federated business platform! 🚀 