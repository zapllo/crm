"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';


interface IFormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: string;
  logoPosition: 'left' | 'center' | 'right';
  customCSS?: string;
}

interface FormThemeSettingsProps {
  theme: IFormTheme;
  onChange: (theme: IFormTheme) => void;
}

export default function FormThemeSettings({ theme, onChange }: FormThemeSettingsProps) {
  const updateTheme = (key: keyof IFormTheme, value: any) => {
    onChange({ ...theme, [key]: value });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="fonts">Fonts & Layout</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4 pt-4">
          <div>
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex mt-1">
              <Input
                id="primary-color"
                type="color"
                value={theme.primaryColor}
                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                className="w-12 p-1 h-10"
              />
              <Input
                type="text"
                value={theme.primaryColor}
                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                className="flex-1 ml-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="accent-color">Accent Color</Label>
            <div className="flex mt-1">
              <Input
                id="accent-color"
                type="color"
                value={theme.accentColor}
                onChange={(e) => updateTheme('accentColor', e.target.value)}
                className="w-12 p-1 h-10"
              />
              <Input
                type="text"
                value={theme.accentColor}
                onChange={(e) => updateTheme('accentColor', e.target.value)}
                className="flex-1 ml-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="background-color">Background Color</Label>
            <div className="flex mt-1">
              <Input
                id="background-color"
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                className="w-12 p-1 h-10"
              />
              <Input
                type="text"
                value={theme.backgroundColor}
                onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                className="flex-1 ml-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex mt-1">
              <Input
                id="text-color"
                type="color"
                value={theme.textColor}
                onChange={(e) => updateTheme('textColor', e.target.value)}
                className="w-12 p-1 h-10"
              />
              <Input
                type="text"
                value={theme.textColor}
                onChange={(e) => updateTheme('textColor', e.target.value)}
                className="flex-1 ml-2"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fonts" className="space-y-4 pt-4">
          <div>
            <Label htmlFor="font-family">Font Family</Label>
            <Select
              value={theme.fontFamily}
              onValueChange={(value) => updateTheme('fontFamily', value)}
            >
              <SelectTrigger id="font-family">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                <SelectItem value="'Lato', sans-serif">Lato</SelectItem>
                <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                <SelectItem value="system-ui, sans-serif">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="border-radius">Border Radius</Label>
            <Select
              value={theme.borderRadius}
              onValueChange={(value) => updateTheme('borderRadius', value)}
            >
              <SelectTrigger id="border-radius">
                <SelectValue placeholder="Select border radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                <SelectItem value="0.125rem">Small (2px)</SelectItem>
                <SelectItem value="0.25rem">Medium (4px)</SelectItem>
                <SelectItem value="0.375rem">Default (6px)</SelectItem>
                <SelectItem value="0.5rem">Large (8px)</SelectItem>
                <SelectItem value="0.75rem">Extra Large (12px)</SelectItem>
                <SelectItem value="9999px">Fully Rounded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="button-style">Button Style</Label>
            <Select
              value={theme.buttonStyle}
              onValueChange={(value) => updateTheme('buttonStyle', value)}
            >
              <SelectTrigger id="button-style">
                <SelectValue placeholder="Select button style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="outlined">Outlined</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="logo-position">Logo Position</Label>
            <Select
              value={theme.logoPosition}
              onValueChange={(value) => updateTheme('logoPosition', value as 'left' | 'center' | 'right')}
            >
              <SelectTrigger id="logo-position">
                <SelectValue placeholder="Select logo position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 pt-4">
          <div>
            <Label htmlFor="custom-css">Custom CSS</Label>
            <Textarea
              id="custom-css"
              value={theme.customCSS || ''}
              onChange={(e) => updateTheme('customCSS', e.target.value)}
              placeholder="Enter custom CSS styles..."
              className="font-mono text-sm"
              rows={10}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use custom CSS to further customize the appearance of your form.
              Examples:
            </p>
            <pre className="text-xs bg-muted p-2 rounded-md mt-2 overflow-x-auto">
              {`.form-container { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }\n.form-field { margin-bottom: 1.5rem; }`}
            </pre>
          </div>
        </TabsContent>
      </Tabs>

      <div className="p-4 border rounded-md bg-muted/30">
        <h3 className="text-sm font-medium mb-2">Theme Preview</h3>
        <div
          className="p-4 rounded-md border"
          style={{
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            fontFamily: theme.fontFamily,
            borderRadius: theme.borderRadius
          }}
        >
          <div
            className="text-lg font-bold mb-4"
            style={{
              textAlign: theme.logoPosition as any
            }}
          >
            Form Title
          </div>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Sample Field</label>
              <input
                type="text"
                className="w-full border p-2 rounded-md"
                placeholder="Sample input field"
                style={{
                  borderRadius: theme.borderRadius,
                  borderColor: `${theme.primaryColor}40`
                }}
              />
            </div>
            <div>
              <label className="block mb-1">Dropdown Example</label>
              <select
                className="w-full border p-2 rounded-md"
                style={{
                  borderRadius: theme.borderRadius,
                  borderColor: `${theme.primaryColor}40`
                }}
              >
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Radio Example</label>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="sample-radio"
                  style={{
                    accentColor: theme.primaryColor
                  }}
                />
                <span className="ml-2">Option A</span>
              </div>
            </div>
            <button
              className="mt-4 px-4 py-2 rounded-md"
              style={{
                backgroundColor: theme.buttonStyle === 'filled' ? theme.primaryColor : 'transparent',
                color: theme.buttonStyle === 'filled' ? '#fff' : theme.primaryColor,
                borderRadius: theme.borderRadius,
                border: theme.buttonStyle === 'outlined' ? `1px solid ${theme.primaryColor}` : 'none',
                background: theme.buttonStyle === 'gradient'
                  ? `linear-gradient(to right, ${theme.primaryColor}, ${theme.accentColor})`
                  : undefined
              }}
            >
              Submit Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
