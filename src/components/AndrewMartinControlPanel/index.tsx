// src/components/AndrewMartinControlPanel/index.tsx
import React from 'react';
import type { AndrewMartinControlPanel as AndrewMartinControlPanelData } from '@/types/andrew-martin';
import DashboardHeader from './DashboardHeader';
import MetricsDashboard from './MetricsDashboard';
import SpaceOverviewGrid from './SpaceOverviewGrid';
import LeoAIInterfaceComponent from './LeoAIInterface'; // Renamed to avoid conflict with type
import BusinessInsightsPanel from './widgets/BusinessInsightsPanel';
import MarketAnalysisWidget from './widgets/MarketAnalysisWidget';
import CompetitiveIntelligencePanel from './widgets/CompetitiveIntelligencePanel';
import styles from './styles.module.css';

// Mock data for initial rendering - replace with actual data fetching later
const mockControlPanelData: AndrewMartinControlPanelData = {
  header: {
    logo: '/logo-placeholder.png', // Replace with actual logo path
    userProfile: {
      id: 'user-1',
      name: 'Andrew Martin',
      email: 'andrew.martin@example.com',
      avatarUrl: '/avatar-placeholder.png', // Replace with actual avatar path
      role: 'admin',
      lastActive: '2 minutes ago',
    },
    notifications: {
      notifications: [
        { id: '1', title: 'Deployment Success', message: 'New space "Alpha Site" deployed successfully.', type: 'success', timestamp: new Date().toISOString(), read: false },
        { id: '2', title: 'Revenue Milestone', message: 'Revenue target for Q2 exceeded by 15%.', type: 'info', timestamp: new Date().toISOString(), read: true },
      ],
      unreadCount: 1,
    },
    quickActions: [
      { id: 'qa1', label: 'Clone Space', action: () => console.log('Clone Space clicked') },
      { id: 'qa2', label: 'View Reports', action: () => console.log('View Reports clicked') },
    ],
  },
  dashboard: {
    businessMetrics: {
      title: 'Key Business Metrics',
      data: {
        kpis: [{ id: 'kpi1', name: 'Active Spaces', value: 12, unit: 'spaces', change: 2, changeType: 'increase', trend: 'up' }],
        trends: [{ id: 'trend1', name: 'Monthly Recurring Revenue', currentValue: 75000, previousValue: 72000, period: 'vs last month', metric: 'MRR', direction: 'up', percentage: 4.2, timeframe: 'monthly' }],
        alerts: [{ id: 'alert1', severity: 'high', title: 'High CPU Usage on "Gamma Space"', description: 'CPU usage has exceeded 80% for the last hour.', timestamp: new Date().toISOString(), message: 'System performance degraded', resolved: false }],
        recommendations: [{ id: 'rec1', title: 'Consider New Template', description: 'A new "E-commerce Pro" template is available that might suit your new projects.', impact: 'medium', effort: 'low', category: 'optimization' }],
      }
    },
    spaceOverview: {
      title: 'Space Overview',
      data: {
        activeSpaces: [],
        templates: [],
        deploymentQueue: []
      }
    },
    revenueAnalytics: {
      title: 'Revenue Analytics',
      data: {
        timeframe: 'monthly',
        spaces: [{ spaceId: 's1', spaceName: 'Alpha Site', revenue: [5000, 5200, 5500] }],
        breakdown: 'by_space',
      }
    },
    guardianAngelNetwork: {
      title: 'Guardian Angel Network',
      data: {
        activeAngels: 5,
        totalRevenueGenerated: 1250000,
        totalRevenue: 1250000,
        successStories: [{ id: 'ss1', title: 'Startup X Reaches 1M Users', summary: 'Powered by AngelOS infrastructure.', angelName: 'Leo AI', businessName: 'Startup X', achievement: '1M Users Milestone', revenue: 250000, timestamp: new Date().toISOString() }],
        networkHealth: { uptime: 99.99, responseTime: 120, errorRate: 0.01, satisfaction: 95 },
      }
    },
  },
  spaceManagement: {
    activeSpaces: [
      { id: 'sp1', name: 'Alpha Site', status: 'active', domain: 'alpha.example.com', lastActivity: '2 hours ago', businessType: 'e-commerce', memberCount: 15, revenue: 45000 },
      { id: 'sp2', name: 'Beta Project', status: 'deploying', domain: 'beta.example.com', lastActivity: '5 minutes ago', businessType: 'saas', memberCount: 8, revenue: 28000 },
    ],
    templates: [
      { id: 'tpl1', name: 'Standard Business Template', description: 'A versatile template for general businesses.', features: ['Blog', 'Contact Form'], businessType: 'general', popularity: 85 },
    ],
    cloneWizard: {
      isOpen: false,
      currentStep: 1,
      totalSteps: 5,
      data: {
        sourceSpaceId: '',
        targetName: '',
        targetDomain: '',
        customizations: {
          branding: { primaryColor: '#000000', secondaryColor: '#ffffff' },
          features: { ecommerce: false, booking: false, crm: false, analytics: false },
          integrations: { stripe: false, mailchimp: false, analytics: false },
          aiPersonality: { tone: 'friendly', expertise: [], responseStyle: 'helpful' }
        },
        deploymentConfig: {
          environment: 'development',
          region: 'us-east-1',
          scaling: { minInstances: 1, maxInstances: 10, autoScale: true },
          monitoring: { alerts: true, logging: true, metrics: true }
        },
        businessProfile: { industry: 'technology', size: 'small', targetMarket: 'global', goals: [] }
      }
    },
    deploymentQueue: [
      { id: 'dep1', spaceName: 'Gamma Build', status: 'in_progress', progress: 60, startTime: new Date(), startedAt: new Date().toISOString() },
    ],
  },
  intelligenceCenter: {
    leoAI: {
      conversationHistory: [{ 
        id: 'msg1', 
        speaker: 'leo', 
        message: 'Hello Andrew, how can I assist you today?', 
        timestamp: new Date().toISOString(),
        content: 'Hello Andrew, how can I assist you today?',
        sender: 'leo',
        type: 'text'
      }],
    },
    businessInsights: {
      insights: [{ 
        id: 'bi1', 
        title: 'New Market Opportunity', 
        summary: 'Emerging market in APAC region shows high potential for your services.',
        description: 'Emerging market in APAC region shows high potential for your services.',
        category: 'market-expansion',
        confidence: 85,
        actionable: true,
        impact: 'high'
      }]
    },
    marketAnalysis: {
      trends: [{ 
        id: 'ma1', 
        name: 'AI Integration Growth', 
        growthRate: 25, 
        description: 'Businesses are rapidly adopting AI.',
        growth: 25,
        relevance: 90,
        timeframe: 'quarterly'
      }],
      marketSize: {
        total: 500000000,
        addressable: 250000000,
        penetration: 15,
        currency: 'USD'
      },
      opportunities: [{ 
        id: 'op1', 
        title: 'AI Integration Services', 
        description: 'Growing demand for AI integration consulting',
        potential: 75,
        effort: 40,
        timeline: '6 months'
      }]
    },
    competitiveIntel: {
      competitors: [{
        id: 'ci1', 
        name: 'Competitor Z', 
        strengths: ['Large User Base'], 
        weaknesses: ['Slow Innovation'],
        marketShare: 25,
        pricing: 'premium'
      }]
    },
  },
};

const AndrewMartinControlPanel: React.FC = () => {
  // In a real app, this data would come from props, context, or a store
  const [panelData] = React.useState<AndrewMartinControlPanelData>(mockControlPanelData);

  return (
    <div className={styles.controlPanelContainer}>
      <DashboardHeader
        logo={panelData.header.logo}
        userProfile={panelData.header.userProfile}
        notifications={panelData.header.notifications}
        quickActions={panelData.header.quickActions}
      />

      <main className={styles.mainContent}>
        <section className={styles.dashboardSection} aria-labelledby="dashboard-title">
          <h2 id="dashboard-title" className={styles.sectionTitle}>Dashboard</h2>
          <MetricsDashboard
            businessMetricsWidget={panelData.dashboard.businessMetrics}
            revenueAnalyticsChart={panelData.dashboard.revenueAnalytics}
            guardianAngelNetworkWidget={panelData.dashboard.guardianAngelNetwork}
            // spaceOverview will be part of this section but might be structured differently
          />
        </section>

        <section className={styles.spaceManagementSection} aria-labelledby="space-management-title">
          <h2 id="space-management-title" className={styles.sectionTitle}>Space Management</h2>
          <SpaceOverviewGrid
            activeSpaces={panelData.spaceManagement.activeSpaces}
            templates={panelData.spaceManagement.templates}
            deploymentQueue={panelData.spaceManagement.deploymentQueue}
            // cloneWizard will be a modal triggered from here
          />
        </section>

        <section className={styles.intelligenceCenterSection} aria-labelledby="intelligence-center-title">
          <h2 id="intelligence-center-title" className={styles.sectionTitle}>Intelligence Center</h2>
          <div className={styles.intelligenceGrid}> {/* Added a grid for better layout */}
            <LeoAIInterfaceComponent initialMessages={panelData.intelligenceCenter.leoAI.conversationHistory} />
            <BusinessInsightsPanel 
              insights={panelData.intelligenceCenter.businessInsights.insights} 
              trends={[]}
              predictions={[]}
            />
            <MarketAnalysisWidget 
              trends={panelData.intelligenceCenter.marketAnalysis.trends} 
              marketSize={panelData.intelligenceCenter.marketAnalysis.marketSize}
              opportunities={panelData.intelligenceCenter.marketAnalysis.opportunities}
            />
            <CompetitiveIntelligencePanel 
              competitors={panelData.intelligenceCenter.competitiveIntel.competitors}
              marketPosition={{ rank: 1, total: 10, category: 'SaaS', score: 85 }}
              threats={[]}
              advantages={[]}
            />
          </div>
        </section>
      </main>
      {/* CloneWizardModal is rendered by SpaceOverviewGrid */}
    </div>
  );
};

export default AndrewMartinControlPanel;
