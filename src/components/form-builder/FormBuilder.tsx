"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Settings, Eye, Trash2, Copy, Save, CheckCircle, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { IFormField } from '@/models/formBuilderModel';
import FieldProperties from './FieldProperties';
import FormSettings from './FormSettings';
import FormPreview from './FormPreview';
import FieldSelector from './FieldSelector';
import FormThemeSettings from './FormThemeSettings';
import FormIntegrationPanel from './FormIntegrationPanel';
import { fieldTypes } from './fieldTypes';
import axios from 'axios';

interface FormBuilderProps {
  initialForm?: any;
  isTemplate?: boolean;
  onSave?: (form: any) => void;
}

// Custom generateUniqueId function
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export default function FormBuilder({ initialForm, isTemplate = false, onSave }: FormBuilderProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('fields');
  const [formTitle, setFormTitle] = useState(initialForm?.name || 'Untitled Form');
  const [formDescription, setFormDescription] = useState(initialForm?.description || '');
  const [fields, setFields] = useState<IFormField[]>(initialForm?.fields || []);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [draggedField, setDraggedField] = useState<IFormField | null>(null);
  const [theme, setTheme] = useState(initialForm?.theme || {
    primaryColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    accentColor: '#EFF6FF',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.375rem',
    buttonStyle: 'filled',
    logoPosition: 'center',
  });
  const [formSettings, setFormSettings] = useState(initialForm?.settings || {
    captcha: true,
    allowAnonymous: true,
    requireLogin: false,
    multiPage: false,
    progressBar: true,
    autoSave: false,
    confirmationEmail: false,
  });
  const [integrations, setIntegrations] = useState(initialForm?.integrations || []);
  const [notifications, setNotifications] = useState(initialForm?.notifications || []);
  const [thankYouPage, setThankYouPage] = useState(initialForm?.thankYouPage || {
    message: 'Thank you for your submission!',
    redirectUrl: '',
    buttonText: 'Back to Home',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

    // ... existing state variables
    const [coverImage, setCoverImage] = useState(initialForm?.coverImage || null);

  // Sensors for drag and drop
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const sensors = useSensors(pointerSensor);

  useEffect(() => {
    // Set first field as selected if available and none selected
    if (fields.length > 0 && !selectedFieldId) {
      setSelectedFieldId(fields[0].id);
    }
  }, [fields, selectedFieldId]);

  const addField = (type: string) => {
    const fieldConfig = fieldTypes.find(f => f.type === type);
    if (!fieldConfig) return;

    const newField: IFormField = {
      id: generateUniqueId(),
      type: type as any,
      label: fieldConfig.defaultLabel || `New ${type} field`,
      placeholder: fieldConfig.defaultPlaceholder || '',
      required: false,
      options: fieldConfig.hasOptions ? [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' }
      ] : undefined,
      order: fields.length,
      ...fieldConfig.defaultProperties
    };

    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (updatedField: IFormField) => {
    setFields(fields.map(field =>
      field.id === updatedField.id ? updatedField : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(fields.length > 1 ? fields[0].id : null);
    }
  };

  const duplicateField = (id: string) => {
    const fieldToDuplicate = fields.find(field => field.id === id);
    if (!fieldToDuplicate) return;

    const duplicatedField = {
      ...fieldToDuplicate,
      id: generateUniqueId(),
      label: `${fieldToDuplicate.label} (Copy)`,
      order: fields.length
    };

    setFields([...fields, duplicatedField]);
    setSelectedFieldId(duplicatedField.id);
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    const field = fields.find(f => f.id === active.id);
    if (field) {
      setDraggedField(field);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedField(null);

    if (!over) return;

    // Move the field to a new position
    const activeField = fields.find(f => f.id === active.id);
    const overField = fields.find(f => f.id === over.id);

    if (!activeField || !overField || activeField.id === overField.id) return;

    // Reorder the fields
    const activeIndex = fields.findIndex(f => f.id === activeField.id);
    const overIndex = fields.findIndex(f => f.id === overField.id);

    const reorderedFields = [...fields];
    reorderedFields.splice(activeIndex, 1);
    reorderedFields.splice(overIndex, 0, activeField);

    // Update order property
    const updatedFields = reorderedFields.map((field, index) => ({
      ...field,
      order: index
    }));

    setFields(updatedFields);
  };

  const saveForm = async () => {
    if (!formTitle.trim()) {
      toast({
        title: "Form title is required",
        description: "Please enter a title for your form",
        variant: "destructive"
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: "Form has no fields",
        description: "Please add at least one field to your form",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      const formData = {
        id: initialForm?._id,
        name: formTitle,
        description: formDescription,
        fields: fields.sort((a, b) => a.order - b.order),
        theme,
        settings: formSettings,
        integrations,
        notifications,
        thankYouPage,
        isTemplate
      };

      if (onSave) {
        onSave(formData);
      } else {
        // Save to API
        const url = initialForm?._id
          ? `/api/forms/${initialForm._id}`
          : '/api/forms';

        const method = initialForm?._id ? 'put' : 'post';
        const response = await axios[method](url, formData);

        if (response.data.success) {
          toast({
            title: "Form saved successfully",
            description: initialForm?._id ? "Your changes have been saved" : "Your new form has been created",
          });

          if (!initialForm?._id && response.data.formId) {
            // Redirect to edit page if it was a new form
            window.location.href = `/forms/${response.data.formId}/edit`;
          }
        } else {
          throw new Error(response.data.message || "Failed to save form");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error saving form",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (previewMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Preview: {formTitle}</h2>
          <Button onClick={() => setPreviewMode(false)} variant="outline">Exit Preview</Button>
        </div>
        <div className="flex-grow overflow-auto p-4">
          <FormPreview
            fields={fields}
            theme={theme}
            formTitle={formTitle}
            formDescription={formDescription}
            settings={formSettings}
            thankYouPage={thankYouPage}
            multiPage={formSettings.multiPage}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header with actions */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-xl font-semibold bg-transparent border-0 outline-none focus:ring-0 px-0 w-full"
              placeholder="Enter form title..."
            />
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="text-sm text-muted-foreground bg-transparent border-0 outline-none focus:ring-0 px-0 w-full"
              placeholder="Enter form description..."
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(true)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={saveForm}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="animate-spin mr-1">⏳</span> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Form
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 max-h-screen overflow-y-scroll h-full">
        {/* Left sidebar with field types */}
        <div className="w-64 border-r p-4 overflow-y-auto">
          <h3 className="text-sm font-medium mb-3">Add Fields</h3>
          <FieldSelector onSelectField={addField} />
        </div>

        {/* Center area with form canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Plus className="h-12 w-12 mb-2" />
                  <h3 className="text-lg font-medium">Your form is empty</h3>
                  <p className="max-w-xs">Add form elements from the left panel to get started</p>
                </div>
              ) : (
                fields
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <DraggableField
                      key={field.id}
                      field={field}
                      onRemove={removeField}
                      onDuplicate={duplicateField}
                      isSelected={selectedFieldId === field.id}
                      onSelect={() => setSelectedFieldId(field.id)}
                    />
                  ))
              )}
            </div>

            {/* Drag overlay */}
            <DragOverlay>
              {draggedField ? (
                <div className="border rounded-md p-3 bg-card opacity-80 w-full max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium flex items-center">
                      {draggedField.label}
                      {draggedField.required && <span className="text-destructive ml-1">*</span>}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Right sidebar with settings */}
        <div className="w-80 border-l overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList  className="w-full bg-accent gap-4">
              <TabsTrigger value="fields" className="flex-1 border-none">Field</TabsTrigger>
              <TabsTrigger value="theme" className="flex-1 border-none">Theme</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 border-none">Settings</TabsTrigger>
            </TabsList>
            <div className="p-4">
              <TabsContent value="fields">
                {selectedFieldId ? (
                  <FieldProperties
                    field={fields.find(f => f.id === selectedFieldId)!}
                    onUpdate={updateField}
                  />
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Select a field to edit its properties
                  </p>
                )}
              </TabsContent>
              <TabsContent value="theme">
                <FormThemeSettings
                  theme={theme}
                  onChange={setTheme}
                />
              </TabsContent>
              <TabsContent value="settings">
                <FormSettings
                  settings={formSettings}
                  onChange={setFormSettings}
                  thankYouPage={thankYouPage}
                  onThankYouPageChange={setThankYouPage}
                  integrations={integrations}
                  onIntegrationsChange={setIntegrations}
                  notifications={notifications}
                  onNotificationsChange={setNotifications}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Draggable Field Component
function DraggableField({
  field,
  onRemove,
  onDuplicate,
  isSelected,
  onSelect
}: {
  field: IFormField;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: field.id,
    data: {
      field
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`border rounded-md p-3 bg-card ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium flex items-center">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </span>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(field.id);
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive/90"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(field.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Basic field preview */}
      <div className="text-sm text-muted-foreground">
        {field.type === 'text' && (
          <input
            type="text"
            disabled
            placeholder={field.placeholder || 'Text input'}
            className="w-full border rounded-md p-2 bg-muted/30 cursor-default"
          />
        )}
        {field.type === 'textarea' && (
          <textarea
            disabled
            placeholder={field.placeholder || 'Text area'}
            className="w-full border rounded-md p-2 bg-muted/30 h-16 resize-none cursor-default"
          />
        )}
        {field.type === 'select' && (
          <select
            disabled
            className="w-full border rounded-md p-2 bg-muted/30 cursor-default"
          >
            <option>{field.placeholder || 'Select an option'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        )}
        {field.type === 'radio' && (
          <div className="space-y-1">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  disabled
                  className="mr-2 cursor-default"
                />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )}
        {field.type === 'checkbox' && (
          <div className="space-y-1">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  disabled
                  className="mr-2 cursor-default"
                />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )}
        {field.type === 'email' && (
          <input
            type="email"
            disabled
            placeholder={field.placeholder || 'Email address'}
            className="w-full border rounded-md p-2 bg-muted/30 cursor-default"
          />
        )}
        {field.type === 'phone' && (
          <input
            type="tel"
            disabled
            placeholder={field.placeholder || 'Phone number'}
            className="w-full border rounded-md p-2 bg-muted/30 cursor-default"
          />
        )}
        {field.type === 'date' && (
          <input
            type="date"
            disabled
            className="w-full border rounded-md p-2 bg-muted/30 cursor-default"
          />
        )}
        {field.type === 'file' && (
          <div className="border border-dashed rounded-md p-4 text-center bg-muted/30">
            <span>Drop files here or click to upload</span>
          </div>
        )}
        {field.type === 'heading' && (
          <h3 className="text-lg font-bold">{field.label}</h3>
        )}
        {field.type === 'paragraph' && (
          <p>{field.label || 'Paragraph text'}</p>
        )}
        {field.type === 'divider' && (
          <hr className="my-2" />
        )}
      </div>
    </div>
  );
}
