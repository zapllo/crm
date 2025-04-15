"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Pencil, Trash, ArrowRightLeft, Loader2 } from "lucide-react";
import MoveLeadDialog from "@/components/modals/leads/moveLeads";

interface Lead {
  assignedTo: any;
  _id: string;
  leadId: string;
  title: string;
  description?: string;
  product?: string;
  contact?: any;
  amount?: number;
  closeDate?: string;
  stage?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  company?: string;
}

interface LeadActionMenuProps {
  leadId: string;
  lead: Lead; // Add the full lead object
  currentStage: string;
  canEdit: boolean;
  canDelete: boolean;
  canMove: boolean;
  onDeleteSuccess?: () => void;
  onMoveSuccess?: () => void;
  onEditClick?: (lead: Lead) => void; // Add this callback
}


export default function LeadActionMenu({
  leadId,
  currentStage,
  canEdit,
  canDelete,
  canMove,
  lead,
  onDeleteSuccess,
  onEditClick,
  onMoveSuccess
}: LeadActionMenuProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update the handleEdit function
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    if (onEditClick) {
      onEditClick(lead);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/leads/${leadId}`);

      toast({
        title: "Lead deleted",
        description: "The lead has been successfully removed",
      });

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({
        title: "Delete failed",
        description: "There was a problem deleting the lead",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="absolute right-0">
            <MoreHorizontal className="h-4 w-4 " />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {canEdit && (
            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Lead
            </DropdownMenuItem>
          )}

        

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Lead
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Lead"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
