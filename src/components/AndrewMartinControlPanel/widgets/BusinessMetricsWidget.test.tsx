// src/components/AndrewMartinControlPanel/widgets/BusinessMetricsWidget.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BusinessMetricsWidget from './BusinessMetricsWidget';
import type { BusinessMetricsProps, KPIMetric, TrendIndicator, BusinessAlert, AIRecommendation } from '@/types/andrew-martin';

const mockBusinessMetrics: BusinessMetricsProps = {
  kpis: [
    { id: 'kpi1', name: 'Active Users', value: 1234, unit: 'users', change: 10, changeType: 'increase', trend: 'up' },
    { id: 'kpi2', name: 'Revenue', value: 50000, unit: 'USD', change: 5, changeType: 'increase', trend: 'stable' },
  ],
  trends: [
    { 
      id: 'trend1', 
      name: 'User Growth', 
      metric: 'user_growth',
      direction: 'up',
      percentage: 23.4,
      timeframe: 'monthly',
      currentValue: 1234, 
      previousValue: 1000, 
      period: 'vs last month' 
    },
  ],
  alerts: [
    { 
      id: 'alert1', 
      severity: 'critical', 
      title: 'System Down', 
      description: 'Main system is offline.', 
      message: 'Main system is offline.',
      timestamp: new Date().toISOString(),
      resolved: false
    },
  ],
  recommendations: [
    { 
      id: 'rec1', 
      title: 'Optimize Checkout', 
      description: 'Improve checkout conversion by 10%.',
      impact: 'high',
      effort: 'medium',
      category: 'conversion'
    },
  ],
};

describe('BusinessMetricsWidget Component', () => {
  it('renders KPIs, trends, alerts, and recommendations correctly', () => {
    render(<BusinessMetricsWidget {...mockBusinessMetrics} />);

    // Check for widget title (assuming it's consistent)
    expect(screen.getByText('Key Business Metrics')).toBeInTheDocument();

    // Check for KPI data
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();

    // Check for trend data
    expect(screen.getByText(/User Growth/)).toBeInTheDocument(); // Partial match for trend text

    // Check for alert data
    expect(screen.getByText('System Down (critical)')).toBeInTheDocument();
    expect(screen.getByText('Main system is offline.')).toBeInTheDocument();

    // Check for recommendation data
    expect(screen.getByText('Optimize Checkout')).toBeInTheDocument();
    expect(screen.getByText('Improve checkout conversion by 10%.')).toBeInTheDocument();
  });

  it('renders correct trend icons for KPIs', () => {
    render(<BusinessMetricsWidget {...mockBusinessMetrics} />);
    // KPI: Active Users - Trend Up (▲)
    // KPI: Revenue - Trend Stable (▬)
    // These are visual checks; React Testing Library is more about structure/text.
    // A more robust way would be to check for specific class names or data attributes if icons are implemented that way.
    // For now, we assume the text content is sufficient for a basic test.
    // Example: if icons had aria-labels:
    // expect(screen.getByLabelText('Trend Up')).toBeInTheDocument();
    // expect(screen.getByLabelText('Trend Stable')).toBeInTheDocument();
    expect(screen.getByText('▲')).toBeInTheDocument(); // For 'up' trend
    expect(screen.getByText('▬')).toBeInTheDocument(); // For 'stable' trend
  });
});
