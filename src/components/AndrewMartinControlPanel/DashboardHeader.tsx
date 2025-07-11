// src/components/AndrewMartinControlPanel/DashboardHeader.tsx
import React from 'react';
import type { UserProfile, NotificationCenter, QuickAction } from '@/types/andrew-martin';
import styles from './styles.module.css'; // Assuming shared styles

interface DashboardHeaderProps {
  logo: string;
  userProfile: UserProfile;
  notifications: NotificationCenter;
  quickActions: QuickAction[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  logo,
  userProfile,
  notifications,
  quickActions,
}) => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <header className={styles.dashboardHeader}>
      <div className={styles.headerLeft}>
        <img src={logo} alt="Company Logo" className={styles.headerLogo} />
        <h1 className={styles.headerTitle}>Master Control Panel</h1>
      </div>
      <div className={styles.headerRight}>
        <div className={styles.quickActionsBar}>
          {quickActions.map((action) => (
            <button key={action.id} onClick={action.action} className={styles.quickActionButton} title={action.label}>
              {action.icon && <span className={styles.quickActionIcon}>{action.icon}</span>}
              <span className={styles.quickActionLabel}>{action.label}</span>
            </button>
          ))}
        </div>
        <div className={styles.notificationBell} onClick={() => setShowNotifications(!showNotifications)}>
          {/* Basic Bell Icon (replace with actual icon library if available) */}
          <span>🔔</span>
          {notifications.unreadCount > 0 && (
            <span className={styles.notificationBadge}>{notifications.unreadCount}</span>
          )}
          {showNotifications && (
            <div className={styles.notificationsDropdown}>
              <h3>Notifications</h3>
              {notifications.notifications.length === 0 ? (
                <p>No new notifications.</p>
              ) : (
                <ul>
                  {notifications.notifications.map((notif) => (
                    <li key={notif.id} className={notif.read ? styles.readNotification : styles.unreadNotification}>
                      <p><strong>{notif.type.toUpperCase()}</strong>: {notif.message}</p>
                      <small>{new Date(notif.timestamp).toLocaleTimeString()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className={styles.userProfileSection} onClick={() => setShowUserMenu(!showUserMenu)}>
          <img src={userProfile.avatarUrl || '/default-avatar.png'} alt={userProfile.name} className={styles.userAvatar} />
          <span className={styles.userName}>{userProfile.name}</span>
          {/* Basic Dropdown Icon (replace) */}
          <span>▼</span>
          {showUserMenu && (
            <div className={styles.userMenuDropdown}>
              <p>{userProfile.email}</p>
              <button onClick={() => console.log('Profile clicked')}>Profile</button>
              <button onClick={() => console.log('Settings clicked')}>Settings</button>
              <button onClick={() => console.log('Logout clicked')}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
