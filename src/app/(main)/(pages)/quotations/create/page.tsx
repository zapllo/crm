'use client';

import React from 'react';
import CreateQuotationForm from '@/components/quotations/CreateQuotationForm';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CreateQuotationPage() {
  return (
    <ScrollArea className="h-full">
      <div className=" mx-auto ">
        <CreateQuotationForm />
      </div>
    </ScrollArea>
  );
}