"use client";

import React, { useEffect, useState } from 'react';
import { IFormField } from '@/models/formBuilderModel';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface FieldPropertiesProps {
  field: IFormField;
  onUpdate: (field: IFormField) => void;
}

// Draggable option component
function DraggableOption({
  option,
  index,
  onLabelChange,
  onValueChange,
  onRemove
}: {
  option: { label: string; value: string };
  index: number;
  onLabelChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `option-${index}`,
    data: {
      index,
      option
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center space-x-2 border rounded-md p-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move text-muted-foreground"
      >
        <GripVertical size={16} />
      </div>
      <div className="flex-1 grid grid-cols-2 gap-2">
        <Input
          placeholder="Label"
          value={option.label}
          onChange={(e) => onLabelChange(e.target.value)}
          className="text-sm"
        />
        <Input
          placeholder="Value"
          value={option.value}
          onChange={(e) => onValueChange(e.target.value)}
          className="text-sm"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8 text-destructive"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}

export default function FieldProperties({ field, onUpdate }: FieldPropertiesProps) {
  const [localField, setLocalField] = useState<IFormField>(field);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const [activeTab, setActiveTab] = useState<string>("basic");

  // Update local field whenever the input field changes
  useEffect(() => {
    setLocalField(field);
  }, [field.id]); // Only re-initialize when field ID changes


  const updateLocalField = (updates: Partial<IFormField>) => {
    const updated = { ...localField, ...updates };
    setLocalField(updated);
    onUpdate(updated);
  };

  const updateOption = (index: number, key: 'label' | 'value', newValue: string) => {
    if (!localField.options) return;

    const newOptions = [...localField.options];
    newOptions[index] = { ...newOptions[index], [key]: newValue };
    updateLocalField({ options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(localField.options || [])];
    const newIndex = newOptions.length + 1;
    newOptions.push({ label: `Option ${newIndex}`, value: `option_${newIndex}` });
    updateLocalField({ options: newOptions });
  };

  const removeOption = (index: number) => {
    if (!localField.options) return;

    const newOptions = [...localField.options];
    newOptions.splice(index, 1);
    updateLocalField({ options: newOptions });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !localField.options) return;

    const activeIndex = Number(active.id.toString().split('-')[1]);
    const overIndex = Number(over.id.toString().split('-')[1]);

    if (activeIndex === overIndex) return;

    const newOptions = [...localField.options];
    const [moved] = newOptions.splice(activeIndex, 1);
    newOptions.splice(overIndex, 0, moved);

    updateLocalField({ options: newOptions });
  };

  const renderBasicSettings = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="field-label">Label</Label>
        <Input
          id="field-label"
          value={localField.label}
          onChange={(e) => updateLocalField({ label: e.target.value })}
        />
      </div>

      {['text', 'textarea', 'email', 'phone', 'number', 'select'].includes(localField.type) && (
        <div>
          <Label htmlFor="field-placeholder">Placeholder</Label>
          <Input
            id="field-placeholder"
            value={localField.placeholder || ''}
            onChange={(e) => updateLocalField({ placeholder: e.target.value })}
          />
        </div>
      )}

      {['text', 'textarea', 'email', 'phone', 'number', 'select', 'checkbox', 'radio', 'date', 'file', 'address'].includes(localField.type) && (
        <div className="flex items-center justify-between">
          <Label htmlFor="field-required">Required</Label>
          <Switch
            id="field-required"
            checked={localField.required}
            onCheckedChange={(checked) => updateLocalField({ required: checked })}
          />
        </div>
      )}

      {localField.type === 'textarea' && (
        <div>
          <Label htmlFor="field-rows">Rows</Label>
          <Slider
            id="field-rows"
            min={2}
            max={10}
            step={1}
            value={[(localField.properties?.rows as number) || 3]}
            onValueChange={(value) => updateLocalField({
              properties: { ...localField.properties, rows: value[0] }
            })}
          />
          <div className="text-xs text-right mt-1 text-muted-foreground">
            {(localField.properties?.rows as number) || 3} rows
          </div>
        </div>
      )}

      {localField.type === 'number' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="field-min">Min Value</Label>
              <Input
                id="field-min"
                type="number"
                value={localField.properties?.min || ''}
                onChange={(e) => updateLocalField({
                  properties: {
                    ...localField.properties,
                    min: e.target.value ? Number(e.target.value) : null
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="field-max">Max Value</Label>
              <Input
                id="field-max"
                type="number"
                value={localField.properties?.max || ''}
                onChange={(e) => updateLocalField({
                  properties: {
                    ...localField.properties,
                    max: e.target.value ? Number(e.target.value) : null
                  }
                })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="field-step">Step</Label>
            <Input
              id="field-step"
              type="number"
              min="0.01"
              step="0.01"
              value={localField.properties?.step || 1}
              onChange={(e) => updateLocalField({
                properties: {
                  ...localField.properties,
                  step: Number(e.target.value) || 1
                }
              })}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderOptionsSettings = () => {
    if (!['select', 'checkbox', 'radio', 'multiSelect'].includes(localField.type)) return null;

    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-sm font-medium">Options</h3>

        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-2">
            {localField.options?.map((option, index) => (
              <DraggableOption
                key={`option-${index}`}
                option={option}
                index={index}
                onLabelChange={(value) => updateOption(index, 'label', value)}
                onValueChange={(value) => updateOption(index, 'value', value)}
                onRemove={() => removeOption(index)}
              />
            ))}
          </div>
        </DndContext>

        <Button
          variant="outline"
          size="sm"
          onClick={addOption}
          className="w-full"
        >
          <Plus size={16} className="mr-2" />
          Add Option
        </Button>

        {['select', 'multiSelect'].includes(localField.type) && (
          <div className="mt-4 space-y-4">
            {localField.type === 'multiSelect' && (
              <div>
                <Label htmlFor="max-selections">Max Selections</Label>
                <Input
                  id="max-selections"
                  type="number"
                  min="1"
                  value={localField.properties?.maxSelections || ''}
                  onChange={(e) => updateLocalField({
                    properties: {
                      ...localField.properties,
                      maxSelections: e.target.value ? Number(e.target.value) : null
                    }
                  })}
                  placeholder="Unlimited"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="allow-search">Enable Search</Label>
              <Switch
                id="allow-search"
                checked={localField.properties?.allowSearch || false}
                onCheckedChange={(checked) => updateLocalField({
                  properties: {
                    ...localField.properties,
                    allowSearch: checked
                  }
                })}
              />
            </div>
          </div>
        )}

        {['checkbox', 'radio'].includes(localField.type) && (
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-other">Allow "Other" option</Label>
            <Switch
              id="allow-other"
              checked={localField.properties?.allowOther || false}
              onCheckedChange={(checked) => updateLocalField({
                properties: {
                  ...localField.properties,
                  allowOther: checked
                }
              })}
            />
          </div>
        )}
      </div>
    );
  };

  const renderAdvancedSettings = () => {
    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-sm font-medium">Advanced Settings</h3>

        {/* File upload settings */}
        {localField.type === 'file' && (
          <>
            <div>
              <Label htmlFor="max-size">Max File Size (MB)</Label>
              <Input
                id="max-size"
                type="number"
                min="1"
                max="100"
                value={localField.properties?.maxSize || 5}
                onChange={(e) => updateLocalField({
                  properties: {
                    ...localField.properties,
                    maxSize: Number(e.target.value) || 5
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="max-files">Max Number of Files</Label>
              <Input
                id="max-files"
                type="number"
                min="1"
                max="10"
                value={localField.properties?.maxFiles || 1}
                onChange={(e) => updateLocalField({
                  properties: {
                    ...localField.properties,
                    maxFiles: Number(e.target.value) || 1
                  }
                })}
              />
            </div>
            <div>
              <Label>Allowed File Types</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow-images"
                    checked={(localField.properties?.allowedTypes || []).includes('image/*')}
                    onCheckedChange={(checked) => {
                      const currentTypes = localField.properties?.allowedTypes || [];
                      let newTypes = [...currentTypes];

                      if (checked) {
                        if (!newTypes.includes('image/*')) newTypes.push('image/*');
                      } else {
                        newTypes = newTypes.filter(t => t !== 'image/*');
                      }

                      updateLocalField({
                        properties: {
                          ...localField.properties,
                          allowedTypes: newTypes
                        }
                      });
                    }}
                  />
                  <Label htmlFor="allow-images" className="cursor-pointer">Images</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow-pdf"
                    checked={(localField.properties?.allowedTypes || []).includes('application/pdf')}
                    onCheckedChange={(checked) => {
                      const currentTypes = localField.properties?.allowedTypes || [];
                      let newTypes = [...currentTypes];

                      if (checked) {
                        if (!newTypes.includes('application/pdf')) newTypes.push('application/pdf');
                      } else {
                        newTypes = newTypes.filter(t => t !== 'application/pdf');
                      }

                      updateLocalField({
                        properties: {
                          ...localField.properties,
                          allowedTypes: newTypes
                        }
                      });
                    }}
                  />
                  <Label htmlFor="allow-pdf" className="cursor-pointer">PDF Documents</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow-docs"
                    checked={(localField.properties?.allowedTypes || []).includes('application/msword')}
                    onCheckedChange={(checked) => {
                      const currentTypes = localField.properties?.allowedTypes || [];
                      let newTypes = [...currentTypes];

                      if (checked) {
                        const docTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                        docTypes.forEach(type => {
                          if (!newTypes.includes(type)) newTypes.push(type);
                        });
                      } else {
                        newTypes = newTypes.filter(t => !t.includes('msword') && !t.includes('wordprocessingml'));
                      }

                      updateLocalField({
                        properties: {
                          ...localField.properties,
                          allowedTypes: newTypes
                        }
                      });
                    }}
                  />
                  <Label htmlFor="allow-docs" className="cursor-pointer">Word Documents</Label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Date field settings */}
        {localField.type === 'date' && (
          <>
            <div>
              <Label htmlFor="date-format">Date Format</Label>
              <Select
                value={localField.properties?.format || 'MM/DD/YYYY'}
                onValueChange={(value) => updateLocalField({
                  properties: { ...localField.properties, format: value }
                })}
              >
                <SelectTrigger id="date-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-date">Minimum Date</Label>
                <Input
                  id="min-date"
                  type="date"
                  value={localField.properties?.minDate || ''}
                  onChange={(e) => updateLocalField({
                    properties: {
                      ...localField.properties,
                      minDate: e.target.value || null
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="max-date">Maximum Date</Label>
                <Input
                  id="max-date"
                  type="date"
                  value={localField.properties?.maxDate || ''}
                  onChange={(e) => updateLocalField({
                    properties: {
                      ...localField.properties,
                      maxDate: e.target.value || null
                    }
                  })}
                />
              </div>
            </div>
          </>
        )}

        {/* Address field settings */}
        {localField.type === 'address' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-street2">Include Street Line 2</Label>
              <Switch
                id="include-street2"
                checked={localField.properties?.includeStreet2 || false}
                onCheckedChange={(checked) => updateLocalField({
                  properties: { ...localField.properties, includeStreet2: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-city">Include City</Label>
              <Switch
                id="include-city"
                checked={localField.properties?.includeCity !== false}
                onCheckedChange={(checked) => updateLocalField({
                  properties: { ...localField.properties, includeCity: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-state">Include State/Province</Label>
              <Switch
                id="include-state"
                checked={localField.properties?.includeState !== false}
                onCheckedChange={(checked) => updateLocalField({
                  properties: { ...localField.properties, includeState: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-zip">Include ZIP/Postal Code</Label>
              <Switch
                id="include-zip"
                checked={localField.properties?.includeZip !== false}
                onCheckedChange={(checked) => updateLocalField({
                  properties: { ...localField.properties, includeZip: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-country">Include Country</Label>
              <Switch
                id="include-country"
                checked={localField.properties?.includeCountry !== false}
                onCheckedChange={(checked) => updateLocalField({
                  properties: { ...localField.properties, includeCountry: checked }
                })}
              />
            </div>
          </div>
        )}

        {/* Rating field settings */}
        {localField.type === 'rating' && (
          <>
            <div>
              <Label htmlFor="max-rating">Maximum Rating</Label>
              <Select
                value={String(localField.properties?.maxRating || 5)}
                onValueChange={(value) => updateLocalField({
                  properties: { ...localField.properties, maxRating: Number(value) }
                })}
              >
                <SelectTrigger id="max-rating">
                  <SelectValue placeholder="Select maximum rating" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 7, 10].map(num => (
                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rating-icon">Icon</Label>
              <Select
                value={localField.properties?.icon || 'star'}
                onValueChange={(value) => updateLocalField({
                  properties: { ...localField.properties, icon: value }
                })}
              >
                <SelectTrigger id="rating-icon">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="star">Star</SelectItem>
                  <SelectItem value="heart">Heart</SelectItem>
                  <SelectItem value="thumb">Thumb</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allow-half-rating">Allow Half Ratings</Label>
              <Switch
                id="allow-half-rating"
                checked={localField.properties?.allowHalfRating || false}
                onCheckedChange={(checked) => updateLocalField({
                  properties: { ...localField.properties, allowHalfRating: checked }
                })}
              />
            </div>
          </>
        )}

        {/* Signature field settings */}
        {localField.type === 'signature' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sig-width">Width (px)</Label>
                <Input
                  id="sig-width"
                  type="number"
                  min="200"
                  max="800"
                  value={localField.properties?.width || 300}
                  onChange={(e) => updateLocalField({
                    properties: {
                      ...localField.properties,
                      width: Number(e.target.value) || 300
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="sig-height">Height (px)</Label>
                <Input
                  id="sig-height"
                  type="number"
                  min="100"
                  max="400"
                  value={localField.properties?.height || 150}
                  onChange={(e) => updateLocalField({
                    properties: {
                      ...localField.properties,
                      height: Number(e.target.value) || 150
                    }
                  })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pen-color">Pen Color</Label>
              <div className="flex mt-1">
                <Input
                  id="pen-color"
                  type="color"
                  value={localField.properties?.penColor || '#000000'}
                  onChange={(e) => updateLocalField({
                    properties: {
                      ...localField.properties,
                      penColor: e.target.value
                    }
                  })}
                  className="w-12 p-1 h-10"
                />
                <Input
                  type="text"
                  value={localField.properties?.penColor || '#000000'}
                  onChange={(e) => updateLocalField({
                    properties: {
                      ...localField.properties,
                      penColor: e.target.value
                    }
                  })}
                  className="flex-1 ml-2"
                />
              </div>
            </div>
          </>
        )}

        {/* Heading field settings */}
        {localField.type === 'heading' && (
          <>
            <div>
              <Label htmlFor="heading-level">Heading Level</Label>
              <Select
                value={localField.properties?.headingLevel || 'h2'}
                onValueChange={(value) => updateLocalField({
                  properties: { ...localField.properties, headingLevel: value }
                })}
              >
                <SelectTrigger id="heading-level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">Heading 1 (Largest)</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                  <SelectItem value="h4">Heading 4 (Smallest)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="heading-align">Alignment</Label>
              <Select
                value={localField.properties?.align || 'left'}
                onValueChange={(value) => updateLocalField({
                  properties: { ...localField.properties, align: value }
                })}
              >
                <SelectTrigger id="heading-align">
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Paragraph field settings */}
        {localField.type === 'paragraph' && (
          <>
            <div>
              <Label htmlFor="paragraph-content">Content</Label>
              <Textarea
                id="paragraph-content"
                value={localField.label}
                onChange={(e) => updateLocalField({ label: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="paragraph-align">Alignment</Label>
              <Select
                value={localField.properties?.align || 'left'}
                onValueChange={(value) => updateLocalField({
                  properties: { ...localField.properties, align: value }
                })}
              >
                <SelectTrigger id="paragraph-align">
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Divider field settings */}
        {localField.type === 'divider' && (
          <>
            <div>
              <Label htmlFor="divider-style">Style</Label>
              <Select
                value={localField.properties?.style || 'solid'}
                onValueChange={(value) => updateLocalField({
                  properties: { ...localField.properties, style: value }
                })}
              >
                <SelectTrigger id="divider-style">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="divider-color">Color</Label>
              <div className="flex mt-1">
                <Input
                  id="divider-color"
                  type="color"
                  value={localField.properties?.color || '#e2e8f0'}
                  onChange={(e) => updateLocalField({
                    properties: {
                      ...localField.properties,
                      color: e.target.value
                    }
                  })}
                  className="w-12 p-1 h-10"
                />
                <Input
                  type="text"
                  value={localField.properties?.color || '#e2e8f0'}
                  onChange={(e) => updateLocalField({
                    properties: {
                      ...localField.properties,
                      color: e.target.value
                    }
                  })}
                  className="flex-1 ml-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="divider-thickness">Thickness (px)</Label>
              <Input
                id="divider-thickness"
                type="number"
                min="1"
                max="10"
                value={localField.properties?.thickness || 1}
                onChange={(e) => updateLocalField({
                  properties: {
                    ...localField.properties,
                    thickness: Number(e.target.value) || 1
                  }
                })}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  const renderConditionalLogic = () => (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Conditional Logic</h3>
        <Switch
          id="enable-conditional"
          checked={!!localField.conditional}
          onCheckedChange={(checked) => {
            if (checked) {
              updateLocalField({
                conditional: { field: '', operator: 'equals', value: '' }
              });
            } else {
              updateLocalField({ conditional: undefined });
            }
          }}
        />
      </div>

      {localField.conditional && (
        <div className="space-y-4 border-l-2 pl-4 border-primary/20 mt-2">
          <p className="text-sm text-muted-foreground">
            Show this field when:
          </p>

          <div>
            <Label htmlFor="condition-field">Field</Label>
            <Select
              value={localField.conditional?.field || ''}
              onValueChange={(value) => updateLocalField({
                conditional: { ...(localField.conditional || { operator: 'equals', value: '' }), field: value }
              })}
            >
              <SelectTrigger id="condition-field">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {field.id !== localField.id && field.type !== 'heading' && field.type !== 'paragraph' && field.type !== 'divider' && (
                  <SelectItem value={field.id}>{field.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="condition-operator">Operator</Label>
            <Select
              value={localField.conditional?.operator || 'equals'}
              onValueChange={(value) => updateLocalField({
                conditional: {
                  ...(localField.conditional || { field: '', value: '' }),
                  operator: value as 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
                }
              })}
            >
              <SelectTrigger id="condition-operator">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="notEquals">Does not equal</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="greaterThan">Greater than</SelectItem>
                <SelectItem value="lessThan">Less than</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="condition-value">Value</Label>
            <Input
              id="condition-value"
              value={localField.conditional?.value || ''}
              onChange={(e) => updateLocalField({
                conditional: { ...(localField.conditional || { field: '', operator: 'equals' }), value: e.target.value }
              })}
              placeholder="Enter value to compare against"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-4">
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
      <TabsList className="w-fit grid grid-cols-3 bg-accent gap-4 mb-4">
        <TabsTrigger className='border-none' value="basic">Basic</TabsTrigger>
        {(['select', 'checkbox', 'radio', 'multiSelect'].includes(localField.type)) && (
          <TabsTrigger value="options">Options</TabsTrigger>
        )}
        <TabsTrigger className='border-none' value="advanced">Advanced</TabsTrigger>
        {/* {!['heading', 'paragraph', 'divider'].includes(localField.type) && (
          <TabsTrigger className='border-none' value="conditional">Logic</TabsTrigger>
        )} */}
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        {renderBasicSettings()}
      </TabsContent>

      {(['select', 'checkbox', 'radio', 'multiSelect'].includes(localField.type)) && (
        <TabsContent value="options" className="space-y-4">
          {renderOptionsSettings()}
        </TabsContent>
      )}

      <TabsContent value="advanced" className="space-y-4">
        {renderAdvancedSettings()}
      </TabsContent>

      {!['heading', 'paragraph', 'divider'].includes(localField.type) && (
        <TabsContent value="conditional" className="space-y-4">
          {renderConditionalLogic()}
        </TabsContent>
      )}
    </Tabs>
  </div>
  );
}
