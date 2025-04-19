'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { menuOptions } from '@/lib/constants';
import clsx from 'clsx';
import { Separator } from '@/components/ui/separator';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

const MenuOptions = () => {
  const pathName = usePathname();
  // Add state for logout dialog
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  // Add loading state for the logout button
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Helper function to determine if a menu item is active
  const isActive = (menuItem: any, currentPath: any) => {
    if (menuItem.name === "Help") {
      return currentPath.startsWith("/help") || currentPath.endsWith("/checklist");
    }
    if (menuItem.href === "/CRM") {
      return currentPath.startsWith("/CRM");
    }
    return currentPath === menuItem.href;
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await axios.get("/api/auth/logout");
      if (response.data.success) {
        // Force a hard refresh to the login page
        window.location.href = '/login';
      }
    } catch (error: any) {
      console.error("Logout error:", error.message);
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };


  return (
    <nav className="z-[50] h-screen fixed border-r bg-[#04061E] border-[#37384B]/60 overflow-hidden scrollbar-hide justify-between flex items-center flex-col gap-6 py-5 px-2 w-16">
      {/* Logo */}
      <div className="flex items-center justify-center flex-col gap-8">
        <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
          <img src='/icons/zapllo.png' className='h-10 w-auto scale-90' alt="Zapllo Logo" />
        </Link>

        <Separator className="w-10 bg-[#37384B]/60" />

        {/* Menu Items */}
        <TooltipProvider>
          <div className="flex flex-col items-center space-y-4">
            {menuOptions.map((menuItem) => (
              <Tooltip key={menuItem.name} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link
                    href={menuItem.href}
                    className={clsx(
                      'group relative flex items-center justify-center rounded-lg w-10 h-10 transition-all duration-200',
                      isActive(menuItem, pathName)
                        ? 'bg-[#FC8929] text-white shadow-[0_0_10px_rgba(252,137,41,0.5)]'
                        : 'text-gray-400 hover:text-white hover:bg-[#1E2144]'
                    )}
                  >
                    {isActive(menuItem, pathName) && (
                      <div className="absolute left-0 w-1 h-5 rounded-r-full bg-white" />
                    )}
                    <menuItem.Component size={20} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex flex-col bg-[#0F1133]/90 text-white border-[#37384B] backdrop-blur-lg"
                >
                  <p className="font-medium">{menuItem.name}</p>
                  {menuItem.description && (
                    <p className="text-xs text-gray-400">{menuItem.description}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* User Avatar and Logout */}
      <div className="mt-auto mb-4 flex flex-col items-center gap-4">
        <Separator className="w-10 bg-[#37384B]/60" />



        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button onClick={handleLogoutClick} className="flex items-center justify-center h-9 w-9 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-[#0F1133]/90 text-white border-[#37384B] backdrop-blur-lg"
            >
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
         {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md z-[100]  ">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-400" />
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="">
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm ">
              You will need to log in again to access your dashboard and data.
            </p>
          </div>

          <DialogFooter className="flex sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={cancelLogout}
              className=" "
            >
              Cancel
            </Button>
            <Button
              onClick={confirmLogout}
              className="bg-red-500/80 hover:bg-red-600 text-white"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging out...
                </span>
              ) : (
                "Yes, log me out"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </nav>
  );
};

export default MenuOptions;
