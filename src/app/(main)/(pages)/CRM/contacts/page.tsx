"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash, Download } from "lucide-react";
import AddContact from "@/components/modals/contacts/addContact";
import EditContact from "@/components/modals/contacts/editContact";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Contact {
  _id: string;
  company: any;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsappNumber: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("firstName");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get<Contact[]>("/api/contacts");
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await axios.delete("/api/contacts", { data: { id: confirmDelete } });
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
    setConfirmDelete(null);
  };

  const handleExportCSV = () => {
    const csvData = [
      ["First Name", "Last Name", "Email", "Mobile", "Company"],
      ...contacts.map(({ firstName, lastName, email, whatsappNumber, company }) => [
        firstName,
        lastName,
        email,
        whatsappNumber,
        company?.companyName || "",
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvData.map((row) => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contacts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedFilteredContacts = contacts
    .filter(({ firstName, lastName, email }) =>
      [firstName, lastName, email].some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => (a[sortField as keyof Contact] > b[sortField as keyof Contact] ? 1 : -1));

  return (
    <div className="p-6">
      {/* <h2 className="text-xl font-bold mb-4">Contacts</h2> */}

      <div className="flex gap-4 mt-4 mb-4 justify-center w-full">
        <div className="flex justify-center gap-4">
          <Input className="w-48" label="Search Contacts" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Button onClick={() => setIsModalOpen(true)} className=" text-white flex gap-2">
            <Plus size={16} /> Add Contact
          </Button>
          <Button onClick={handleExportCSV} className="hover:bg-[#017a5b] text-white flex gap-2">
            <Download size={16} /> Export
          </Button>
          <div className="">
          <Select  onValueChange={setSortField}>
            <SelectTrigger className="bg-primary">
              <SelectValue  placeholder="Sort By - Created Sequence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="firstName">First Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsappNumber">Mobile</SelectItem>
            </SelectContent>
          </Select>
          </div>
         
         
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFilteredContacts.map((contact) => (
            <TableRow key={contact._id}>
              <TableCell>
                {contact.firstName} {contact.lastName}
                <br />
                <span className="text-gray-400">{contact.email}</span>
              </TableCell>
              <TableCell>{contact.whatsappNumber}</TableCell>
              <TableCell>{contact.company?.companyName}</TableCell>
              <TableCell className="flex items-center mt-2 gap-2">
                {/* Edit Contact */}
                <Pencil
                  className="text-blue-500 h-5 cursor-pointer"
                  onClick={() => {
                    setSelectedContact(contact);
                    setIsEditModalOpen(true);
                  }}
                />

                {/* Delete Contact - Triggers Alert Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Trash
                      className="text-red-500 h-5 cursor-pointer"
                      onClick={() => setConfirmDelete(contact._id)}
                    />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <h3 className="text-lg font-bold">Delete Contact</h3>
                      <p>Are you sure you want to delete this contact? This action cannot be undone.</p>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmDelete(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Contact Dialog */}
      <AddContact isOpen={isModalOpen} setIsOpen={setIsModalOpen} />

      {/* Edit Contact Dialog */}
      <EditContact isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen} contact={selectedContact} />
    </div>
  );
}
