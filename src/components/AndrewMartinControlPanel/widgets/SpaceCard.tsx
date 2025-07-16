// src/components/AndrewMartinControlPanel/widgets/SpaceCard.tsx
import React from 'react';
import type { SpaceCard as SpaceCardData } from '@/types/andrew-martin';
import styles from '../styles.module.css';

interface SpaceCardProps {
  space: SpaceCardData;
  onManage: (spaceId: string) => void;
  onClone: (spaceId: string) => void;
}

const SpaceCard: React.FC<SpaceCardProps> = ({ space, onManage, onClone }) => {
  return (
    <div className={styles.spaceCard}>
      <div className={styles.spaceCardHeader}>
        <h4>{space.name}</h4>
        <span className={`${styles.statusBadge} ${styles[(space.status || 'unknown').toLowerCase()]}`}>
          {space.status}
        </span>
      </div>
      {space.thumbnailUrl && (
        <img src={space.thumbnailUrl} alt={space.name} className={styles.spaceCardThumbnail} />
      )}
      <div className={styles.spaceCardBody}>
        <p>
          <strong>Domain:</strong>{' '}
          <a href={`http://${space.domain}`} target="_blank" rel="noopener noreferrer">
            {space.domain}
          </a>
        </p>
        <p>
          <strong>Last Activity:</strong> {space.lastActivity}
        </p>
      </div>
      <div className={styles.spaceCardActions}>
        <button onClick={() => onManage(space.id)} className={styles.buttonSecondary}>Manage</button>
        <button onClick={() => onClone(space.id)} className={styles.buttonPrimary}>Clone</button>
      </div>
    </div>
  );
};

export default SpaceCard;
