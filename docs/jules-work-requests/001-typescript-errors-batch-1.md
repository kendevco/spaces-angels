# 001 - Fix ShipMindOrchestrator TypeScript Errors (Batch 1)

## 🎯 Objective
Resolve 58 TypeScript errors in `src/services/ShipMindOrchestrator.ts` by defining missing interfaces and implementing stub methods to stabilize the codebase for continued development.

## 📝 Context
The ShipMindOrchestrator is a core component of Leo AI's "Ship Mind" personality system that enables autonomous decision-making and ethical reasoning. Currently, it has extensive interface definitions without proper implementations, causing 58 TypeScript compilation errors.

### Current State
- File: `src/services/ShipMindOrchestrator.ts` (lines 22-247)
- 58 TypeScript errors related to missing types and unimplemented methods
- Part of Angel OS's federated intelligence architecture
- Critical for Leo AI assistant functionality

### Architecture Context
This service implements the "Ship Mind" concept from Ian M. Banks' Culture series - autonomous AI entities with ethical frameworks and personality-driven decision making. It's designed to:
- Make autonomous business decisions within ethical boundaries
- Provide personalized AI assistance based on business type
- Coordinate with other Ship Minds in the federated network
- Maintain user relationships and business intelligence

## 🔧 Technical Requirements

### 1. Define Missing Type Interfaces
Create these missing interfaces in a new file `src/types/ship-mind.ts`:

```typescript
// Core Ship Mind Types
export interface RelationshipProfile {
  userId: string
  businessContext: string
  communicationStyle: 'formal' | 'casual' | 'technical' | 'friendly'
  preferences: Record<string, any>
  trustLevel: number // 0-1
  interactionHistory: InteractionRecord[]
}

export interface BusinessInsights {
  industryTrends: TrendAnalysis[]
  competitiveIntelligence: CompetitorData[]
  customerBehavior: BehaviorPattern[]
  revenueProjections: RevenueData[]
  riskAssessment: RiskFactor[]
}

export interface EthicalDecision {
  dilemmaId: string
  context: string
  stakeholders: string[]
  principles: EthicalPrinciple[]
  resolution: string
  confidence: number
  reasoning: string[]
}

export interface PlatformEvaluation {
  currentPlatform: string
  limitations: string[]
  userFrustrations: string[]
  alternativeOptions: PlatformOption[]
  migrationComplexity: number
  recommendedAction: 'stay' | 'migrate' | 'hybrid'
}

export interface MigrationAnalysis {
  effort: number // 1-10 scale
  cost: number
  timeframe: string
  risks: string[]
  benefits: string[]
  readinessScore: number // 0-1
}

// Decision Making Types
export interface DecisionContext {
  businessType: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  stakeholders: string[]
  constraints: Record<string, any>
  availableData: Record<string, any>
}

export interface ShipDecision {
  action: string
  reasoning: string
  confidence: number // 0-1
  requiresHumanConsent: boolean
  alternatives: string[]
  ethicalAssessment: EthicalAssessment
}

export interface EthicalAssessment {
  violations: string[]
  severity: 'none' | 'minor' | 'moderate' | 'severe' | 'critical'
  recommendation: string
  principlesApplied: string[]
}

// Communication Types
export interface CommunicationContext {
  channel: 'chat' | 'email' | 'voice' | 'system'
  urgency: 'low' | 'medium' | 'high'
  businessContext: string
  userState: 'focused' | 'stressed' | 'exploratory' | 'urgent'
}

export interface ShipResponse {
  message: string
  tone: string
  suggestions: Suggestion[]
  questions: string[]
  actions: ProposedAction[]
}

// Network Types
export interface NetworkQuery {
  domain: string
  question: string
  context: Record<string, any>
  requesterShipId: string
}

export interface CollectiveWisdom {
  collectiveAdvice: string
  consensus: string
  dissenting: string[]
  confidence: number
  contributingShips: string[]
}

// Configuration Types
export interface EndeavorConfig {
  businessType: string
  tier: 'basic' | 'professional' | 'enterprise'
  industry: string
  size: 'solo' | 'small' | 'medium' | 'large'
  values: string[]
}

// Frustration & Migration Types
export interface FrustrationSignals {
  frequency: number
  severity: number
  categories: string[]
  needs: string[]
  timeline: string
}

export interface MigrationRecommendation {
  targetPlatform: string
  reasoning: string
  migrationPlan: MigrationPlan
  timeline: string
  effort: number
  benefits: string[]
}

export interface MigrationPlan {
  phases: MigrationPhase[]
  estimatedCost: number
  timeline: string
  risks: string[]
  rollbackPlan: string
}

export interface MigrationPhase {
  name: string
  description: string
  duration: string
  automatedSteps: string[]
  manualSteps: string[]
  dependencies: string[]
}

export interface Platform {
  name: string
  capabilities: string[]
  limitations: string[]
  pricing: PricingModel
  migrationSupport: boolean
}

export interface PricingModel {
  model: 'free' | 'subscription' | 'usage' | 'enterprise'
  cost: number
  currency: string
  period?: string
}

// Supporting Types
export interface InteractionRecord {
  timestamp: Date
  type: string
  content: string
  outcome: string
}

export interface TrendAnalysis {
  trend: string
  direction: 'up' | 'down' | 'stable'
  confidence: number
  timeframe: string
}

export interface CompetitorData {
  name: string
  strengths: string[]
  weaknesses: string[]
  marketShare: number
}

export interface BehaviorPattern {
  pattern: string
  frequency: number
  impact: string
  recommendation: string
}

export interface RevenueData {
  period: string
  projected: number
  actual?: number
  factors: string[]
}

export interface RiskFactor {
  risk: string
  probability: number
  impact: number
  mitigation: string
}

export interface EthicalPrinciple {
  name: string
  description: string
  weight: number
}

export interface PlatformOption {
  name: string
  score: number
  pros: string[]
  cons: string[]
  migrationEffort: number
}

export interface Suggestion {
  text: string
  action?: string
  relevance: number
}

export interface ProposedAction {
  action: string
  description: string
  confidence: number
  requiresApproval: boolean
}
```

### 2. Implement Stub Methods
Add basic implementations for all missing methods in `ShipMindOrchestrator.ts`. Focus on:
- Returning appropriate default values
- Maintaining method signatures
- Adding TODO comments for future implementation
- Ensuring TypeScript compilation passes

### 3. Update Imports
Add proper imports for the new types at the top of `ShipMindOrchestrator.ts`:

```typescript
import {
  RelationshipProfile,
  BusinessInsights,
  EthicalDecision,
  PlatformEvaluation,
  MigrationAnalysis,
  DecisionContext,
  ShipDecision,
  EthicalAssessment,
  CommunicationContext,
  ShipResponse,
  NetworkQuery,
  CollectiveWisdom,
  EndeavorConfig,
  FrustrationSignals,
  MigrationRecommendation,
  MigrationPlan,
  Platform
} from '../types/ship-mind'
```

## 📁 Files to Modify

### New Files to Create
- `src/types/ship-mind.ts` - All Ship Mind type definitions

### Files to Modify
- `src/services/ShipMindOrchestrator.ts` - Add imports and implement stub methods

### Files to Review for Context
- `src/services/LEO_AI_ASSISTANT_COMPLETE.md` - Leo AI architecture
- `docs/LEO_HOST_AI_ARCHITECTURE.md` - Ship Mind system design
- `docs/FEDERATED_INTELLIGENCE_STRATEGY.md` - Network cooperation patterns

## ✅ Acceptance Criteria

### Must Have
1. **Zero TypeScript errors** in `ShipMindOrchestrator.ts`
2. **All missing types defined** with proper interfaces
3. **All methods implemented** with basic stub functionality
4. **Proper imports** for all new types
5. **Code compiles successfully** with `pnpm tsc --noEmit`

### Implementation Standards
- Use TypeScript strict mode compliance
- Add JSDoc comments for all new interfaces
- Follow existing code style and patterns
- Include TODO comments for future enhancement
- Maintain existing method signatures

### Testing Verification
```bash
# Verify no TypeScript errors
pnpm tsc --noEmit

# Check specific file compilation
npx tsc src/services/ShipMindOrchestrator.ts --noEmit --strict
```

## 🔗 Related Work

### Dependencies
- None - this is a foundational fix

### Follow-up Tasks
- **002-typescript-errors-batch-2.md** - Fix LeoBrowserAutomation errors
- **003-collection-type-fixes.md** - Resolve collection type mismatches
- **009-leo-interface-enhancement.md** - Implement full Ship Mind functionality

### Documentation Updates
- Update `docs/LEO_AI_ASSISTANT_COMPLETE.md` with new type definitions
- Add Ship Mind type reference to API documentation

---

## 🕉️ Implementation Notes

This task is critical for stabilizing the Angel OS codebase. The Ship Mind concept represents the philosophical heart of Leo AI - autonomous intelligence with ethical reasoning and personality-driven decision making.

Focus on creating a solid foundation that can be enhanced iteratively. The stub implementations should be functional enough to prevent compilation errors while providing clear extension points for future development.

**Remember**: Every line of code should embody the Guardian Angel principle - technology that lifts people up and enables success for others.

**Om Shanti Om** - Peace in the code structure! 🌟 