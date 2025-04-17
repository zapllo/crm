"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { fieldTypes } from './fieldTypes';

interface FieldSelectorProps {
  onSelectField: (type: string) => void;
}

export default function FieldSelector({ onSelectField }: FieldSelectorProps) {
  // Group field types by category
  const basicFields = fieldTypes.filter(field => field.category === 'basic');
  const advancedFields = fieldTypes.filter(field => field.category === 'advanced');
  const layoutFields = fieldTypes.filter(field => field.category === 'layout');

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid grid-cols-3 bg-accent gap-2 mb-4">
        <TabsTrigger className='border-none' value="basic">Basic</TabsTrigger>
        <TabsTrigger className='border-none' value="advanced">Advanced</TabsTrigger>
        <TabsTrigger className='border-none' value="layout">Layout</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-2">
        {basicFields.map(field => (
          <Button
            key={field.type}
            variant="outline"
            className="w-full justify-start"
            onClick={() => onSelectField(field.type)}
          >
            <field.icon className="h-4 w-4 mr-2" />
            {field.label}
          </Button>
        ))}
      </TabsContent>

      <TabsContent value="advanced" className="space-y-2">
        {advancedFields.map(field => (
          <Button
            key={field.type}
            variant="outline"
            className="w-full justify-start"
            onClick={() => onSelectField(field.type)}
          >
            <field.icon className="h-4 w-4 mr-2" />
            {field.label}
          </Button>
        ))}
      </TabsContent>

      <TabsContent value="layout" className="space-y-2">
        {layoutFields.map(field => (
          <Button
            key={field.type}
            variant="outline"
            className="w-full justify-start"
            onClick={() => onSelectField(field.type)}
          >
            <field.icon className="h-4 w-4 mr-2" />
            {field.label}
          </Button>
        ))}
      </TabsContent>
    </Tabs>
  );
}
