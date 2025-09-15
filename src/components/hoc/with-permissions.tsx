import { ComponentType, useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { NoPermissionFallback } from '@/components/ui/no-permission-fallback';
import { Loader2 } from 'lucide-react';

export type PermissionCheck = 'view' | 'add' | 'edit' | 'delete';

interface WithPermissionProps {
  page: string;
  permission: PermissionCheck;
  fallback?: ComponentType;
}

export function withPermission<P extends object>(
  Component: ComponentType<P>,
  { page, permission, fallback: Fallback }: WithPermissionProps
) {
  return function PermissionWrapper(props: P) {
    const { isInitialized, canView, canAdd, canEdit, canDelete } = usePermissions();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
      if (!isInitialized) return;

      let result = false;
      switch (permission) {
        case 'view':
          result = canView(page);
          break;
        case 'add':
          result = canAdd(page);
          break;
        case 'edit':
          result = canEdit(page);
          break;
        case 'delete':
          result = canDelete(page);
          break;
      }
      setHasPermission(result);
    }, [isInitialized, page, permission]);

    if (!isInitialized) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      );
    }

    if (hasPermission === false) {
      if (Fallback) {
        return <Fallback />;
      }
      return (
        <NoPermissionFallback 
          title={`No ${permission} Permission`}
          description={`You don't have permission to ${permission} ${page.toLowerCase()}.`}
        />
      );
    }

    return <Component {...props} />;
  };
}