"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { IFormField } from '@/models/formBuilderModel';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface FormRendererProps {
  fields: IFormField[];
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  theme: any;
  readOnly?: boolean;
}

export default function FormRenderer({
  fields,
  values,
  onChange,
  theme,
  readOnly = false
}: FormRendererProps) {
  // Helper function to check if a field should be shown based on conditional logic
  const shouldShowField = (field: IFormField): boolean => {
    if (!field.conditional) return true;

    const { field: conditionFieldId, operator, value: conditionValue } = field.conditional;
    const fieldValue = values[conditionFieldId];

    if (fieldValue === undefined) return false;

    switch (operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'notEquals':
        return fieldValue !== conditionValue;
      case 'contains':
        return fieldValue.includes(conditionValue);
      case 'greaterThan':
        return fieldValue > conditionValue;
      case 'lessThan':
        return fieldValue < conditionValue;
      default:
        return true;
    }
  };

  const renderField = (field: IFormField) => {
    if (!shouldShowField(field)) return null;

    const commonStyles = {
      borderRadius: theme.borderRadius,
      borderColor: `${theme.primaryColor}40`
    };

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            type="text"
            placeholder={field.placeholder}
            value={values[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            disabled={readOnly}
            style={commonStyles}
            className="w-full"
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={values[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            disabled={readOnly}
            style={commonStyles}
            className="w-full"
            rows={field.properties?.rows || 3}
          />
        );

      case 'email':
        return (
          <Input
            id={field.id}
            type="email"
            placeholder={field.placeholder}
            value={values[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            disabled={readOnly}
            style={commonStyles}
            className="w-full"
          />
        );

      case 'phone':
        return (
          <Input
            id={field.id}
            type="tel"
            placeholder={field.placeholder}
            value={values[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            disabled={readOnly}
            style={commonStyles}
            className="w-full"
          />
        );

      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            value={values[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value ? Number(e.target.value) : '')}
            disabled={readOnly}
            min={field.properties?.min}
            max={field.properties?.max}
            step={field.properties?.step || 1}
            style={commonStyles}
            className="w-full"
          />
        );

      case 'select':
        return (
          <Select
            value={values[field.id] || ''}
            onValueChange={value => onChange(field.id, value)}
            disabled={readOnly}
          >
            <SelectTrigger style={commonStyles} className="w-full">
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiSelect':
        // For simplicity, we'll just use checkboxes for multi-select in this example
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option.value}`}
                  checked={(values[field.id] || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = values[field.id] || [];

                    if (checked) {
                      onChange(field.id, [...currentValues, option.value]);
                    } else {
                      onChange(field.id, currentValues.filter((v: string) => v !== option.value));
                    }
                  }}
                  disabled={readOnly}
                  style={{ accentColor: theme.primaryColor }}
                />
                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option.value}`}
                  checked={(values[field.id] || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = values[field.id] || [];

                    if (checked) {
                      onChange(field.id, [...currentValues, option.value]);
                    } else {
                      onChange(field.id, currentValues.filter((v: string) => v !== option.value));
                    }
                  }}
                  disabled={readOnly}
                  style={{ accentColor: theme.primaryColor }}
                />
                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}

            {field.properties?.allowOther && (
              <div className="flex items-center space-x-2 mt-2">
               <Checkbox
                  id={`${field.id}-other`}
                  checked={(values[field.id] || []).includes('__other__')}
                  onCheckedChange={(checked) => {
                    const currentValues = values[field.id] || [];

                    if (checked) {
                      onChange(field.id, [...currentValues, '__other__']);
                    } else {
                      onChange(field.id, currentValues.filter((v: string) => v !== '__other__'));
                    }
                  }}
                  disabled={readOnly}
                  style={{ accentColor: theme.primaryColor }}
                />
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`${field.id}-other`}>Other:</Label>
                  {(values[field.id] || []).includes('__other__') && (
                    <Input
                      value={values[`${field.id}-other-value`] || ''}
                      onChange={(e) => onChange(`${field.id}-other-value`, e.target.value)}
                      disabled={readOnly}
                      className="w-full ml-2"
                      style={commonStyles}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={values[field.id] || ''}
            onValueChange={value => onChange(field.id, value)}
            disabled={readOnly}
            className="space-y-2"
          >
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  id={`${field.id}-${option.value}`}
                  value={option.value}
                  style={{ accentColor: theme.primaryColor }}
                />
                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}

            {field.properties?.allowOther && (
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem
                  id={`${field.id}-other`}
                  value="__other__"
                  style={{ accentColor: theme.primaryColor }}
                />
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`${field.id}-other`}>Other:</Label>
                  {values[field.id] === '__other__' && (
                    <Input
                      value={values[`${field.id}-other-value`] || ''}
                      onChange={(e) => onChange(`${field.id}-other-value`, e.target.value)}
                      disabled={readOnly}
                      className="w-full ml-2"
                      style={commonStyles}
                    />
                  )}
                </div>
              </div>
            )}
          </RadioGroup>
        );

      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={values[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            disabled={readOnly}
            min={field.properties?.minDate}
            max={field.properties?.maxDate}
            style={commonStyles}
            className="w-full"
          />
        );

      case 'time':
        return (
          <Input
            id={field.id}
            type="time"
            value={values[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            disabled={readOnly}
            style={commonStyles}
            className="w-full"
          />
        );

      case 'file':
        return (
          <div
            className="border border-dashed p-4 text-center rounded-md cursor-pointer hover:bg-muted/30 transition-colors"
            style={{
              borderRadius: theme.borderRadius,
              borderColor: `${theme.primaryColor}40`
            }}
          >
            <p className="text-sm mb-2">
              {values[field.id] ?
                `Selected: ${values[field.id].name || 'File'}` :
                'Drop files here or click to upload'
              }
            </p>
            <input
              id={field.id}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                onChange(field.id, file || null);
              }}
              disabled={readOnly}
              className="hidden"
              multiple={field.properties?.maxFiles > 1}
              accept={field.properties?.allowedTypes?.join(',')}
            />
            {!readOnly && (
              <button
                type="button"
                className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-md"
                onClick={() => document.getElementById(field.id)?.click()}
                style={{ color: theme.primaryColor }}
              >
                Browse Files
              </button>
            )}
          </div>
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            {Array.from({ length: field.properties?.maxRating || 5 }).map((_, index) => {
              const value = index + 1;
              const isSelected = (values[field.id] || 0) >= value;

              const getIcon = () => {
                const iconType = field.properties?.icon || 'star';

                if (iconType === 'star') {
                  return isSelected ? '★' : '☆';
                } else if (iconType === 'heart') {
                  return isSelected ? '❤️' : '♡';
                } else {
                  return isSelected ? '👍' : '👍🏻';
                }
              };

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onChange(field.id, value)}
                  disabled={readOnly}
                  className={`text-2xl ${isSelected ? 'text-primary' : 'text-muted'}`}
                  style={{ color: isSelected ? theme.primaryColor : undefined }}
                >
                  {getIcon()}
                </button>
              );
            })}
          </div>
        );

      case 'signature':
        return (
          <div
            className="border rounded-md p-2 text-center"
            style={{
              borderRadius: theme.borderRadius,
              borderColor: `${theme.primaryColor}40`,
              height: `${field.properties?.height || 150}px`,
              width: '100%'
            }}
          >
            {!values[field.id] ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {readOnly ? 'No signature' : 'Click here to sign'}
              </div>
            ) : (
              <img
                src={values[field.id]}
                alt="Signature"
                className="h-full mx-auto object-contain"
              />
            )}
          </div>
        );

      case 'address':
        return (
          <div className="space-y-3">
            <div>
              <Input
                id={`${field.id}-street1`}
                placeholder="Street Address"
                value={values[`${field.id}-street1`] || ''}
                onChange={(e) => onChange(`${field.id}-street1`, e.target.value)}
                disabled={readOnly}
                style={commonStyles}
                className="w-full"
              />
            </div>

            {field.properties?.includeStreet2 && (
              <div>
                <Input
                  id={`${field.id}-street2`}
                  placeholder="Apartment, suite, etc."
                  value={values[`${field.id}-street2`] || ''}
                  onChange={(e) => onChange(`${field.id}-street2`, e.target.value)}
                  disabled={readOnly}
                  style={commonStyles}
                  className="w-full"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {field.properties?.includeCity !== false && (
                <div>
                  <Input
                    id={`${field.id}-city`}
                    placeholder="City"
                    value={values[`${field.id}-city`] || ''}
                    onChange={(e) => onChange(`${field.id}-city`, e.target.value)}
                    disabled={readOnly}
                    style={commonStyles}
                    className="w-full"
                  />
                </div>
              )}

              {field.properties?.includeState !== false && (
                <div>
                  <Input
                    id={`${field.id}-state`}
                    placeholder="State / Province"
                    value={values[`${field.id}-state`] || ''}
                    onChange={(e) => onChange(`${field.id}-state`, e.target.value)}
                    disabled={readOnly}
                    style={commonStyles}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {field.properties?.includeZip !== false && (
                <div>
                  <Input
                    id={`${field.id}-zip`}
                    placeholder="ZIP / Postal Code"
                    value={values[`${field.id}-zip`] || ''}
                    onChange={(e) => onChange(`${field.id}-zip`, e.target.value)}
                    disabled={readOnly}
                    style={commonStyles}
                    className="w-full"
                  />
                </div>
              )}

              {field.properties?.includeCountry !== false && (
                <div>
                  <Input
                    id={`${field.id}-country`}
                    placeholder="Country"
                    value={values[`${field.id}-country`] || ''}
                    onChange={(e) => onChange(`${field.id}-country`, e.target.value)}
                    disabled={readOnly}
                    style={commonStyles}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'heading':
        const HeadingTag = field.properties?.headingLevel || 'h2';
        return (
          <div style={{ textAlign: field.properties?.align || 'left' }}>
            {React.createElement(
              HeadingTag,
              {
                className: 'font-bold',
                style: {
                  fontSize: HeadingTag === 'h1' ? '1.5rem' :
                           HeadingTag === 'h2' ? '1.25rem' :
                           HeadingTag === 'h3' ? '1.125rem' : '1rem'
                }
              },
              field.label
            )}
          </div>
        );

      case 'paragraph':
        return (
          <p
            style={{
              textAlign: field.properties?.align || 'left',
              marginBottom: '1rem'
            }}
          >
            {field.label}
          </p>
        );

      case 'divider':
        return (
          <hr
            style={{
              borderStyle: field.properties?.style || 'solid',
              borderColor: field.properties?.color || '#e2e8f0',
              borderWidth: `${field.properties?.thickness || 1}px 0 0 0`,
              margin: '1rem 0'
            }}
          />
        );

      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };

  return (
    <div className="space-y-6">
      {fields.map(field => (
        <div key={field.id} className="space-y-2">
          {!['heading', 'paragraph', 'divider', 'hidden'].includes(field.type) && (
            <div className="flex justify-between items-center">
              <Label
                htmlFor={field.id}
                className="text-sm font-medium block"
              >
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
          )}
          {renderField(field)}
        </div>
      ))}
    </div>
  );
}
