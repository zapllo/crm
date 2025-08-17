"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, User, Building2, Target, Package, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

interface QuickActionsProps {
  onAddLead: () => void;
  onAddContact: () => void;
  onAddCompany: () => void;
  onAddFollowup: () => void;
  onAddProduct: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddLead,
  onAddContact,
  onAddCompany,
  onAddFollowup,
  onAddProduct,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions: QuickAction[] = [
    {
      id: 'lead',
      label: 'Add Lead',
      icon: <Target className="h-4 w-4" />,
      onClick: () => {
        onAddLead();
        setIsOpen(false);
      },
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'contact',
      label: 'Add Contact',
      icon: <User className="h-4 w-4" />,
      onClick: () => {
        onAddContact();
        setIsOpen(false);
      },
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'company',
      label: 'Add Company',
      icon: <Building2 className="h-4 w-4" />,
      onClick: () => {
        onAddCompany();
        setIsOpen(false);
      },
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      id: 'followup',
      label: 'Add Follow-up',
      icon: <Calendar className="h-4 w-4" />,
      onClick: () => {
        onAddFollowup();
        setIsOpen(false);
      },
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      id: 'product',
      label: 'Add Product',
      icon: <Package className="h-4 w-4" />,
      onClick: () => {
        onAddProduct();
        setIsOpen(false);
      },
      color: 'bg-pink-500 hover:bg-pink-600',
    },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="absolute bottom-6  right-6 z-50">
      <TooltipProvider>
        {/* Action Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-16 right-0 space-y-3"
            >
              {actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ 
                    opacity: 0, 
                    y: 20,
                    scale: 0.8,
                    x: 20
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: 1,
                    x: 0
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: 20,
                    scale: 0.8,
                    x: 20
                  }}
                  transition={{ 
                    duration: 0.2,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className="flex items-center justify-end group"
                >
                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="bg-background/90 backdrop-blur-sm text-foreground px-3 py-2 rounded-lg shadow-lg border mr-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    {action.label}
                  </motion.div>
                  
                  {/* Action Button */}
              
                      <Button
                        size="icon"
                        className={cn(
                          "h-12 w-12 rounded-full shadow-lg text-white transition-all duration-200 hover:scale-110 hover:shadow-xl",
                          action.color
                        )}
                        onClick={action.onClick}
                      >
                        {action.icon}
                      </Button>
                  
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl",
                isOpen 
                  ? "bg-red-500 hover:bg-red-600 rotate-45" 
                  : "bg-primary hover:bg-primary/90 rotate-0"
              )}
              onClick={toggleMenu}
            >
              <motion.div
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? (
                  <X className="h-6 w-6 text-white" />
                ) : (
                  <Plus className="h-6 w-6 text-white" />
                )}
              </motion.div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isOpen ? 'Close menu' : 'Quick actions'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};