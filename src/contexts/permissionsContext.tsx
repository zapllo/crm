"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useUserContext } from './userContext';

// Define our permission state structure
interface PermissionsState {
  initialized: boolean;
  isLoading: boolean;
  isOrgAdmin: boolean; // Add this flag to track org admin status
  pages: Record<string, {
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }>;
  leadAccess: 'ALL' | 'ASSIGNED' | 'TEAM' | 'NONE';
  features: Record<string, boolean>;
}

// Global permissions store with loading state
const permissionsStore: PermissionsState = {
  initialized: false,
  isLoading: true,
  isOrgAdmin: false, // Default to false
  pages: {},
  leadAccess: 'NONE',
  features: {}
};

// Create a context to track loading state
const PermissionsContext = createContext<{
  isLoading: boolean;
  initialized: boolean;
}>({
  isLoading: true,
  initialized: false
});

// Export context hook
export function usePermissionStatus() {
  return useContext(PermissionsContext);
}

// Global helper functions - MODIFIED TO CHECK FOR ORG ADMIN
export function canView(page: string) {
  // Organization admins can view everything
  if (permissionsStore.isOrgAdmin) return true;

  return !!permissionsStore.pages[page]?.canView;
}

export function canAdd(page: string) {
  // Organization admins can add everything
  if (permissionsStore.isOrgAdmin) return true;

  return !!permissionsStore.pages[page]?.canAdd;
}

export function canEdit(page: string) {
  // Organization admins can edit everything
  if (permissionsStore.isOrgAdmin) return true;

  return !!permissionsStore.pages[page]?.canEdit;
}

export function canDelete(page: string) {
  // Organization admins can delete everything
  if (permissionsStore.isOrgAdmin) return true;

  return !!permissionsStore.pages[page]?.canDelete;
}

export function hasFeature(feature: string) {
  // Organization admins have access to all features
  if (permissionsStore.isOrgAdmin) return true;

  return !!permissionsStore.features[feature];
}

export function getPermissionStatus() {
  return {
    isLoading: permissionsStore.isLoading,
    initialized: permissionsStore.initialized
  };
}

// Cache for permissions - reduces network requests on page navigation
let lastFetchedUserId: string | null = null;

// Provider component
export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserContext();
  const [state, setState] = useState({
    isLoading: true,
    initialized: false
  });

  useEffect(() => {
    // If user isn't logged in yet, keep waiting
    if (!user?.userId) return;

    // If we already loaded permissions for this user, don't fetch again
    if (lastFetchedUserId === user.userId && permissionsStore.initialized) {
      setState({
        isLoading: false,
        initialized: true
      });
      return;
    }

    // Reset loading state and fetch permissions
    permissionsStore.isLoading = true;
    setState({ isLoading: true, initialized: false });

    // Use a timeout to prevent race conditions
    const timeoutId = setTimeout(() => {
      fetchPermissions();
    }, 0);

    return () => clearTimeout(timeoutId);

    async function fetchPermissions() {
      try {
        // Set the isOrgAdmin flag based on user context
        permissionsStore.isOrgAdmin = !!user?.isOrgAdmin;

        // If user is an org admin, we can skip fetching permissions
        // but we still need to initialize the store to mark as loaded
        if (user?.isOrgAdmin) {
          // For org admins, still fetch permissions but use them as fallback only
          // This ensures we have some permission data in case isOrgAdmin gets revoked
          try {
            const response = await axios.get('/api/permissions');

            const { pagePermissions = [], leadAccess = 'ALL', featurePermissions = [] } = response.data;

            // Transform page permissions - optimized for performance
            const pageObj: Record<string, {
              canView: boolean;
              canAdd: boolean;
              canEdit: boolean;
              canDelete: boolean;
            }> = {};
            for (const p of pagePermissions) {
              pageObj[p.page] = {
                canView: true, // Always true for admins
                canAdd: true,  // Always true for admins
                canEdit: true, // Always true for admins
                canDelete: true, // Always true for admins
              };
            }

            // Transform feature permissions - optimized for performance
            const featureObj: Record<string, boolean> = {};
            for (const f of featurePermissions) {
              featureObj[f.feature] = true; // Always true for admins
            }

            // Update store with both the admin flag and the actual permissions
            permissionsStore.pages = pageObj;
            permissionsStore.leadAccess = 'ALL'; // Admins always have ALL access
            permissionsStore.features = featureObj;
          } catch (error) {
            // For org admins, errors during permission fetch aren't critical
            console.warn('Failed to fetch fallback permissions for org admin:', error);
          }

          // Cache the current user ID
          lastFetchedUserId = user?.userId || null;

          // For org admins, we can immediately set initialized to true
          permissionsStore.initialized = true;
          permissionsStore.isLoading = false;

          // Update the state
          setState({
            isLoading: false,
            initialized: true
          });
          return;
        }

        // For non-admins, fetch permissions as normal
        const response = await axios.get('/api/permissions');

        const { pagePermissions = [], leadAccess = 'NONE', featurePermissions = [] } = response.data;

        // Transform page permissions - optimized for performance
        const pageObj: Record<string, {
          canView: boolean;
          canAdd: boolean;
          canEdit: boolean;
          canDelete: boolean;
        }> = {};
        for (const p of pagePermissions) {
          pageObj[p.page] = {
            canView: Boolean(p.canView),
            canAdd: Boolean(p.canAdd),
            canEdit: Boolean(p.canEdit),
            canDelete: Boolean(p.canDelete),
          };
        }

        // Transform feature permissions - optimized for performance
        const featureObj: Record<string, boolean> = {};
        for (const f of featurePermissions) {
          featureObj[f.feature] = Boolean(f.enabled);
        }

        // Cache the current user ID
        lastFetchedUserId = user?.userId || null;

        // Update store
        permissionsStore.pages = pageObj;
        permissionsStore.leadAccess = leadAccess;
        permissionsStore.features = featureObj;
        permissionsStore.initialized = true;
        permissionsStore.isLoading = false;

        // Update the state
        setState({
          isLoading: false,
          initialized: true
        });
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        // Even on error, we should stop loading
        permissionsStore.initialized = true;
        permissionsStore.isLoading = false;
        setState({
          isLoading: false,
          initialized: true
        });
      }
    }
  }, [user?.userId, user?.isOrgAdmin]); // Added isOrgAdmin to dependency array

  return (
    <PermissionsContext.Provider value={state}>
      {children}
    </PermissionsContext.Provider>
  );
};