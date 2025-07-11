// Browser Automation Types - From Task 002
export interface PaymentResult {
  transactionId: string
  status: 'success' | 'failed' | 'pending' | 'cancelled'
  amount: number
  currency: string
  processor: string
  timestamp: Date
  fees: PaymentFees
  ethicalAssessment: EthicalAssessment
  auditTrail: string[]
}

export interface PaymentFees {
  processingFee: number
  platformFee: number
  networkFee: number
  total: number
  currency: string
}

export interface EthicalAssessment {
  violations: string[]
  severity: 'none' | 'minor' | 'moderate' | 'severe' | 'critical'
  recommendation: string
  principlesApplied: string[]
  humanReviewRequired: boolean
} 