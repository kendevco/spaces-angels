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
      name: 'Andrew Martin',
      email: 'andrew.martin@example.com',
      avatarUrl: '/avatar-placeholder.png', // Replace with actual avatar path
    },
    notifications: {
      notifications: [
        { id: '1', message: 'New space "Alpha Site" deployed successfully.', type: 'success', timestamp: new Date(), read: false },
        { id: '2', message: 'Revenue target for Q2 exceeded by 15%.', type: 'info', timestamp: new Date(), read: true },
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
        kpis: [{ id: 'kpi1', name: 'Active Spaces', value: 12, unit: 'spaces' }],
        trends: [{ id: 'trend1', name: 'Monthly Recurring Revenue', currentValue: 75000, previousValue: 72000, period: 'vs last month' }],
        alerts: [{ id: 'alert1', severity: 'warning', title: 'High CPU Usage on "Gamma Space"', description: 'CPU usage has exceeded 80% for the last hour.', timestamp: new Date() }],
        recommendations: [{ id: 'rec1', title: 'Consider New Template', description: 'A new "E-commerce Pro" template is available that might suit your new projects.' }],
      }
    },
    spaceOverview: {
      title: 'Space Overview',
      // Data for SpaceOverviewGrid will be managed within its component or passed differently
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
        successStories: [{ id: 'ss1', title: 'Startup X Reaches 1M Users', summary: 'Powered by AngelOS infrastructure.' }],
        networkHealth: { overallStatus: 'healthy', uptimePercentage: 99.99, averageResponseTime: 120 },
      }
    },
  },
  spaceManagement: {
    activeSpaces: [
      { id: 'sp1', name: 'Alpha Site', status: 'active', domain: 'alpha.example.com', lastActivity: '2 hours ago' },
      { id: 'sp2', name: 'Beta Project', status: 'deploying', domain: 'beta.example.com', lastActivity: '5 minutes ago' },
    ],
    templates: [
      { id: 'tpl1', name: 'Standard Business Template', description: 'A versatile template for general businesses.', features: ['Blog', 'Contact Form'] },
    ],
    cloneWizard: { // This will be managed by state, not passed as a prop directly here
      isOpen: false,
    },
    deploymentQueue: [
      { id: 'dep1', spaceName: 'Gamma Build', status: 'in_progress', progress: 60, startTime: new Date() },
    ],
  },
  intelligenceCenter: {
    leoAI: { // Data for LeoAIInterface
      conversationHistory: [{ speaker: 'leo', message: 'Hello Andrew, how can I assist you today?', timestamp: new Date() }],
    },
    businessInsights: { // Data for InsightsPanel
      insights: [{ id: 'bi1', title: 'New Market Opportunity', summary: 'Emerging market in APAC region shows high potential for your services.'}]
    },
    marketAnalysis: { // Data for MarketAnalysisWidget
      trends: [{ id: 'ma1', name: 'AI Integration Growth', growthRate: 25, description: 'Businesses are rapidly adopting AI.' }],
      marketSize: 500000000, // Example market size
    },
    competitiveIntel: { // Data for CompetitiveIntelligencePanel
      competitors: [{id: 'ci1', name: 'Competitor Z', strengths: ['Large User Base'], weaknesses: ['Slow Innovation']}]
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
            <BusinessInsightsPanel insights={panelData.intelligenceCenter.businessInsights.insights} />
            <MarketAnalysisWidget trends={panelData.intelligenceCenter.marketAnalysis.trends} marketSize={panelData.intelligenceCenter.marketAnalysis.marketSize} />
            <CompetitiveIntelligencePanel competitors={panelData.intelligenceCenter.competitiveIntel.competitors} />
          </div>
        </section>
      </main>
      {/* CloneWizardModal is rendered by SpaceOverviewGrid */}
    </div>
  );
};

export default AndrewMartinControlPanel;
