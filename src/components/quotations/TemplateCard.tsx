import React from 'react';
import Image from 'next/image';
import { Check, Edit, Trash2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-md", 
        isSelected && "ring-2 ring-primary"
      )}
    >
      <div className="relative  cursor-pointer" onClick={() => onSelect?.(id)}>
        {/* Template Preview Image */}
        <div className="h-full w-full bg-muted/20">
          {/* {previewImage ? (
            <Image 
              src={previewImage} 
              alt={name} 
              fill 
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No preview available
            </div>
          )} */}
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
      
      <CardContent className="p-4 mt-6">
        <h3 className="font-medium text-lg">{name}</h3>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{description}</p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 gap-2 flex">
       
        
        {/* <Button 
          variant="ghost" 
          size="sm"
          className="flex-1" 
          onClick={() => onDuplicate?.(id)}
        >
          <Copy className="h-4 w-4 mr-1" />
          Duplicate
        </Button> */}
        
        {!isDefault && (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1"
              onClick={() => onSetDefault?.(id)}
            >
              Set Default
            </Button>
            
           
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;