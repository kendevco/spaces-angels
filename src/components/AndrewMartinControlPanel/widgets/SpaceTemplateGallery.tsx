// src/components/AndrewMartinControlPanel/widgets/SpaceTemplateGallery.tsx
import React from 'react';
import type { SpaceTemplate as SpaceTemplateData } from '@/types/andrew-martin';
import styles from '../styles.module.css';

interface SpaceTemplateGalleryProps {
  templates: SpaceTemplateData[];
  onUseTemplate: (templateId: string) => void;
}

const SpaceTemplateGallery: React.FC<SpaceTemplateGalleryProps> = ({ templates, onUseTemplate }) => {
  return (
    <div className={styles.spaceTemplateGallery}>
      <h3 className={styles.widgetTitle}>Space Templates</h3>
      {templates.length === 0 ? (
        <p>No templates available at the moment.</p>
      ) : (
        <div className={styles.templateGrid}>
          {templates.map((template) => (
            <div key={template.id} className={styles.templateCard}>
              {template.thumbnailUrl && (
                <img src={template.thumbnailUrl} alt={template.name} className={styles.templateThumbnail} />
              )}
              <div className={styles.templateCardBody}>
                <h5>{template.name}</h5>
                <p className={styles.templateDescription}>{template.description}</p>
                {template.features && template.features.length > 0 && (
                  <div className={styles.templateFeatures}>
                    <strong>Features:</strong>
                    <ul>
                      {template.features.slice(0,3).map(feature => <li key={feature}>{feature}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              <div className={styles.templateCardActions}>
                <button onClick={() => onUseTemplate(template.id)} className={styles.buttonPrimary}>
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpaceTemplateGallery;
