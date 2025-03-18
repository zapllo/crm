"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash, Download } from "lucide-react";
import AddCompany from "@/components/modals/companies/AddCompany";
import EditCompany from "@/components/modals/companies/EditCompany";
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

interface Company {
    _id: string;
    companyName: string;
    taxNo: string;
    companyCode: string;
    country: string;
    shippingAddress: string;
    billingAddress: string;
    state: string;
    city: string;
    website: string;
    pincode: string;
}

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("companyName");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await axios.get<Company[]>("/api/companies");
            setCompanies(response.data);
        } catch (error) {
            console.error("Error fetching companies:", error);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await axios.delete(`/api/companies/${confirmDelete}`);
            fetchCompanies(); // Refresh list
        } catch (error) {
            console.error("Error deleting company:", error);
        }
        setConfirmDelete(null);
    };

    const handleExportCSV = () => {
        const csvData = [
            ["Company Name", "Tax No", "Company Code", "Country", "State", "City"],
            ...companies.map(({ companyName, taxNo, companyCode, country, state, city }) => [
                companyName,
                taxNo,
                companyCode,
                country,
                state,
                city,
            ]),
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvData.map((row) => row.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "companies.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const sortedFilteredCompanies = companies
        .filter(({ companyName, country }) =>
            [companyName, country].some((field) =>
                field.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        .sort((a, b) => (a[sortField as keyof Company] > b[sortField as keyof Company] ? 1 : -1));

    return (
        <div className="p-6">
            <div className="flex gap-4 mt-4 mb-4 justify-center w-full">
                <div className="flex justify-center gap-4">
                    <Input className="w-48" label="Search Companies" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Button onClick={() => setIsModalOpen(true)} className="text-white flex gap-2">
                        <Plus size={16} /> Add Company
                    </Button>
                    <Button onClick={handleExportCSV} className="hover:bg-[#017a5b] text-white flex gap-2">
                        <Download size={16} /> Export
                    </Button>
                    <Select onValueChange={setSortField}>
                        <SelectTrigger className="bg-primary">
                            <SelectValue placeholder="Sort By - Created Sequence" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="companyName">Company Name</SelectItem>
                            <SelectItem value="country">Country</SelectItem>
                            <SelectItem value="taxNo">Tax No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Tax No</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedFilteredCompanies.map((company) => (
                        <TableRow key={company._id}>
                            <TableCell>
                                {company.companyName}
                                <br />
                                <span className="text-gray-400">{company.country}, {company.state}</span>
                            </TableCell>
                            <TableCell>{company.taxNo}</TableCell>
                            <TableCell>{company.companyCode}</TableCell>
                            <TableCell className="flex items-center mt-2 gap-2">
                                {/* Edit Company */}
                                <Pencil
                                    className="text-blue-500 h-5 cursor-pointer"
                                    onClick={() => {
                                        setSelectedCompany(company);
                                        setIsEditModalOpen(true);
                                    }}
                                />

                                {/* Delete Company - Triggers Alert Dialog */}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Trash
                                            className="text-red-500 h-5 cursor-pointer"
                                            onClick={() => setConfirmDelete(company._id)}
                                        />
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <h3 className="text-lg font-bold">Delete Company</h3>
                                            <p>Are you sure you want to delete this company? This action cannot be undone.</p>
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

            {/* Add Company Dialog */}
            <AddCompany isOpen={isModalOpen} setIsOpen={setIsModalOpen} onCompanyCreated={fetchCompanies} />

            {/* Edit Company Dialog */}
            <EditCompany onCompanyUpdated={fetchCompanies} isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen} company={selectedCompany} />
        </div>
    );
}
