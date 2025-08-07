'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  MoreHorizontal,
  Download,
  Link,
  Loader2
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Types
interface QuotationItem {
  _id: string;
  quotationNumber: string;
  title: string;
  lead: {
    _id: string;
    title: string;
    leadId: string;
  };
  contact: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  total: number;
  currency: string;
  issueDate: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  creator: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  lastViewed?: string;
}

interface PaginationInfo {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

export default function AllQuotationsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 0,
    currentPage: 0,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null);

  // Load quotations on component mount and when filters change
  useEffect(() => {
    fetchQuotations();
  }, [pagination.currentPage, statusFilter]);

  const fetchQuotations = async () => {
    try {
      setIsLoading(true);

      let url = `/api/quotations?page=${pagination.currentPage}&limit=${pagination.limit}`;

      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const { data } = await axios.get(url);

      setQuotations(data.quotations);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quotations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, currentPage: page });
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPagination({ ...pagination, currentPage: 0 }); // Reset to first page when filter changes
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For simplicity, we're just handling client-side filtering here
    // In a real app, you might want to send the search term to the API
    fetchQuotations();
  };

  const handleViewQuotation = (id: string) => {
    router.push(`/quotations/${id}`);
  };

  const handleEditQuotation = (id: string) => {
    router.push(`/quotations/${id}/edit`);
  };

  const handleCopyLink = async (id: string) => {
    try {
      const { data } = await axios.get(`/api/quotations/${id}`);
      const shareableLink = `${window.location.origin}/share/quotation/${data.publicAccessToken}`;

      await navigator.clipboard.writeText(shareableLink);
      toast({
        title: 'Success',
        description: 'Share link copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy share link',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      // This would typically generate and download a PDF version of the quotation
      toast({
        title: 'Generating PDF',
        description: 'Your quotation PDF is being generated...',
      });

      const response = await axios.get(`/api/quotations/${id}/pdf`, {
        responseType: 'blob',
      });

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotation-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: 'Success',
        description: 'Quotation PDF downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download PDF',
        variant: 'destructive',
      });
    }
  };

  const handleSendQuotation = async (id: string) => {
    try {
      // This would send the quotation by email or update its status to 'sent'
      await axios.post(`/api/quotations/${id}/send`);

      // Refresh the list to show updated status
      fetchQuotations();

      toast({
        title: 'Success',
        description: 'Quotation sent successfully',
      });
    } catch (error) {
      console.error('Error sending quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to send quotation',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) {
      return;
    }

    try {
      await axios.delete(`/api/quotations/${id}`);

      // Remove the deleted quotation from the list
      setQuotations(quotations.filter(quote => quote._id !== id));

      toast({
        title: 'Success',
        description: 'Quotation deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete quotation',
        variant: 'destructive',
      });
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'sent':
        return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">Sent</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-500 hover:bg-red-600 text-white">Changes Requested</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter quotations by search term
  const filteredQuotations = quotations.filter(quote =>
    quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${quote.contact.firstName} ${quote.contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className=" mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Quotations</h1>
        <Button onClick={() => router.push('/quotations/create')} className="bg-blue-600 hover:bg-blue-700">
          <FileText className="mr-2 h-4 w-4" /> Create New Quotation
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
              <div className="text-sm text-blue-600 dark:text-blue-400">Total</div>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-100 dark:border-green-800">
              <div className="text-sm text-green-600 dark:text-green-400">Approved</div>
              <div className="text-2xl font-bold">
                {quotations.filter(q => q.status === 'approved').length}
              </div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-100 dark:border-amber-800">
              <div className="text-sm text-amber-600 dark:text-amber-400">Pending</div>
              <div className="text-2xl font-bold">
                {quotations.filter(q => q.status === 'sent').length}
              </div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800">
              <div className="text-sm text-red-600 dark:text-red-400">Rejected</div>
              <div className="text-2xl font-bold">
                {quotations.filter(q => q.status === 'rejected').length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-card rounded-md border shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search quotations..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    {statusFilter ? `Status: ${statusFilter}` : "All Statuses"}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => fetchQuotations()}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Quotations Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter
                ? "Try adjusting your search or filters."
                : "Get started by creating your first quotation."}
            </p>
            <Button onClick={() => router.push('/quotations/create')}>
              Create New Quotation
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quote) => (
                  <TableRow key={quote._id}>
                    <TableCell className="font-medium">
                      <div>{quote.quotationNumber}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {quote.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          {quote.contact.firstName} {quote.contact.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {quote.lead.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(quote.total, quote.currency)}
                    </TableCell>
                    <TableCell>
                      {formatDate(quote.createdAt)}
                    </TableCell>
                    <TableCell>
                      {formatDate(quote.validUntil)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(quote.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewQuotation(quote._id)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditQuotation(quote._id)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleCopyLink(quote._id)}>
                            <Link className="mr-2 h-4 w-4" /> Copy Share Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPDF(quote._id)}>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>
                          {quote.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleSendQuotation(quote._id)}>
                              <Send className="mr-2 h-4 w-4" /> Send Quotation
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteQuotation(quote._id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
