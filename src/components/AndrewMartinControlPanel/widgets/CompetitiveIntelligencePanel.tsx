// src/components/AndrewMartinControlPanel/widgets/CompetitiveIntelligencePanel.tsx
import React from 'react';
import type { CompetitiveIntelligencePanel as CompetitiveIntelligencePanelData, Competitor } from '@/types/andrew-martin';
import styles from '../styles.module.css';

interface CompetitiveIntelligencePanelProps extends CompetitiveIntelligencePanelData {
  // CompetitiveIntelligencePanelData has competitors: Competitor[]
}

const CompetitiveIntelligencePanel: React.FC<CompetitiveIntelligencePanelProps> = ({ competitors }) => {
  return (
    <div className={`${styles.widgetCard} ${styles.competitiveIntelligencePanel}`}>
      <h3 className={styles.widgetTitle}>Competitive Intelligence</h3>
      {competitors.length === 0 ? (
        <p>No specific competitor data available at the moment.</p>
      ) : (
        <div className={styles.competitorsList}>
          {competitors.map((competitor: Competitor) => (
            <div key={competitor.id} className={styles.competitorItem}>
              <h4 className={styles.competitorName}>{competitor.name}
                {competitor.marketShare !== undefined && (
                  <span className={styles.marketShare}> (Market Share: {competitor.marketShare}%)</span>
                )}
              </h4>
              {competitor.strengths && competitor.strengths.length > 0 && (
                <div className={styles.competitorStrengths}>
                  <strong>Strengths:</strong>
                  <ul>
                    {competitor.strengths.map((strength, index) => <li key={index}>{strength}</li>)}
                  </ul>
                </div>
              )}
              {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                <div className={styles.competitorWeaknesses}>
                  <strong>Weaknesses:</strong>
                  <ul>
                    {competitor.weaknesses.map((weakness, index) => <li key={index}>{weakness}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className={styles.widgetFooter}>
        <p>Data gathered from public sources and Leo AI analysis.</p>
      </div>
    </div>
  );
};

export default CompetitiveIntelligencePanel;
