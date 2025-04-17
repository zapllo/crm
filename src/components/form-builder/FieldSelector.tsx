"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fieldTypes } from './fieldTypes';
import { Search } from 'lucide-react';

interface FieldSelectorProps {
  onSelectField: (type: string) => void;
}

export default function FieldSelector({ onSelectField }: FieldSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Group field types by category
  const basicFields = fieldTypes.filter(field => field.category === 'basic');
  const advancedFields = fieldTypes.filter(field => field.category === 'advanced');
  const layoutFields = fieldTypes.filter(field => field.category === 'layout');

  // Filter fields based on search term
  const filterFields = (fields: typeof fieldTypes) => {
    if (!searchTerm) return fields;
    return fields.filter(field =>
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredBasic = filterFields(basicFields);
  const filteredAdvanced = filterFields(advancedFields);
  const filteredLayout = filterFields(layoutFields);

  // Check if we have any results
  const hasResults = filteredBasic.length > 0 || filteredAdvanced.length > 0 || filteredLayout.length > 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search fields..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {searchTerm && !hasResults ? (
        <div className="text-center py-4 text-muted-foreground">
          <p>No matching fields found</p>
        </div>
      ) : (
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-3 bg-muted/50 gap-2 mb-4 rounded-md">
            <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-2">
            {filteredBasic.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-2">No matching basic fields</p>
            ) : (
              filteredBasic.map(field => (
                <Button
                  key={field.type}
                  variant="ghost"
                  className="w-full justify-start h-9 px-2 hover:bg-accent"
                  onClick={() => onSelectField(field.type)}
                >
                  <field.icon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{field.label}</span>
                </Button>
              ))
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-2">
            {filteredAdvanced.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-2">No matching advanced fields</p>
            ) : (
              filteredAdvanced.map(field => (
                <Button
                  key={field.type}
                  variant="ghost"
                  className="w-full justify-start h-9 px-2 hover:bg-accent"
                  onClick={() => onSelectField(field.type)}
                >
                  <field.icon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{field.label}</span>
                </Button>
              ))
            )}
          </TabsContent>

          <TabsContent value="layout" className="space-y-2">
            {filteredLayout.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-2">No matching layout fields</p>
            ) : (
              filteredLayout.map(field => (
                <Button
                  key={field.type}
                  variant="ghost"
                  className="w-full justify-start h-9 px-2 hover:bg-accent"
                  onClick={() => onSelectField(field.type)}
                >
                  <field.icon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{field.label}</span>
                </Button>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
