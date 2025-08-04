"use client";

import { useEffect } from 'react';
import { useUserContext } from '@/contexts/userContext';

export function PreloadPermissions() {
  const { user } = useUserContext();
  
  // Preload permissions as soon as we have a user
  useEffect(() => {
    if (!user?.userId) return;
    
    const preloadPermissions = async () => {
      try {
        // Make a fetch request to warm up the API and cache the response
        const response = await fetch('/api/permissions', { 
          credentials: 'include',
          cache: 'no-store'
        });
        
        // Optional: log success for debugging
        if (response.ok) {
          console.log('Permissions preloaded successfully');
        }
      } catch (error) {
        // Just log the error, don't display it to users
        console.error('Failed to preload permissions:', error);
      }
    };
    
    // Execute preloading with a minimal delay to not block initial render
    const timeoutId = setTimeout(() => {
      preloadPermissions();
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [user?.userId]);
  
  // This component doesn't render anything
  return null;
}