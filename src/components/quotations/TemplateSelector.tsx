import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface TemplateSelectorProps {
  value: string;
  onChange: (templateId: string) => void;
}

interface Template {
  _id: string;
  name: string;
  description: string;
  isDefault: boolean;
  previewImage: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ value, onChange }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/quotations/templates');
        setTemplates(response.data);
        
        // If no template is selected and we have a default, select it
        if (!value && response.data.length > 0) {
          const defaultTemplate = response.data.find((t: Template) => t.isDefault);
          if (defaultTemplate) {
            onChange(defaultTemplate._id);
          } else {
            onChange(response.data[0]._id);
          }
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast({
          title: 'Error',
          description: 'Failed to load templates',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden h-[240px] opacity-40">
            <div className="h-36 bg-gray-200 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
      {templates.map((template) => (
        <Card 
          key={template._id} 
          className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
            value === template._id ? 'ring-2 ring-primary' : 'ring-1 ring-muted'
          }`}
          onClick={() => onChange(template._id)}
        >
          <div className="relative h-36 bg-gray-100">
            {template.previewImage ? (
              <img 
                src={template.previewImage} 
                alt={template.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/50 text-muted-foreground">
                No Preview
              </div>
            )}
            
            {value === template._id && (
              <div className="absolute top-2 right-2">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
            
            {template.isDefault && (
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Default
                </span>
              </div>
            )}
          </div>
          
          <CardContent className="p-4">
            <h3 className="font-medium mb-1">{template.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TemplateSelector;