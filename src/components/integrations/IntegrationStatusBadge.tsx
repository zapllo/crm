import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

type IntegrationStatus = 'free' | 'premium' | 'purchased' | 'connected' | 'pending';

interface IntegrationStatusBadgeProps {
  status: IntegrationStatus;
  className?: string;
}

export default function IntegrationStatusBadge({ 
  status, 
  className = '' 
}: IntegrationStatusBadgeProps) {
  switch (status) {
    case 'free':
      return (
        <Badge 
          className={`bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ${className}`}
        >
          Free
        </Badge>
      );
    
    case 'premium':
      return (
        <Badge 
          className={`bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 ${className}`}
        >
          Premium
        </Badge>
      );
    
    case 'purchased':
      return (
        <Badge 
          variant="outline" 
          className={`flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 ${className}`}
        >
          <Clock className="h-3 w-3" />
          <span>In Progress</span>
        </Badge>
      );
    
    case 'connected':
      return (
        <Badge 
          variant="outline" 
          className={`flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200 ${className}`}
        >
          <CheckCircle2 className="h-3 w-3" />
          <span>Connected</span>
        </Badge>
      );
    
    case 'pending':
      return (
        <Badge 
          variant="outline" 
          className={`flex items-center gap-1 bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 ${className}`}
        >
          <AlertCircle className="h-3 w-3" />
          <span>Not Connected</span>
        </Badge>
      );
    
    default:
      return null;
  }
}