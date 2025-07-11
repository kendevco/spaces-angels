// src/components/TenantControlPanel.tsx
'use client'; // Keep client directive if AndrewMartinControlPanel or its children use client features

import React from 'react';
import AndrewMartinControlPanel from './AndrewMartinControlPanel'; // Import the new panel

// The old TenantControlPanel is being replaced by the AndrewMartinControlPanel.
// This component will now simply act as a wrapper or direct renderer for it.
const TenantControlPanel: React.FC = () => {
  return <AndrewMartinControlPanel />;
};

export default TenantControlPanel;
