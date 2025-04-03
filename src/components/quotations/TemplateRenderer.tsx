"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

interface TemplateRendererProps {
  quotation: any;
  templateId?: string;
  className?: string;
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ 
  quotation, 
  templateId,
  className = "w-full h-full min-h-[800px] bg-white"
}) => {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRenderedTemplate = async () => {
      if (!quotation) return;
      
      try {
        setLoading(true);
        
        // Use the template ID from props or fallback to the one in the quotation
        const template = templateId || quotation.template;
        
        // Encode the quotation data for the API request
        const quotationData = encodeURIComponent(JSON.stringify(quotation));
        
        // Fetch the rendered HTML from the API
        const response = await axios.get(
          `/api/quotations/render?template=${template}&data=${quotationData}`,
          { responseType: 'text' }
        );
        
        setHtml(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to render template:', err);
        setError('Failed to render quotation template');
      } finally {
        setLoading(false);
      }
    };

    fetchRenderedTemplate();
  }, [quotation, templateId]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading template preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center p-6`}>
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <p className="text-muted-foreground">Using fallback preview instead.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default TemplateRenderer;