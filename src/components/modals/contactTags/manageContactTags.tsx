"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddContactTagModal from "./addContactTags";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ContactTag {
  _id: string;
  name: string;
  color: string;
}

interface ManageContactTagsModalProps {
  contactId: string;
  currentTags: ContactTag[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function ManageContactTagsModal({
  contactId,
  currentTags,
  onClose,
  onUpdate,
}: ManageContactTagsModalProps) {
  const [allTags, setAllTags] = useState<ContactTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    currentTags.map((t) => t._id)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);

  useEffect(() => {
    fetchContactTags();
  }, []);

  // Fetch available contact tags from API
  async function fetchContactTags() {
    try {
      const res = await axios.get("/api/contact-tags");
      setAllTags(res.data);
    } catch (error) {
      console.error("Failed to fetch contact tags:", error);
    }
  }

  // Toggle tag in selected tags array
  function toggleTag(tagId: string) {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  }

  // Save selected tags to the contact
  async function saveTags() {
    try {
      await axios.patch(`/api/contacts/${contactId}`, {
        updates: { tags: selectedTags },
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to save tags:", error);
    }
  }

  // Filter tags based on search term
  const filteredTags = allTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full z-[100] p-6">
        <h2 className="text-lg font-semibold mb-4">Manage Contact Tags</h2>
        <div className="flex items-center p-2 rounded-lg mb-4">
          {/* Search Bar */}
          <Dialog open={showAddTagModal} onOpenChange={() => setShowAddTagModal(false)}>

            <Button
              variant="outline"
              className="rounded-full bg-[#017a5b] hover:bg-[#017a5b]/80 h-12 w-12"
              onClick={() => setShowAddTagModal(true)} // Open the add tag modal
            >
              <Plus className="scale-125 text-white" />
            </Button>
            <DialogContent className="max-w-md w-full z-[100] p-6">
              <AddContactTagModal
                onClose={() => setShowAddTagModal(false)} // Close the modal when done
                onUpdate={() => {
                  setShowAddTagModal(false); // Close the modal
                  fetchContactTags(); // Refresh the tags list
                }}
              />
            </DialogContent>
          </Dialog>

          <input
            type="text"
            placeholder="Search tags"
            className="ml-2 p-2 rounded border bg-transparent w-full focus:border-primary focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Available Tags */}
        <div className="grid grid-cols-4 gap-2">
          {filteredTags.map((tag) => {
            const isChecked = selectedTags.includes(tag._id);
            return (
              <div key={tag._id}>
                <label
                  style={{ borderColor: tag.color }}
                  className="flex items-center px-2 bg-transparent border rounded-full text-xs text-nowrap"
                >
                  <Checkbox
                  className="bg-white "
                    checked={isChecked}
                    onCheckedChange={() => toggleTag(tag._id)} // Using custom Checkbox
                  />
                  <span className="rounded-full px-2 py-1 dark:text-white">{tag.name}</span>
                </label>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-[#017a5b] hover:bg-[#017a5b]/80" onClick={saveTags}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
