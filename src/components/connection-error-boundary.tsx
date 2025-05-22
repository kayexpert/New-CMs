"use client";

import { useState, useEffect, ReactNode } from "react";
import { ConnectionError } from "@/components/ui/connection-error";
import { checkDatabaseHealth } from "@/lib/db-enhanced";

interface ConnectionErrorBoundaryProps {
  children: ReactNode;
}

export function ConnectionErrorBoundary({ children }: ConnectionErrorBoundaryProps) {
  // Initialize with null to avoid hydration mismatch
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);

  // First, detect if we're on the client
  useEffect(() => {
    setIsClient(true);
    setIsOnline(navigator.onLine);
  }, []);

  // Monitor online status - only run after initial client detection
  useEffect(() => {
    if (!isClient) return;

    const handleOnline = () => {
      setIsOnline(true);
      // Check database health when we come back online
      checkHealth();
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial health check
    checkHealth();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isClient]);

  const checkHealth = async () => {
    if (!isClient || isOnline === false) return;

    try {
      const health = await checkDatabaseHealth();

      if (!health.healthy) {
        setError(new Error(health.error || "Database connection error"));
      } else {
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const handleRetry = async () => {
    setError(null);
    await checkHealth();
  };

  // Always render children on the server to avoid hydration mismatch
  if (!isClient) {
    return <>{children}</>;
  }

  // Only show error UI on the client after hydration
  if (isOnline === false) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <ConnectionError
          title="You're Offline"
          description="Please check your internet connection and try again."
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <ConnectionError
          error={error}
          title="Connection Error"
          description="We're having trouble connecting to our services."
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return <>{children}</>;
}
