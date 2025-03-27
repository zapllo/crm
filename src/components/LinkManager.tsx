'use client';
import { useState } from 'react';
import { Link as LinkIcon, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Link {
  url: string;
  title: string;
}

interface LinkManagerProps {
  links: Link[];
  onChange: (links: Link[]) => void;
}

const LinkManager = ({ links, onChange }: LinkManagerProps) => {
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  
  const addLink = () => {
    if (!newUrl) return;
    
    // Basic URL validation
    let url = newUrl;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    
    const title = newTitle || url;
    const updatedLinks = [...links, { url, title }];
    onChange(updatedLinks);
    
    // Reset form
    setNewUrl('');
    setNewTitle('');
  };
  
  const removeLink = (index: number) => {
    const updatedLinks = [...links];
    updatedLinks.splice(index, 1);
    onChange(updatedLinks);
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Related Links</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Existing links */}
        {links.length > 0 && (
          <ul className="space-y-2 mb-4">
            {links.map((link, index) => (
              <li key={index} className="flex items-center p-2 bg-secondary/20 rounded-md">
                <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-sm hover:underline"
                >
                  {link.title}
                </a>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeLink(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        
        {/* Add new link form */}
        <div className="space-y-2">
          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="text"
              placeholder="https://example.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              type="text"
              placeholder="Link description"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          
          <Button
            onClick={addLink}
            disabled={!newUrl}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkManager;