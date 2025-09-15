import React from 'react';
import Image from 'next/image';
import { Check, Edit, Trash2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Theme color mapping to visually represent each template style
const themeColorMap: Record<string, { bg: string, text: string, accent: string }> = {
  // Default mapping for unknown themes
  default: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200', accent: 'bg-gray-300 dark:bg-gray-700' },

  // Template-specific mappings
  "Corporate Blue": { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-800 dark:text-blue-200', accent: 'bg-blue-200 dark:bg-blue-800' },
  "Executive Gray": { bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-800 dark:text-gray-200', accent: 'bg-gray-300 dark:bg-gray-700' },
  
  "Bold Green": { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-800 dark:text-emerald-200', accent: 'bg-emerald-200 dark:bg-emerald-800' },
  "Violet Edge": { bg: 'bg-violet-50 dark:bg-violet-950', text: 'text-violet-800 dark:text-violet-300', accent: 'bg-violet-200 dark:bg-violet-800' },
  "Amber Elegance": { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-800 dark:text-amber-300', accent: 'bg-amber-200 dark:bg-amber-800' },
  "Slate Professional": { bg: 'bg-slate-100 dark:bg-slate-900', text: 'text-slate-800 dark:text-slate-200', accent: 'bg-slate-300 dark:bg-slate-700' },
  "Rose Gradient": { bg: 'bg-rose-50 dark:bg-rose-950', text: 'text-rose-800 dark:text-rose-300', accent: 'bg-rose-200 dark:bg-rose-800' },
  "Cyan Modern": { bg: 'bg-cyan-50 dark:bg-cyan-950', text: 'text-cyan-800 dark:text-cyan-300', accent: 'bg-cyan-200 dark:bg-cyan-800' },
  "Indigo Blocks": { bg: 'bg-indigo-50 dark:bg-indigo-950', text: 'text-indigo-800 dark:text-indigo-300', accent: 'bg-indigo-200 dark:bg-indigo-800' },
  "Modern Minimalist": { bg: 'bg-neutral-800 text-white dark:bg-neutral-900', text: 'text-neutral-200 dark:text-neutral-200', accent: 'bg-neutral-800 dark:bg-neutral-700' },
  "Orange Accent": { bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-800 dark:text-orange-300', accent: 'bg-orange-200 dark:bg-orange-800' },
  "Teal Waves": { bg: 'bg-teal-50 dark:bg-teal-950', text: 'text-teal-800 dark:text-teal-300', accent: 'bg-teal-200 dark:bg-teal-800' },
};

interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
  // previewImage: string;
  isDefault: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  id,
  name,
  description,
  // previewImage,
  isDefault,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onSetDefault,
}) => {
  // Get theme colors based on template name or use default
  const themeColors = themeColorMap[name] || themeColorMap.default;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all rounded duration-200 hover:shadow-md border",
        isSelected ? "border-2 ring-primary border-primary" : "border-transparent",
        themeColors.bg
      )}
    >
      <div className="relative rounded cursor-pointer" onClick={() => onSelect?.(id)}>
        {/* Themed Preview Area with Pattern/Design */}
        <div className={cn("h-32 w-full flex items-center justify-center", themeColors.accent)}>
          <div className={cn("font-bold text-xl", themeColors.text)}>
            {name.split(' ')[0]}
          </div>
        </div>

        {/* Default Badge */}
        {isDefault && (
          <Badge className="absolute top-2 left-2 bg-primary">
            Default
          </Badge>
        )}

        {/* Selected Check */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>

      <CardContent className={cn("p-4 mt-2", themeColors.text)}>
        <h3 className="font-medium text-lg">{name}</h3>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{description}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2 flex">
        {!isDefault && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => onSetDefault?.(id)}
          >
            Set Default
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;
