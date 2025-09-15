"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Palette, Type } from 'lucide-react';

// Add this at the top of the component:
const colorPresets = [
  { primary: '#3B82F6', accent: '#EFF6FF', background: '#FFFFFF', text: '#1F2937' },
  { primary: '#10B981', accent: '#ECFDF5', background: '#FFFFFF', text: '#1F2937' },
  { primary: '#6366F1', accent: '#EEF2FF', background: '#FFFFFF', text: '#1F2937' },
  { primary: '#EC4899', accent: '#FCE7F3', background: '#FFFFFF', text: '#1F2937' },
  { primary: '#F59E0B', accent: '#FEF3C7', background: '#FFFFFF', text: '#1F2937' },
  { primary: '#000000', accent: '#F3F4F6', background: '#FFFFFF', text: '#1F2937' },
  { primary: '#4F46E5', accent: '#E0E7FF', background: '#030712', text: '#F9FAFB' },
  { primary: '#8B5CF6', accent: '#EDE9FE', background: '#F8FAFC', text: '#1E293B' },
];


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
      <TabsList className="w-full mb-4 gap-4   bg-accent">
        <TabsTrigger  value="colors" className="flex-1 border-none">
          <Palette className="h-4 w-4 mr-2" />
          Colors
        </TabsTrigger>
        <TabsTrigger  value="fonts" className="flex-1 border-none">
          <Text className="h-4 w-4 mr-2" />
          Typography
        </TabsTrigger>
        {/* <TabsTrigger  value="advanced" className="flex-1 border-none">
          <Code2 className="h-4 w-4 mr-2" />
          Advanced
        </TabsTrigger> */}
      </TabsList>

      <TabsContent value="colors" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex mt-1">
              <div
                className="w-10 h-9 rounded-l-md flex items-center justify-center border border-r-0"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Paintbrush className="h-4 w-4 text-white drop-shadow-sm" />
              </div>
              <Input
                id="primary-color"
                type="text"
                value={theme.primaryColor}
                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                className="rounded-l-none flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="accent-color">Accent Color</Label>
            <div className="flex mt-1">
              <div
                className="w-10 h-9 rounded-l-md flex items-center justify-center border border-r-0"
                style={{ backgroundColor: theme.accentColor }}
              >
                <Paintbrush className="h-4 w-4 text-black/70 drop-shadow-sm" />
              </div>
              <Input
                id="accent-color"
                type="text"
                value={theme.accentColor}
                onChange={(e) => updateTheme('accentColor', e.target.value)}
                className="rounded-l-none flex-1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="background-color">Background Color</Label>
            <div className="flex mt-1">
              <div
                className="w-10 h-9 rounded-l-md flex items-center justify-center border border-r-0"
                style={{ backgroundColor: theme.backgroundColor }}
              >
                <Component className="h-4 w-4 text-black/70" />
              </div>
              <Input
                id="background-color"
                type="text"
                value={theme.backgroundColor}
                onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                className="rounded-l-none flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex mt-1">
              <div
                className="w-10 h-9 rounded-l-md flex items-center justify-center border border-r-0"
                style={{ backgroundColor: theme.textColor }}
              >
                <Type className="h-4 w-4 text-white drop-shadow-sm" />
              </div>
              <Input
                id="text-color"
                type="text"
                value={theme.textColor}
                onChange={(e) => updateTheme('textColor', e.target.value)}
                className="rounded-l-none flex-1"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <h3 className="text-sm font-medium">Color Presets</h3>
          <div className="grid grid-cols-4 gap-2">
            {colorPresets.map((preset, i) => (
              <Button
                key={i}
                variant="outline"
                className="p-0 h-10 w-full relative overflow-hidden"
                onClick={() => {
                  updateTheme('primaryColor', preset.primary);
                  updateTheme('accentColor', preset.accent);
                  updateTheme('backgroundColor', preset.background);
                  updateTheme('textColor', preset.text);
                }}
              >
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 h-full" style={{ backgroundColor: preset.primary }}></div>
                  <div className="w-1/2 h-full" style={{ backgroundColor: preset.accent }}></div>
                </div>
              </Button>
            ))}
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

      {/* <div className="p-4 border rounded-md bg-muted/30">
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
      </div> */}
    </div>
  );
}


// Add these imports:
function Paintbrush(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
      <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
      <path d="M14.5 17.5 4.5 15" />
    </svg>
  );
}

function Component(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z" />
      <path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z" />
      <path d="m18.5 8.5 3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5Z" />
      <path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z" />
    </svg>
  );
}

function Code2(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </svg>
  );
}

function Text(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M17 6.1H3" />
      <path d="M21 12.1H3" />
      <path d="M15.1 18H3" />
    </svg>
  );
}
