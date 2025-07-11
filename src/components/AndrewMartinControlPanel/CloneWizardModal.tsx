// src/components/AndrewMartinControlPanel/CloneWizardModal.tsx
import React, { useState } from 'react';
import type { SpaceCloneRequest, SpaceCustomization, DeploymentConfig, BusinessProfile } from '@/types/andrew-martin';
import styles from './styles.module.css';

interface CloneWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: SpaceCloneRequest) => void;
  sourceSpaceId?: string; // Optional, if cloning from an existing space
}

const initialCustomizations: SpaceCustomization = {
  branding: {},
  features: {},
  integrations: {},
  aiPersonality: { name: 'Leo Default', tone: 'friendly' },
};

const initialDeploymentConfig: DeploymentConfig = {
  environment: 'development',
  region: 'us-east-1',
  scaling: { minInstances: 1, maxInstances: 2 },
  monitoring: { alertsEnabled: true, logRetentionDays: 30 },
};

const initialBusinessProfile: BusinessProfile = {
  businessName: '',
  businessType: '',
  contactEmail: '',
};

const CloneWizardModal: React.FC<CloneWizardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sourceSpaceId = 'template_default', // Default to a new template if no source
}) => {
  const [targetName, setTargetName] = useState('');
  const [targetDomain, setTargetDomain] = useState('');
  const [customizations, setCustomizations] = useState<SpaceCustomization>(initialCustomizations);
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>(initialDeploymentConfig);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Example steps: Basic Info, Customization, Deployment, Review

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const request: SpaceCloneRequest = {
      sourceSpaceId,
      targetName,
      targetDomain,
      customizations,
      deploymentConfig,
      businessProfile,
    };
    onSubmit(request);
    // Reset form or close modal after submission
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };


  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Clone Space Wizard (Step {currentStep}/{totalSteps})</h2>
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <fieldset>
              <legend>Basic Information</legend>
              <div>
                <label htmlFor="targetName">New Space Name:</label>
                <input
                  id="targetName"
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  required
                  className={styles.formInput}
                />
              </div>
              <div>
                <label htmlFor="targetDomain">Target Domain (optional):</label>
                <input
                  id="targetDomain"
                  type="text"
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  placeholder="e.g., mynewspace.example.com"
                  className={styles.formInput}
                />
              </div>
               <div>
                <label htmlFor="businessName">Business Name:</label>
                <input
                  id="businessName"
                  type="text"
                  value={businessProfile.businessName}
                  onChange={(e) => setBusinessProfile({...businessProfile, businessName: e.target.value})}
                  required
                  className={styles.formInput}
                />
              </div>
              <div>
                <label htmlFor="businessType">Business Type:</label>
                <input
                  id="businessType"
                  type="text"
                  value={businessProfile.businessType}
                  onChange={(e) => setBusinessProfile({...businessProfile, businessType: e.target.value})}
                  required
                  className={styles.formInput}
                />
              </div>
            </fieldset>
          )}

          {currentStep === 2 && (
            <fieldset>
              <legend>Customizations</legend>
              {/* Basic examples, will be expanded */}
              <div>
                <label htmlFor="primaryColor">Primary Color:</label>
                <input
                  id="primaryColor"
                  type="color"
                  value={customizations.branding.primaryColor || '#1e40af'}
                  onChange={(e) => setCustomizations(prev => ({...prev, branding: {...prev.branding, primaryColor: e.target.value}}))}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label htmlFor="aiTone">AI Tone:</label>
                <select
                  id="aiTone"
                  value={customizations.aiPersonality.tone}
                  onChange={(e) => setCustomizations(prev => ({...prev, aiPersonality: {...prev.aiPersonality, tone: e.target.value as 'formal' | 'friendly' | 'humorous'}}))}
                  className={styles.formSelect}
                >
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                  <option value="humorous">Humorous</option>
                </select>
              </div>
            </fieldset>
          )}

          {currentStep === 3 && (
            <fieldset>
              <legend>Deployment Configuration</legend>
              <div>
                <label htmlFor="environment">Environment:</label>
                <select
                  id="environment"
                  value={deploymentConfig.environment}
                  onChange={(e) => setDeploymentConfig(prev => ({...prev, environment: e.target.value as 'development' | 'staging' | 'production'}))}
                  className={styles.formSelect}
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
               <div>
                <label htmlFor="region">Region:</label>
                <input
                  id="region"
                  type="text"
                  value={deploymentConfig.region}
                  onChange={(e) => setDeploymentConfig(prev => ({...prev, region: e.target.value}))}
                  className={styles.formInput}
                />
              </div>
            </fieldset>
          )}

          {currentStep === 4 && (
            <fieldset>
              <legend>Review &amp; Deploy</legend>
              <p><strong>New Space Name:</strong> {targetName}</p>
              <p><strong>Business Name:</strong> {businessProfile.businessName}</p>
              <p><strong>Environment:</strong> {deploymentConfig.environment}</p>
              <p>Review all settings before deploying.</p>
              <button type="submit" className={styles.primaryButton}>Deploy Cloned Space</button>
            </fieldset>
          )}

          <div className={styles.modalActions}>
            {currentStep > 1 && <button type="button" onClick={handlePrevStep} className={styles.secondaryButton}>Previous</button>}
            {currentStep < totalSteps && <button type="button" onClick={handleNextStep} className={styles.primaryButton}>Next</button>}
            <button type="button" onClick={onClose} className={styles.secondaryButton}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloneWizardModal;
