"use client";

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import AddLead from '@/components/modals/leads/AddLead';

export interface AddLeadRef {
  open: () => void;
  close: () => void;
}

interface AddLeadWrapperProps {
  onLeadCreated?: () => void;
}

export const AddLeadWrapper = forwardRef<AddLeadRef, AddLeadWrapperProps>(
  ({ onLeadCreated }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

    return (
      <AddLead
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onLeadCreated={onLeadCreated}
      />
    );
  }
);

AddLeadWrapper.displayName = "AddLeadWrapper";