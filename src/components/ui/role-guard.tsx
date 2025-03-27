"use client";

import React from "react";
import { hasPermission, PageName, PermissionAction } from "@/lib/rbac";
import { IUser } from "@/models/userModel";

interface RoleGuardProps {
  user: IUser | null;
  page: PageName;
  action: PermissionAction;
  fallback: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component to conditionally render content based on user permissions
 */
export function RoleGuard({
  user,
  page,
  action,
  fallback,
  children
}: RoleGuardProps) {
  if (hasPermission(user, page, action)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}