// src/components/AndrewMartinControlPanel/MetricsDashboard.tsx
import React from 'react';
import type { BusinessMetricsWidget, RevenueAnalyticsChart, NetworkStatusWidget as GuardianAngelNetworkWidgetData } from '@/types/andrew-martin'; // Renamed to avoid conflict
import RevenueAnalyticsChartComponent from './widgets/RevenueAnalyticsChart'; // Renamed to avoid conflict
import NetworkStatusWidgetComponent from './widgets/NetworkStatusWidget'; // Renamed to avoid conflict
import BusinessMetricsWidgetComponent from './widgets/BusinessMetricsWidget'; // Renamed to avoid conflict
import styles from './styles.module.css';

interface MetricsDashboardProps {
  businessMetricsWidget: BusinessMetricsWidget;
  revenueAnalyticsChart: RevenueAnalyticsChart;
  guardianAngelNetworkWidget: GuardianAngelNetworkWidgetData;
  // Add SpaceOverview once its data structure is clearer for the dashboard context
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  businessMetricsWidget,
  revenueAnalyticsChart,
  guardianAngelNetworkWidget,
}) => {
  return (
    <div className={styles.metricsDashboardGrid}>
      <div className={`${styles.widgetCard} ${styles.businessMetricsWidget}`}>
        <BusinessMetricsWidgetComponent {...businessMetricsWidget.data} />
      </div>
      <div className={`${styles.widgetCard} ${styles.revenueAnalyticsWidget}`}>
        <RevenueAnalyticsChartComponent {...revenueAnalyticsChart.data} />
      </div>
      <div className={`${styles.widgetCard} ${styles.guardianAngelWidget}`}>
        <NetworkStatusWidgetComponent {...guardianAngelNetworkWidget.data} />
      </div>
      {/*
      <div className={`${styles.widgetCard} ${styles.spaceOverviewWidget}`}>
        <h3>{spaceOverview.title}</h3>
        // Placeholder for Space Overview content in the dashboard
        <p>Space overview details will go here...</p>
      </div>
      */}
    </div>
  );
};

export default MetricsDashboard;
