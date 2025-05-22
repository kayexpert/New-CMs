"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MessageTemplate,
  MessagingConfiguration,
  MessageNotification
} from "@/types/messaging";
import { QUERY_KEYS } from "@/hooks/use-messaging";

interface MessagingContextType {
  // Notification state
  notifications: MessageNotification[];
  addNotification: (notification: MessageNotification) => void;
  dismissNotification: (id: string) => void;

  // Template management
  refreshTemplates: () => void;

  // Provider management
  refreshProviders: () => void;

  // Navigation
  navigateToSettings: (tab?: string) => void;

  // Status
  isRefreshing: boolean;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add a new notification
  const addNotification = (notification: MessageNotification) => {
    // Skip if notification is empty or missing required fields
    if (!notification || !notification.title || !notification.message) {
      return;
    }

    // Generate a unique ID if not provided
    const notificationWithId = {
      ...notification,
      id: notification.id || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: notification.timestamp || new Date().toISOString()
    };

    // Use functional update to avoid stale state
    setNotifications(prev => {
      // Check if notification with same ID already exists to prevent duplicates
      if (notificationWithId.id && prev.some(n => n.id === notificationWithId.id)) {
        return prev;
      }
      return [notificationWithId, ...prev];
    });

    // Show toast notification
    if (notification.showToast !== false) {
      toast[notification.type || "info"](notification.title, {
        description: notification.message,
        duration: notification.duration || 5000,
      });
    }

    // Auto-dismiss after duration if specified
    if (notification.autoDismiss !== false) {
      setTimeout(() => {
        dismissNotification(notificationWithId.id!);
      }, notification.duration || 5000);
    }
  };

  // Dismiss a notification by ID
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Refresh templates in the cache
  const refreshTemplates = async () => {
    // Prevent multiple refreshes at once
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates.all });

      // Use localStorage to notify other tabs/windows
      const notification = {
        id: `templates-refreshed-${Date.now()}`,
        type: 'success',
        title: 'Templates Updated',
        message: 'Message templates have been refreshed.',
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('messaging_notification', JSON.stringify(notification));

      // Don't call addNotification directly to avoid potential loops
      // The storage event listener will handle showing the notification
    } catch (error) {
      console.error("Error refreshing templates:", error);
      // Only show error notifications locally
      toast.error('Failed to refresh message templates.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refresh providers in the cache
  const refreshProviders = async () => {
    // Prevent multiple refreshes at once
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["messagingConfigurations"] });

      // Use localStorage to notify other tabs/windows
      const notification = {
        id: `providers-refreshed-${Date.now()}`,
        type: 'success',
        title: 'Providers Updated',
        message: 'SMS providers have been refreshed.',
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('messaging_notification', JSON.stringify(notification));

      // Don't call addNotification directly to avoid potential loops
      // The storage event listener will handle showing the notification
    } catch (error) {
      console.error("Error refreshing providers:", error);
      // Only show error notifications locally
      toast.error('Failed to refresh SMS providers.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Navigate to settings page with specific tab
  const navigateToSettings = (tab: string = "messages") => {
    window.location.href = `/settings?tab=${tab}`;
  };

  // Listen for storage events to sync notifications across tabs/pages
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'messaging_notification' && event.newValue) {
        try {
          const notification = JSON.parse(event.newValue) as MessageNotification;
          // Only process if it has an ID and we don't already have this notification
          if (notification.id && !notifications.some(n => n.id === notification.id)) {
            addNotification({
              ...notification,
              showToast: true
            });
          }
        } catch (error) {
          console.error("Error parsing notification from storage:", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [notifications, addNotification]); // Add notifications and addNotification as dependencies

  const value = {
    notifications,
    addNotification,
    dismissNotification,
    refreshTemplates,
    refreshProviders,
    navigateToSettings,
    isRefreshing
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
}
