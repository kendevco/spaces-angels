// src/components/AndrewMartinControlPanel/widgets/BusinessInsightsPanel.tsx
import React from 'react';
import type { InsightsPanel as InsightsPanelData, Insight } from '@/types/andrew-martin';
import styles from '../styles.module.css';

interface BusinessInsightsPanelProps extends InsightsPanelData {
  // Currently InsightsPanelData just has insights: Insight[]
  // Add other props if needed
}

const BusinessInsightsPanel: React.FC<BusinessInsightsPanelProps> = ({ insights }) => {
  const getSeverityStyle = (severity?: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return { borderLeft: `5px solid var(--andrew-error)`, color: 'var(--andrew-error)' };
      case 'warning':
        return { borderLeft: `5px solid var(--andrew-warning)`, color: 'var(--andrew-warning)' };
      case 'info':
      default:
        return { borderLeft: `5px solid var(--andrew-info)`, color: 'var(--andrew-info)' };
    }
  };

  return (
    <div className={`${styles.widgetCard} ${styles.businessInsightsPanel}`}>
      <h3 className={styles.widgetTitle}>Business Insights (AI Powered)</h3>
      {insights.length === 0 ? (
        <p>No new insights at the moment. Leo AI is analyzing data.</p>
      ) : (
        <div className={styles.insightsList}>
          {insights.map((insight: Insight) => (
            <div key={insight.id} className={styles.insightItem} style={getSeverityStyle(insight.severity)}>
              <div className={styles.insightHeader}>
                <h4 className={styles.insightTitle}>{insight.title}</h4>
                {insight.severity && <span className={styles.insightSeverity}>{insight.severity}</span>}
              </div>
              <p className={styles.insightSummary}>{insight.summary}</p>
              {insight.recommendation && (
                <p className={styles.insightRecommendation}>
                  <strong>Recommendation:</strong> {insight.recommendation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      <div className={styles.widgetFooter}>
        <p>Insights generated by Leo AI</p>
      </div>
    </div>
  );
};

export default BusinessInsightsPanel;
