// src/components/AndrewMartinControlPanel/widgets/MarketAnalysisWidget.tsx
import React from 'react';
import type { MarketAnalysisWidget as MarketAnalysisWidgetData, MarketTrend } from '@/types/andrew-martin';
import styles from '../styles.module.css';

interface MarketAnalysisWidgetProps extends MarketAnalysisWidgetData {
  // MarketAnalysisWidgetData has trends and marketSize
}

const MarketAnalysisWidget: React.FC<MarketAnalysisWidgetProps> = ({ trends, marketSize }) => {
  return (
    <div className={`${styles.widgetCard} ${styles.marketAnalysisWidget}`}>
      <h3 className={styles.widgetTitle}>Market Analysis</h3>
      <div className={styles.marketSizeSection}>
        <h4>Estimated Market Size:</h4>
        <p className={styles.marketSizeValue}>${marketSize.toLocaleString()}</p>
      </div>
      {trends.length === 0 ? (
        <p>No specific market trends identified currently.</p>
      ) : (
        <div className={styles.marketTrendsList}>
          <h4>Key Market Trends:</h4>
          {trends.map((trend: MarketTrend) => (
            <div key={trend.id} className={styles.marketTrendItem}>
              <h5 className={styles.trendName}>{trend.name}
                <span className={styles.trendGrowthRate} style={{ color: trend.growthRate >= 0 ? 'var(--andrew-success)' : 'var(--andrew-error)'}}>
                  ({trend.growthRate >= 0 ? '+' : ''}{trend.growthRate}%)
                </span>
              </h5>
              <p className={styles.trendDescription}>{trend.description}</p>
            </div>
          ))}
        </div>
      )}
      <div className={styles.widgetFooter}>
        <p>Analysis based on latest available data.</p>
      </div>
    </div>
  );
};

export default MarketAnalysisWidget;
