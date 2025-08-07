'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    Loader2,
    Upload,
    FileCheck,
    Settings,
    ArrowLeft,
    Search,
} from 'lucide-react';

// Components
import TemplateCard from '@/components/quotations/TemplateCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { IconTemplate } from '@tabler/icons-react';

// Types
interface Template {
    _id: string;
    name: string;
    description: string;
    previewImage: string;
    isDefault: boolean;
    createdAt: string;
    layout?: any;
    styles?: any;
    pageSettings?: any;
}

export default function TemplatesPage() {
    const router = useRouter();
    const { toast } = useToast();

    // State
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    // New template form state
    const [isNewTemplateDialogOpen, setIsNewTemplateDialogOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        description: '',
        isDefault: false,
    });

    // Load templates on component mount
    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get('/api/quotations/templates');
            setTemplates(data);

            // If we have templates and none is selected, select the default one
            if (data.length > 0 && !selectedTemplate) {
                const defaultTemplate = data.find((t: Template) => t.isDefault);
                setSelectedTemplate(defaultTemplate?._id || data[0]._id);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast({
                title: 'Error',
                description: 'Failed to load templates',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTemplate = async () => {
        try {
            if (!newTemplate.name.trim()) {
                toast({
                    title: 'Error',
                    description: 'Template name is required',
                    variant: 'destructive',
                });
                return;
            }

            setIsLoading(true);
            const { data } = await axios.post('/api/quotations/templates', newTemplate);

            setTemplates([...templates, data]);
            setSelectedTemplate(data._id);
            setIsNewTemplateDialogOpen(false);
            setNewTemplate({ name: '', description: '', isDefault: false });

            toast({
                title: 'Success',
                description: 'Template created successfully',
            });

            // Navigate to the template editor
            router.push(`/quotations/templates/${data._id}/edit`);
        } catch (error) {
            console.error('Error creating template:', error);
            toast({
                title: 'Error',
                description: 'Failed to create template',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditTemplate = (id: string) => {
        router.push(`/quotations/templates/${id}/edit`);
    };

    const handleDuplicateTemplate = async (id: string) => {
        try {
            const template = templates.find(t => t._id === id);
            if (!template) return;

            setIsLoading(true);
const templateCopy = {
                ...(template as any), // Copy all available properties from original template
                _id: undefined, // Ensure we don't copy the ID
                isDefault: false, // Override default status
                name: `${template.name} (Copy)`, // Override name
            };
            const { data } = await axios.post('/api/quotations/templates', templateCopy);

            setTemplates([...templates, data]);

            toast({
                title: 'Success',
                description: 'Template duplicated successfully',
            });
        } catch (error) {
            console.error('Error duplicating template:', error);
            toast({
                title: 'Error',
                description: 'Failed to duplicate template',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    const handleSetDefaultTemplate = async (id: string) => {
        try {
            setIsLoading(true);
            
            // First get the current template data
            const templateToUpdate = templates.find(t => t._id === id);
            if (!templateToUpdate) {
                throw new Error("Template not found");
            }
            
            // Send the complete template with isDefault set to true
            await axios.put(`/api/quotations/templates/${id}`, {
                name: templateToUpdate.name,
                description: templateToUpdate.description,
                isDefault: true,
                previewImage: templateToUpdate.previewImage
            });
    
            // Update local template list - mark this as default and others as not default
            setTemplates(templates.map(template => ({
                ...template,
                isDefault: template._id === id
            })));
    
            // Also update the selected template to match the new default
            setSelectedTemplate(id);
    
            toast({
                title: 'Success',
                description: 'Default template updated',
            });
        } catch (error) {
            console.error('Error setting default template:', error);
            toast({
                title: 'Error',
                description: 'Failed to update default template',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        // Only allow deleting non-default templates
        const template = templates.find(t => t._id === id);
        if (!template || template.isDefault) {
            toast({
                title: 'Error',
                description: 'Cannot delete the default template',
                variant: 'destructive',
            });
            return;
        }

        if (!confirm('Are you sure you want to delete this template?')) {
            return;
        }

        try {
            setIsLoading(true);
            await axios.delete(`/api/quotations/templates/${id}`);

            // Remove from local template list
            setTemplates(templates.filter(t => t._id !== id));

            // If the deleted template was selected, select the default one
            if (selectedTemplate === id) {
                const defaultTemplate = templates.find(t => t.isDefault);
                setSelectedTemplate(defaultTemplate?._id || templates[0]?._id);
            }

            toast({
                title: 'Success',
                description: 'Template deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting template:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete template',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Filter templates based on active tab and search term
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === 'all') {
            return matchesSearch;
        } else if (activeTab === 'default') {
            return template.isDefault && matchesSearch;
        }

        return matchesSearch;
    });

    return (
        <div className=" mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Quotation Templates</h1>
                {/* <Button onClick={() => setIsNewTemplateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Create Template
                </Button> */}
            </div>

            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle>Templates Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                        Create and manage professional quotation templates for your business. Customize layouts, styles, and content to match your brand identity.
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
                            <div className="text-sm text-blue-600 dark:text-blue-400">Total Templates</div>
                            <div className="text-2xl font-bold">{templates.length}</div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-100 dark:border-green-800">
                            <div className="text-sm text-green-600 dark:text-green-400">Default Template</div>
                            <div className="text-lg font-medium truncate">
                                {templates.find(t => t.isDefault)?.name || "None"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                        <TabsList className='bg-accent gap-4'>
                            <TabsTrigger className='border-none'  value="all">All Templates</TabsTrigger>
                            <TabsTrigger  className='border-none' value="default">Default</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search templates..."
                            className="pl-8 max-w-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/10">
                    <IconTemplate className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                        {searchTerm
                            ? "Try adjusting your search term."
                            : "You haven't created any templates yet. Get started by creating your first template."}
                    </p>
                    <Button onClick={() => setIsNewTemplateDialogOpen(true)}>
                        Create New Template
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <TemplateCard
                            key={template._id}
                            id={template._id}
                            name={template.name}
                            description={template.description}
                            // previewImage={template.previewImage}
                            isDefault={template.isDefault}
                            isSelected={selectedTemplate === template._id}
                            onSelect={setSelectedTemplate}
                            onEdit={handleEditTemplate}
                            onDelete={handleDeleteTemplate}
                            onDuplicate={handleDuplicateTemplate}
                            onSetDefault={handleSetDefaultTemplate}
                        />
                    ))}
                </div>
            )}

            {/* Create Template Dialog */}
            {/* <Dialog open={isNewTemplateDialogOpen} onOpenChange={setIsNewTemplateDialogOpen}>
                <DialogContent className="sm:max-w-md z-[100]">
                    <DialogHeader>
                        <DialogTitle>Create New Template</DialogTitle>
                        <DialogDescription>
                            Create a custom quotation template that matches your brand identity.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Template Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Professional Blue"
                                value={newTemplate.name}
                                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your template..."
                                value={newTemplate.description}
                                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="default"
                                checked={newTemplate.isDefault}
                                onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, isDefault: checked })}
                            />
                            <Label htmlFor="default">Set as default template</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewTemplateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateTemplate} className="bg-blue-600 hover:bg-blue-700">
                            Create Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
        </div>
    );
}