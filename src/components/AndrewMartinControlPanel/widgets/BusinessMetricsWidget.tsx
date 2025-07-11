// src/components/AndrewMartinControlPanel/widgets/BusinessMetricsWidget.tsx
import React from 'react';
import type { BusinessMetricsProps, KPIMetric, TrendIndicator, BusinessAlert, AIRecommendation } from '@/types/andrew-martin';
import styles from '../styles.module.css'; // Assuming shared styles

const BusinessMetricsWidget: React.FC<BusinessMetricsProps> = ({
  kpis,
  trends,
  alerts,
  recommendations,
}) => {
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <span style={{ color: 'var(--andrew-success)' }}>▲</span>;
    if (trend === 'down') return <span style={{ color: 'var(--andrew-error)' }}>▼</span>;
    return <span style={{ color: 'var(--andrew-secondary)' }}>▬</span>;
  };

  const getAlertSeverityClass = (severity: 'critical' | 'high' | 'medium' | 'low') => {
    if (severity === 'critical') return styles.alertCritical;
    if (severity === 'high') return styles.alertHigh;
    if (severity === 'medium') return styles.alertMedium;
    return styles.alertLow;
  }

  return (
    <div className={styles.widgetContent}>
      <h3 className={styles.widgetTitle}>Key Business Metrics</h3>

      {kpis.length > 0 && (
        <div className={styles.kpiSection}>
          <h4>KPIs</h4>
          <div className={styles.kpiGrid}>
            {kpis.map((kpi: KPIMetric) => (
              <div key={kpi.id} className={styles.kpiItem}>
                <span className={styles.kpiName}>{kpi.name}</span>
                <span className={styles.kpiValue}>{kpi.value} {kpi.unit || ''} {getTrendIcon(kpi.trend)}</span>
                {kpi.target && <span className={styles.kpiTarget}>Target: {kpi.target}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {trends.length > 0 && (
        <div className={styles.trendsSection}>
          <h4>Trends</h4>
          {trends.map((trend: TrendIndicator) => (
            <div key={trend.id} className={styles.trendItem}>
              <span>{trend.name}: {trend.currentValue > trend.previousValue ? getTrendIcon('up') : getTrendIcon('down')} {trend.currentValue} ({trend.period})</span>
            </div>
          ))}
        </div>
      )}

      {alerts.length > 0 && (
        <div className={styles.alertsSection}>
          <h4>Alerts</h4>
          {alerts.slice(0,2).map((alert: BusinessAlert) => ( // Show a couple of alerts
            <div key={alert.id} className={`${styles.alertItem} ${getAlertSeverityClass(alert.severity)}`}>
              <strong>{alert.title} ({alert.severity})</strong>
              <p>{alert.description}</p>
              <small>{new Date(alert.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className={styles.recommendationsSection}>
          <h4>AI Recommendations</h4>
          {recommendations.slice(0,1).map((rec: AIRecommendation) => ( // Show one recommendation
            <div key={rec.id} className={styles.recommendationItem}>
              <h5>{rec.title}</h5>
              <p>{rec.description}</p>
              {rec.action && rec.actionLabel && (
                <button onClick={rec.action} className={styles.actionButton}>{rec.actionLabel}</button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className={styles.widgetFooter}>
        <p>Overview as of {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default BusinessMetricsWidget;
