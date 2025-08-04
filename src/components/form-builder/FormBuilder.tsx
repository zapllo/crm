"use client";

import React, { useState, useEffect } from 'react';
import {
  Plus, Settings, Eye, Trash2, Copy, Save, CheckCircle, ArrowDown, PanelLeftClose,
  PanelLeftOpen, PanelRightClose, PanelRightOpen, Layers, ChevronDown,
  ChevronRight, GripVertical, Check
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { IFormField } from '@/models/formBuilderModel';
import FieldProperties from './FieldProperties';
import FormSettings from './FormSettings';
import FormPreview from './FormPreview';
import FieldSelector from './FieldSelector';
import FormThemeSettings from './FormThemeSettings';
import FormIntegrationPanel from './FormIntegrationPanel';
import { fieldTypes } from './fieldTypes';
import axios from 'axios';
import FormCoverImage from './FormCoverImage';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [coverImage, setCoverImage] = useState(initialForm?.coverImage || null);

  const [over, setOver] = useState<any>(null);

  // States for collapsible panels
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [fieldGroupsCollapsed, setFieldGroupsCollapsed] = useState<Record<string, boolean>>({});

  // Group field types
  const fieldGroups = [
    {
      id: 'basic',
      name: 'Basic Fields',
      types: ['text', 'textarea', 'number', 'email', 'phone']
    },
    {
      id: 'choice',
      name: 'Choice Fields',
      types: ['select', 'radio', 'checkbox', 'toggle']
    },
    {
      id: 'advanced',
      name: 'Advanced Fields',
      types: ['date', 'time', 'file', 'rating', 'signature']
    },
    {
      id: 'layout',
      name: 'Layout Elements',
      types: ['heading', 'paragraph', 'divider', 'spacer']
    }
  ];

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

    // Show a subtle toast notification
    toast({
      title: "Field added",
      description: `Added a new ${fieldConfig.label} field`,
    });
  };

  const updateField = (updatedField: IFormField) => {
    setFields(fields.map(field =>
      field.id === updatedField.id ? updatedField : field
    ));
  };

  const removeField = (id: string) => {
    const fieldToRemove = fields.find(field => field.id === id);
    if (!fieldToRemove) return;

    setFields(fields.filter(field => field.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(fields.length > 1 ? fields[0].id : null);
    }

    toast({
      title: "Field removed",
      description: `Removed ${fieldToRemove.label} field`,
      variant: "default"
    });
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

    toast({
      title: "Field duplicated",
      description: `Created a copy of ${fieldToDuplicate.label}`,
    });
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    const field = fields.find(f => f.id === active.id);
    if (field) {
      setDraggedField(field);
    }
  };

  useEffect(() => {
    // Set first field as selected if available and none selected
    if (fields.length > 0 && !selectedFieldId) {
      setSelectedFieldId(fields[0].id);
    }

    // Ensure the right panel shows Field tab when a field is selected
    if (selectedFieldId && activeTab !== 'fields') {
      setActiveTab('fields');
    }
  }, [fields, selectedFieldId]);

  // Now update the handleDragEnd function to work with these drop indicators:

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedField(null);

    if (!over) return;

    // Check if we're dragging an existing field
    if (typeof active.id === 'string' && over) {
      const activeField = fields.find(f => f.id === active.id);
      if (!activeField) return;

      // Create a new array with the fields in the current order
      const reorderedFields = [...fields].sort((a, b) => a.order - b.order);
      const activeIndex = reorderedFields.findIndex(f => f.id === activeField.id);

      // Remove the dragged field from the array
      reorderedFields.splice(activeIndex, 1);

      let dropIndex = 0;

      // Drop at the start of the list
      if (over.id === 'drop-start') {
        dropIndex = 0;
      }
      // Drop after a specific field
      else if (typeof over.id === 'string' && over.id.startsWith('drop-')) {
        const targetFieldId = over.id.replace('drop-', '');
        if (targetFieldId === 'start') {
          dropIndex = 0;
        } else {
          const targetIndex = reorderedFields.findIndex(f => f.id === targetFieldId);
          dropIndex = targetIndex + 1;
        }
      }

      // Insert the field at the new position
      reorderedFields.splice(dropIndex, 0, activeField);

      // Update the order property of each field
      const updatedFields = reorderedFields.map((field, index) => ({
        ...field,
        order: index
      }));

      setFields(updatedFields);

      toast({
        title: "Field reordered",
        description: `${activeField.label} has been moved`,
        variant: "default"
      });
    }
  };

  const toggleFieldGroup = (groupId: string) => {
    setFieldGroupsCollapsed({
      ...fieldGroupsCollapsed,
      [groupId]: !fieldGroupsCollapsed[groupId]
    });
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
        coverImage,
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
      <div className="w-full h-full max-h-screen overflow-y-scroll  mb-20 flex flex-col bg-background">
        <div className="flex justify-between items-center p-4 mb-12  border-b bg-card/50">
          <h2 className="text-xl font-medium flex items-center">
            <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
            Preview: {formTitle}
          </h2>
          <Button onClick={() => setPreviewMode(false)} variant="outline" size="sm">
            Exit Preview
          </Button>
        </div>
        <div className="flex-grow  overflow-auto p-4">
          <div className="max-w-3xl mb-36 mx-auto">
            <FormPreview
              fields={fields}
              theme={theme}
              formTitle={formTitle}
              formDescription={formDescription}
              settings={formSettings}
              thankYouPage={thankYouPage}
              multiPage={formSettings.multiPage}
              coverImage={coverImage}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-12 h-full w-full overflow-hidden bg-background/95 rounded-md shadow-sm border">
      {/* Header with actions - simplified and modernized */}
      <div className="flex justify-between items-center p-4 border-b bg-card/50">
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-xl font-semibold bg-transparent border-0 outline-none focus:ring-0 px-0 w-full transition-all"
              placeholder="Enter form title..."
            />
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="text-sm text-muted-foreground bg-transparent border-0 outline-none focus:ring-0 px-0 w-full transition-all"
              placeholder="Enter form description..."
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setPreviewMode(true)}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preview your form as users will see it</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5"
                  onClick={saveForm}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin">⏳</span> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save your form changes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Main content with collapsible panels */}
      <div className="flex flex-1  h-full overflow-y-auto scrollbar-hide md:px-6 lg:px-8"
        style={{
          maxHeight: 'calc(100vh - 16px)', // Adjust based on your layout
          scrollBehavior: 'auto' // Prevent smooth scrolling which can interfere
        }}>
        {/* Left sidebar with field types - collapsible */}
        <div
          className={cn(
            "border-r bg-card/30 transition-all duration-300 ease-in-out relative",
            leftPanelCollapsed ? "w-14" : "w-72"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-3 -mr-3 z-10 h-6 w-6 rounded-full border bg-background shadow-sm"
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          >
            {leftPanelCollapsed ?
              <PanelRightOpen className="h-3 w-3" /> :
              <PanelLeftClose className="h-3 w-3" />
            }
          </Button>

          {leftPanelCollapsed ? (
            <div className="scrollbar-hide sticky flex h-fit max-h-screen overflow-y-scroll flex-col items-center py-12 space-y-6">
              {fieldGroups.map((group) => (
                <TooltipProvider key={group.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-2">
                        <div className="text-xs text-center text-muted-foreground">
                          {/* {group.name.split(' ')[0]} */}
                        </div>
                        <div className="space-y-1 ">
                          {group.types.slice(0, 3).map((type) => {
                            const fieldType = fieldTypes.find(f => f.type === type);
                            if (!fieldType) return null;

                            return (
                              <Button
                                key={type}
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8"
                                onClick={() => addField(type)}
                              >
                                {fieldType.icon && <fieldType.icon className="h-4 w-4" />}
                              </Button>
                            );
                          })}
                          {group.types.length > 3 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-8 h-8">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {group.types.slice(3).map((type) => {
                                  const fieldType = fieldTypes.find(f => f.type === type);
                                  if (!fieldType) return null;

                                  return (
                                    <DropdownMenuItem
                                      key={type}
                                      onClick={() => addField(type)}
                                      className="cursor-pointer"
                                    >
                                      {fieldType.icon && <fieldType.icon className="h-4 w-4 mr-2" />}
                                      {fieldType.label}
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{group.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ) : (
            <div style={{
              maxHeight: 'calc(100vh - 16px)', // Adjust based on your layout
              scrollBehavior: 'auto' // Prevent smooth scrolling which can interfere
            }}
             className="mb-24 ">
              <div className="py-4 space-y-6">
                <h3 className="text-sm font-medium px-2">Add Fields</h3>

                {fieldGroups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <div
                      className="flex items-center justify-between cursor-pointer px-2"
                      onClick={() => toggleFieldGroup(group.id)}
                    >
                      <h4 className="text-sm font-medium text-muted-foreground">{group.name}</h4>
                      {fieldGroupsCollapsed[group.id] ?
                        <ChevronRight className="h-4 w-4" /> :
                        <ChevronDown className="h-4 w-4" />
                      }
                    </div>

                    {!fieldGroupsCollapsed[group.id] && (
                      <div className="grid grid-cols-2 gap-2">
                        {group.types.map((type) => {
                          const fieldType = fieldTypes.find(f => f.type === type);
                          if (!fieldType) return null;

                          return (
                            <Button
                              key={type}
                              variant="ghost"
                              size="sm"
                              className="justify-start h-10 px-3 hover:bg-accent"
                              onClick={() => addField(type)}
                            >
                              {fieldType.icon && <fieldType.icon className="h-4 w-4 mr-2" />}
                              <span className="truncate">{fieldType.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    )}

                    <Separator className="my-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center area with form canvas */}
        <div className="flex-1 mb-12   flex flex-col overflow- bg-accent/20">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={({ over }) => setOver(over)}
          >
            <ScrollArea className="flex-1 mb -">
              <div className="max-w-3xl mx-auto p-6 space-y-4">
                {/* Add cover image component at the top */}
                <FormCoverImage
                  coverImage={coverImage}
                  onImageChange={setCoverImage}
                />

                {fields.length === 0 ? (
                  <div className="flex flex-col items-center  justify-center py-20 text-center text-muted-foreground bg-card/40 rounded-lg border border-dashed">
                    <Plus className="h-12 w-12 mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">Your form is empty</h3>
                    <p className="max-w-xs mt-2">Add form elements from the left panel to get started</p>
                  </div>
                ) : (
                  <>
                    {/* Drop area at the top of the list */}
                    <DropIndicator
                      id="drop-start"
                      isHovering={draggedField !== null && over?.id === "drop-start"}
                    />

                    {fields
                      .sort((a, b) => a.order - b.order)
                      .map((field, index) => (
                        <React.Fragment key={field.id}>
                          <DraggableField
                            field={field}
                            onRemove={removeField}
                            onDuplicate={duplicateField}
                            isSelected={selectedFieldId === field.id}
                            onSelect={() => setSelectedFieldId(field.id)}
                          />
                          {/* Add a drop indicator after each field */}
                          <DropIndicator
                            id={`drop-${field.id}`}
                            isHovering={draggedField !== null && over?.id === `drop-${field.id}`}
                          />
                        </React.Fragment>
                      ))}
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Drag overlay */}
            <DragOverlay>
              {draggedField ? (
                <div className="border rounded-md p-3 bg-card opacity-80 w-full max-w-md shadow-md">
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

        {/* Right sidebar with settings - collapsible */}
        <div
          className={cn(
            "border-l bg-card/30 sticky  transition-all duration-300 ease-in-out ",
            rightPanelCollapsed ? "w-14" : "w-80"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-3 -ml-3 z-10 h-6 w-6 rounded-full border bg-background shadow-sm"
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          >
            {rightPanelCollapsed ?
              <PanelLeftOpen className="h-3 w-3" /> :
              <PanelRightClose className="h-3 w-3" />
            }
          </Button>

          {rightPanelCollapsed ? (
            <div className="h-full flex flex-col items-center pt-12 space-y-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTab === "fields" ? "secondary" : "ghost"}
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => {
                        setActiveTab("fields");
                        setRightPanelCollapsed(false);
                      }}
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Field Properties</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTab === "theme" ? "secondary" : "ghost"}
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => {
                        setActiveTab("theme");
                        setRightPanelCollapsed(false);
                      }}
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Theme Settings</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTab === "settings" ? "secondary" : "ghost"}
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => {
                        setActiveTab("settings");
                        setRightPanelCollapsed(false);
                      }}
                    >
                      <Cog className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Form Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <div className="h-full  flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
                <TabsList className="w-full rounded bg-accent">
                  <TabsTrigger
                    value="fields"
                    className="flex-1 border-none data-[state=active]:border-primary"
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Field
                  </TabsTrigger>
                  <TabsTrigger
                    value="theme"
                    className="flex-1 border-none data-[state=active]:border-primary"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Theme
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex-1 border-none data-[state=active]:border-primary"
                  >
                    <Cog className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  <div className="h-full">
                    <div className="p-4">
                      <TabsContent value="fields" className="mt-0 border-none p-0">
                        {selectedFieldId ? (
                          <FieldProperties
                            field={fields.find(f => f.id === selectedFieldId)!}
                            onUpdate={updateField}
                          />
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p>Select a field to edit its properties</p>
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="theme" className="mt-0 border-none p-0">
                        <FormThemeSettings
                          theme={theme}
                          onChange={setTheme}
                        />
                      </TabsContent>
                      <TabsContent value="settings" className="mt-0 border-none p-0">
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
                  </div>
                </div>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add these SVG icon components
function Palette(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" />
      <circle cx="17.5" cy="10.5" r=".5" />
      <circle cx="8.5" cy="7.5" r=".5" />
      <circle cx="6.5" cy="12.5" r=".5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function Cog(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M12 2v2" />
      <path d="M12 22v-2" />
      <path d="m17 20.66-1-1.73" />
      <path d="M11 10.27 7 3.34" />
      <path d="m20.66 17-1.73-1" />
      <path d="m3.34 7 1.73 1" />
      <path d="M14 12h8" />
      <path d="M2 12h2" />
      <path d="m20.66 7-1.73 1" />
      <path d="m3.34 17 1.73-1" />
      <path d="m17 3.34-1 1.73" />
      <path d="m11 13.73-4 6.93" />
    </svg>
  );
}

// Modern and clean Draggable Field Component
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
    data: { field }
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group border rounded-md  bg-card transition-all duration-200",
        isSelected ? "ring-2 ring-primary shadow-sm" : "",
        isDragging ? "opacity-50" : "",
        "hover:shadow-md"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="flex items-center justify-between p-3 bg-muted/20 border-b cursor-move" {...attributes} {...listeners}>
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-medium text-sm flex items-center">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </span>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(field.id);
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate field</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(field.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete field</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>


      {/* Basic field preview */}
      <div className="text-sm px-4 py-2 text-muted-foreground">
        {field.type === 'text' && (
          <input
            type="text"
            disabled
            placeholder={field.placeholder || 'Text input'}
            className="w-full border rounded-md p-2 bg-muted/30 cursor-default focus:ring-0"
          />
        )}
        {field.type === 'textarea' && (
          <textarea
            disabled
            placeholder={field.placeholder || 'Text area'}
            className="w-full border rounded-md p-2 bg-muted/30 h-16 resize-none cursor-default focus:ring-0"
          />
        )}
        {field.type === 'select' && (
          <select
            disabled
            className="w-full border rounded-md p-2 bg-muted/30 cursor-default focus:ring-0"
          >
            <option>{field.placeholder || 'Select an option'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        )}
        {field.type === 'radio' && (
          <div className="space-y-1 p-2 bg-muted/20 rounded-md">
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
          <div className="space-y-1 p-2 bg-muted/20 rounded-md">
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
            className="w-full border rounded-md p-2 bg-muted/30 cursor-default focus:ring-0"
          />
        )}
        {field.type === 'phone' && (
          <input
            type="tel"
            disabled
            placeholder={field.placeholder || 'Phone number'}
            className="w-full border rounded-md p-2 bg-muted/30 cursor-default focus:ring-0"
          />
        )}
        {field.type === 'date' && (
          <input
            type="date"
            disabled
            className="w-full border rounded-md p-2 bg-muted/30 cursor-default focus:ring-0"
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
          <p className="text-muted-foreground">{field.label || 'Paragraph text'}</p>
        )}
        {(field.type as string) === 'divider' && (
          <hr className="my-2" />
        )}
        {(field.type as string) === 'spacer' && (
          <div className="h-6 w-full bg-muted/20 rounded border-dashed border flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Spacer</span>
          </div>
        )}
        {field.type === 'rating' && (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className="h-5 w-5 text-muted" />
            ))}
          </div>
        )}
        {field.type === 'signature' && (
          <div className="border rounded-md h-20 flex items-center justify-center bg-muted/30">
            <span className="text-sm text-muted-foreground">Signature pad</span>
          </div>
        )}
        {(field.type as string) === 'toggle' && (
          <div className="flex items-center">
            <div className="w-10 h-5 rounded-full bg-muted flex items-center p-0.5">
              <div className="w-4 h-4 rounded-full bg-background"></div>
            </div>
            <span className="ml-2">Toggle option</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}


// First, add this interface for our drop indicator
interface DropIndicatorProps {
  id: string;
  isHovering: boolean;
}

// Add this component for the drop indicators between fields
function DropIndicator({ id, isHovering }: DropIndicatorProps) {
  const { setNodeRef } = useDroppable({
    id
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-[0.2px] w-full rounded-md transition-all duration-200 ${isHovering ? 'bg-primary h-[0.1px]' : 'bg-transparent'
        }`}
      data-drop-indicator
    />
  );
}
