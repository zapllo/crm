"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Filter,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog as Alert, AlertDialogDescription as AlertDescription } from "@/components/ui/alert-dialog";

interface Transaction {
  id: string;
  date: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  reference: string;
  metadata?: Record<string, any>;
}

interface PaginationData {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

export default function WalletHistory() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0
  });

  const fetchTransactions = async (page = 1, type = filterType, query = searchQuery) => {
    try {
      setIsLoading(true);
      let url = `/api/wallet/transactions?page=${page}&limit=10&type=${type}`;
      if (query) {
        url += `&search=${encodeURIComponent(query)}`;
      }

      const response = await axios.get(url);
      setTransactions(response.data.transactions);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transaction history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1, filterType, searchQuery);
  }, [filterType]);

  const handleTypeChange = (value: string) => {
    setFilterType(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions(1, filterType, searchQuery);
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      fetchTransactions(pagination.page - 1, filterType, searchQuery);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      fetchTransactions(pagination.page + 1, filterType, searchQuery);
    }
  };

  const exportTransactions = async () => {
    try {
      // In a real implementation, you would call an API endpoint that returns CSV data
      // For demonstration purposes, we'll just show a success message
      toast({
        title: "Export Started",
        description: "Your transaction export will be emailed to you shortly.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export transactions. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format date from string or Date object
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy • HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View all your wallet transactions
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <form onSubmit={handleSearch}>
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="pl-8 w-full sm:w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <Select value={filterType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full ">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="credit">Credits</SelectItem>
                <SelectItem value="debit">Debits</SelectItem>
              </SelectContent>
            </Select>

            {/* <Button variant="outline" size="icon" onClick={exportTransactions}>
              <Download className="h-4 w-4" />
            </Button> */}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : transactions.length === 0 ? (
          <Alert >
            <div className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            <AlertDescription>
              No transactions found. Try adjusting your filters or add credits to get started.
            </AlertDescription>
            </div>
          </Alert>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {transaction.type === 'credit' ? (
                          <div className="mr-2 h-8 w-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                            <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="mr-2 h-8 w-8 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                            <ArrowDownLeft className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.type === 'credit' ? 'Top-up' : 'Call charge'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {transaction.reference || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <Badge variant={transaction.type === 'credit' ? 'outline' : 'secondary'}>
                          {transaction.type === 'credit' ? '+' : '-'}₹{(transaction.amount / 100).toFixed(2)}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.totalCount)} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} transactions
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
