// src/components/AndrewMartinControlPanel/DashboardHeader.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardHeader from './DashboardHeader';
import type { UserProfile, NotificationCenter, QuickAction } from '@/types/andrew-martin';

// Mock data for the DashboardHeader props
const mockUserProfile: UserProfile = {
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: '/test-avatar.png',
};

const mockNotifications: NotificationCenter = {
  notifications: [
    { id: '1', message: 'Test notification 1', type: 'info', timestamp: new Date(), read: false },
    { id: '2', message: 'Test notification 2', type: 'success', timestamp: new Date(), read: true },
  ],
  unreadCount: 1,
};

const mockQuickActions: QuickAction[] = [
  { id: 'qa1', label: 'Test Action 1', action: jest.fn() },
  { id: 'qa2', label: 'Test Action 2', action: jest.fn(), icon: '🚀' },
];

describe('DashboardHeader Component', () => {
  it('renders the logo, header title, user name, and quick actions', () => {
    render(
      <DashboardHeader
        logo="/test-logo.png"
        userProfile={mockUserProfile}
        notifications={mockNotifications}
        quickActions={mockQuickActions}
      />
    );

    // Check for logo
    const logoImage = screen.getByAltText('Company Logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', '/test-logo.png');

    // Check for header title (using a more robust query if possible, e.g., by role if h1 is unique)
    expect(screen.getByText('Master Control Panel')).toBeInTheDocument();

    // Check for user name
    expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();

    // Check for quick actions
    expect(screen.getByText('Test Action 1')).toBeInTheDocument();
    expect(screen.getByText('Test Action 2')).toBeInTheDocument(); // Label part
    expect(screen.getByText('🚀')).toBeInTheDocument(); // Icon part
  });

  it('displays the unread notification count', () => {
    render(
      <DashboardHeader
        logo="/test-logo.png"
        userProfile={mockUserProfile}
        notifications={mockNotifications}
        quickActions={mockQuickActions}
      />
    );

    expect(screen.getByText(mockNotifications.unreadCount.toString())).toBeInTheDocument();
  });

  // Add more tests for interactivity (e.g., opening notification dropdown, user menu)
  // This would require simulating user events (fireEvent.click) and checking for появившихся элементов
});

// Basic test for one BI widget: BusinessMetricsWidget
// Create a similar test file for it: BusinessMetricsWidget.test.tsx

// For this step, only DashboardHeader.test.tsx is created.
// Other tests would follow the same pattern.
