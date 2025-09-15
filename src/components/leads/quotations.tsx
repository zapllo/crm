"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

// Icons
import { 
    FileText, 
    Plus, 
    Eye, 
    Calendar, 
    DollarSign, 
    Clock, 
    CheckCircle, 
    XCircle,
    Loader2,
    AlertCircle,
    Send,
    Edit
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { FaMoneyBill } from 'react-icons/fa';

interface Quotation {
    _id: string;
    quotationNumber: string;
    title: string;
    status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
    total: number;
    currency: string;
    issueDate: string;
    validUntil: string;
    createdAt: string;
    updatedAt: string;
    creator: {
        firstName: string;
        lastName: string;
    };
    contact: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface QuotationsTabProps {
    leadId: string;
}

const QuotationsTab: React.FC<QuotationsTabProps> = ({ leadId }) => {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchQuotations();
    }, [leadId]);

    const fetchQuotations = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/leads/quotations?leadId=${leadId}`);
            setQuotations(response.data.quotations);
        } catch (error) {
            console.error('Error fetching quotations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        const configs = {
            draft: {
                variant: 'secondary' as const,
                color: 'text-gray-600',
                bgColor: 'bg-gray-100',
                icon: <Edit className="h-3 w-3" />
            },
            sent: {
                variant: 'default' as const,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100',
                icon: <Send className="h-3 w-3" />
            },
            approved: {
                variant: 'default' as const,
                color: 'text-green-600',
                bgColor: 'bg-green-100',
                icon: <CheckCircle className="h-3 w-3" />
            },
            rejected: {
                variant: 'destructive' as const,
                color: 'text-red-600',
                bgColor: 'bg-red-100',
                icon: <XCircle className="h-3 w-3" />
            },
            expired: {
                variant: 'secondary' as const,
                color: 'text-orange-600',
                bgColor: 'bg-orange-100',
                icon: <Clock className="h-3 w-3" />
            }
        };
        return configs[status as keyof typeof configs] || configs.draft;
    };

    const handleCreateQuotation = () => {
        router.push(`/quotations/create?leadId=${leadId}`);
    };

    const handleViewQuotation = (quotationId: string) => {
        router.push(`/quotations/${quotationId}`);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (quotations.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-blue-100 p-3 mb-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No quotations created</h3>
                    <p className="text-muted-foreground text-center mb-6 max-w-sm">
                        Create your first quotation for this lead to start the sales process.
                    </p>
                    <Button onClick={handleCreateQuotation} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Quotation
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Quotations</h3>
                    <p className="text-sm text-muted-foreground">
                        {quotations.length} quotation{quotations.length !== 1 ? 's' : ''} created for this lead
                    </p>
                </div>
                <Button onClick={handleCreateQuotation} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Quotation
                </Button>
            </div>

            {/* Quotations List */}
            <div className="space-y-4">
                {quotations.map((quotation) => {
                    const statusConfig = getStatusConfig(quotation.status);
                    const isExpired = new Date(quotation.validUntil) < new Date() && quotation.status === 'sent';

                    return (
                        <Card 
                            key={quotation._id} 
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleViewQuotation(quotation._id)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 space-y-3">
                                        {/* Header */}
                                        <div className="flex items-center gap-3">
                                            
                                            <div>
                                                <h4 className="font-semibold text-lg">{quotation.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {quotation.quotationNumber}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <FaMoneyBill className="h-3 w-3" />
                                                <span className="font-medium text-foreground">
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: quotation.currency,
                                                    }).format(quotation.total)}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    Issued: {format(new Date(quotation.issueDate), 'MMM dd, yyyy')}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    Valid until: {format(new Date(quotation.validUntil), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Creator Info */}
                                        <div className="text-xs text-muted-foreground">
                                            Created by {quotation.creator.firstName} {quotation.creator.lastName} • {format(new Date(quotation.createdAt), 'MMM dd, yyyy')}
                                        </div>
                                    </div>

                                    {/* Status and Actions */}
                                    <div className="flex flex-col items-end gap-3">
                                        <div className="flex items-center gap-2">
                                            {isExpired && (
                                                <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-700">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Expired
                                                </Badge>
                                            )}
                                            <Badge variant={statusConfig.variant} className="gap-1">
                                                {statusConfig.icon}
                                                {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                                            </Badge>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewQuotation(quotation._id);
                                            }}
                                        >
                                            <Eye className="h-3 w-3" />
                                            View Details
                                        </Button>
                                    </div>
                                </div>

                                {/* Progress indicator for different statuses */}
                                <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
                                    <div 
                                        className={`h-1 rounded-full transition-all duration-300 ${
                                            quotation.status === 'draft' ? 'bg-gray-400 w-1/4' :
                                            quotation.status === 'sent' ? 'bg-blue-500 w-1/2' :
                                            quotation.status === 'approved' ? 'bg-green-500 w-full' :
                                            quotation.status === 'rejected' ? 'bg-red-500 w-3/4' :
                                            'bg-orange-500 w-1/2'
                                        }`}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Summary Stats */}
            <Card className="bg-muted/30">
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {quotations.filter(q => q.status === 'draft').length}
                            </div>
                            <div className="text-xs text-muted-foreground">Draft</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">
                                {quotations.filter(q => q.status === 'sent').length}
                            </div>
                            <div className="text-xs text-muted-foreground">Sent</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {quotations.filter(q => q.status === 'approved').length}
                            </div>
                            <div className="text-xs text-muted-foreground">Approved</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: quotations[0]?.currency || 'USD',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                }).format(quotations.reduce((sum, q) => sum + q.total, 0))}
                            </div>
                            <div className="text-xs text-muted-foreground">Total Value</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default QuotationsTab;