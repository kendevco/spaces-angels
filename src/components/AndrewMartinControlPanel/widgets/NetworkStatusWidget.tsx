// src/components/AndrewMartinControlPanel/widgets/NetworkStatusWidget.tsx
import React from 'react';
import type { NetworkStatusProps, SuccessStory } from '@/types/andrew-martin';
import styles from '../styles.module.css';

const NetworkStatusWidget: React.FC<NetworkStatusProps> = ({
  activeAngels,
  totalRevenueGenerated,
  successStories,
  networkHealth,
}) => {
  const getHealthColor = (status: 'healthy' | 'degraded' | 'critical') => {
    if (status === 'healthy') return 'var(--andrew-success)';
    if (status === 'degraded') return 'var(--andrew-warning)';
    if (status === 'critical') return 'var(--andrew-error)';
    return 'var(--andrew-secondary)';
  };

  return (
    <div className={styles.widgetContent}>
      <h3 className={styles.widgetTitle}>Guardian Angel Network</h3>
      <div className={styles.networkStats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{activeAngels}</span>
          <span className={styles.statLabel}>Active Angels</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>${totalRevenueGenerated.toLocaleString()}</span>
          <span className={styles.statLabel}>Total Revenue Generated</span>
        </div>
      </div>

      <div className={styles.networkHealthSection}>
        <h4>Network Health:
          <span style={{ color: getHealthColor(networkHealth.overallStatus), marginLeft: '8px', textTransform: 'capitalize' }}>
            {networkHealth.overallStatus}
          </span>
        </h4>
        <p>Uptime: {networkHealth.uptimePercentage}%</p>
        <p>Avg. Response Time: {networkHealth.averageResponseTime}ms</p>
      </div>

      {successStories.length > 0 && (
        <div className={styles.successStoriesSection}>
          <h4>Success Stories</h4>
          {successStories.slice(0, 2).map((story: SuccessStory) => ( // Show a couple of stories
            <div key={story.id} className={styles.successStoryItem}>
              <h5>{story.title}</h5>
              <p>{story.summary}</p>
              {story.link && <a href={story.link} target="_blank" rel="noopener noreferrer">Read more</a>}
            </div>
          ))}
        </div>
      )}
       <div className={styles.widgetFooter}>
        <p>As of: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default NetworkStatusWidget;
