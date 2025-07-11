// src/components/AndrewMartinControlPanel/SpaceOverviewGrid.tsx
import React from 'react';
import type { SpaceCard as SpaceCardData, SpaceTemplate as SpaceTemplateData, DeploymentStatus as DeploymentStatusData } from '@/types/andrew-martin';
import styles from './styles.module.css';
import SpaceCard from './widgets/SpaceCard';
import SpaceTemplateGallery from './widgets/SpaceTemplateGallery';
import DeploymentStatusTracker from './widgets/DeploymentStatusTracker';
import CloneWizardModal from './CloneWizardModal'; // Import the actual modal


interface SpaceOverviewGridProps {
  activeSpaces: SpaceCardData[];
  templates: SpaceTemplateData[];
  deploymentQueue: DeploymentStatusData[];
  // cloneWizard will be handled by a modal, triggered by a button here
}

const SpaceOverviewGrid: React.FC<SpaceOverviewGridProps> = ({
  activeSpaces,
  templates,
  deploymentQueue,
}) => {
  const [showCloneWizard, setShowCloneWizard] = React.useState(false);
  const [cloningSourceSpaceId, setCloningSourceSpaceId] = React.useState<string | undefined>(undefined);

  const handleOpenCloneWizard = (sourceSpaceId?: string) => {
    setCloningSourceSpaceId(sourceSpaceId);
    setShowCloneWizard(true);
  };

  const handleCloseCloneWizard = () => {
    setShowCloneWizard(false);
    setCloningSourceSpaceId(undefined);
  };

  const handleCloneSubmit = (request: any) => { // Changed from SpaceCloneRequest to any for now
    console.log('Clone Request Submitted:', request);
    // TODO: Implement actual cloning logic / API call
    handleCloseCloneWizard();
  };

  const handleManageSpace = (spaceId: string) => {
    console.log(`Manage space: ${spaceId}`);
    // TODO: Implement navigation or modal for managing space
  };

  const handleUseTemplate = (templateId: string) => {
    console.log(`Use template: ${templateId}`);
    handleOpenCloneWizard(templateId); // Open clone wizard with template as source
  }

  return (
    <div className={styles.spaceOverviewContainer}>
      <div className={styles.spaceActionsHeader}>
        <h3 className={styles.widgetTitle}>Active Spaces ({activeSpaces.length})</h3>
        <button onClick={() => handleOpenCloneWizard()} className={styles.primaryButton}>
          + Clone New Space
        </button>
      </div>

      {activeSpaces.length === 0 ? (
        <p>No active spaces. Clone one from a template or an existing space to get started!</p>
      ) : (
        <div className={styles.spaceGrid}>
          {activeSpaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onManage={handleManageSpace}
              onClone={() => handleOpenCloneWizard(space.id)}
            />
          ))}
        </div>
      )}

      <SpaceTemplateGallery templates={templates} onUseTemplate={handleUseTemplate} />
      <DeploymentStatusTracker deployments={deploymentQueue} />

      {showCloneWizard && (
        <CloneWizardModal
          isOpen={showCloneWizard}
          onClose={handleCloseCloneWizard}
          onSubmit={handleCloneSubmit}
          sourceSpaceId={cloningSourceSpaceId}
        />
      )}
    </div>
  );
};

export default SpaceOverviewGrid;
