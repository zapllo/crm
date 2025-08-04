import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingsCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingsCount = 1,
}: PaginationProps) {
  // Generate page numbers to display
  const generatePagination = () => {
    // Always show first page button
    const firstPageIndex = 0;
    // Always show last page button
    const lastPageIndex = totalPages - 1;
    
    const leftSiblingIndex = Math.max(currentPage - siblingsCount, 0);
    const rightSiblingIndex = Math.min(currentPage + siblingsCount, totalPages - 1);
    
    // Determine whether to show dots
    const shouldShowLeftDots = leftSiblingIndex > 1;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;
    
    // Initial array with first page
    const pages = [firstPageIndex];
    
    // Add left dots if necessary
    if (shouldShowLeftDots) {
      pages.push(-1); // Use -1 to represent dots
    }
    
    // Add page numbers between dots
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== firstPageIndex && i !== lastPageIndex) {
        pages.push(i);
      }
    }
    
    // Add right dots if necessary
    if (shouldShowRightDots) {
      pages.push(-2); // Use -2 to represent dots (different key from left dots)
    }
    
    // Add last page
    if (lastPageIndex > 0) {
      pages.push(lastPageIndex);
    }
    
    return pages;
  };
  
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className="mx-auto flex w-full justify-center"
    >
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {generatePagination().map((pageIndex, i) => {
          // Render dots
          if (pageIndex < 0) {
            return (
              <Button
                key={`dots-${i}`}
                variant="ghost"
                size="icon"
                disabled
                className="cursor-default"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            );
          }
          
          // Render page number
          return (
            <Button
              key={`page-${pageIndex}`}
              variant={pageIndex === currentPage ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(pageIndex)}
              aria-label={`Go to page ${pageIndex + 1}`}
              aria-current={pageIndex === currentPage ? "page" : undefined}
            >
              {pageIndex + 1}
            </Button>
          );
        })}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}