// src/components/AndrewMartinControlPanel/widgets/DeploymentStatusTracker.tsx
import React from 'react';
import type { DeploymentStatus as DeploymentStatusData } from '@/types/andrew-martin';
import styles from '../styles.module.css';

interface DeploymentStatusTrackerProps {
  deployments: DeploymentStatusData[];
}

const DeploymentStatusTracker: React.FC<DeploymentStatusTrackerProps> = ({ deployments }) => {
  const getStatusColor = (status: DeploymentStatusData['status']) => {
    switch (status) {
      case 'completed': return 'var(--andrew-success)';
      case 'in_progress': return 'var(--andrew-info)';
      case 'queued': return 'var(--andrew-secondary)';
      case 'failed': return 'var(--andrew-error)';
      default: return 'var(--andrew-text-muted)';
    }
  };

  return (
    <div className={styles.deploymentStatusTracker}>
      <h3 className={styles.widgetTitle}>Deployment Queue</h3>
      {deployments.length === 0 ? (
        <p>No active or recent deployments.</p>
      ) : (
        <ul className={styles.deploymentList}>
          {deployments.map((dep) => (
            <li key={dep.id} className={styles.deploymentItem}>
              <div className={styles.deploymentInfo}>
                <span className={styles.deploymentName}>{dep.spaceName}</span>
                <span className={styles.deploymentStatus} style={{ color: getStatusColor(dep.status) }}>
                  {dep.status}
                </span>
              </div>
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${dep.progress}%`, backgroundColor: getStatusColor(dep.status) }}
                  role="progressbar"
                  aria-valuenow={dep.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className={styles.deploymentTimestamps}>
                <small>Started: {new Date(dep.startTime).toLocaleString()}</small>
                {dep.endTime && <small>Ended: {new Date(dep.endTime).toLocaleString()}</small>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DeploymentStatusTracker;
