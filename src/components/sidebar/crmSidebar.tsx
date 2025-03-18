'use client'
import React from 'react';
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import { GearIcon, PieChartIcon, CardStackIcon } from '@radix-ui/react-icons';
import { Building2, Contact2, GitBranchPlus, GitGraphIcon, Grid2X2, PhoneCallIcon, ShoppingCart } from 'lucide-react';
import { FaFunnelDollar, FaShoppingCart } from 'react-icons/fa';

const CRMSidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className="w-[250px] border-r  text-white h-screen">
            <div className="space-y-4">
                <div className="flex justify-center">
                    <Button
                        variant="default"
                        className={`w-[90%] rounded-lg mt-6 gap-2 px-4 justify-start hover:bg-[#37384B] hover:rounded-lg bg-transparent mb-2 ${isActive('/CRM/dashboard') ? 'bg-[#815BF5] hover:bg-[#815BF5] rounded-lg text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/CRM/dashboard')}
                    >
                        <Grid2X2 className="h-5" /> Dashboard
                    </Button>
                </div>
                <div className="flex items-center justify-center">
                    <Button
                        variant="default"
                        className={`w-[90%] rounded-lg gap-2 ml-2 px-4 bg-transparent justify-start hover:rounded-lg hover:bg-[#37384B]  mb-2 ${isActive('/CRM/leads') ? 'bg-[#815BF5] hover:bg-[#815BF5] text-white rounded-lg' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/CRM/leads')}
                    >
                        <FaFunnelDollar className="scale-125" />
                        <h1 className='ml-1'>Leads</h1>
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Button
                        variant="default"
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#37384B] hover:rounded-lg mb-2 ${isActive('/CRM/contacts') ? 'bg-[#815BF5] text-white rounded-lg' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/CRM/contacts')}
                    >
                        <Contact2 className="h-5" /> Contacts
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Button
                        variant="default"
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#37384B] hover:rounded-lg mb-2 ${isActive('/CRM/companies') ? 'bg-[#815BF5] text-white rounded-lg' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/CRM/companies')}
                    >
                        <Building2 className="h-5" /> Companies
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Button
                        variant="default"
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#37384B] hover:rounded-lg mb-2 ${isActive('/CRM/follow-up') ? 'bg-[#815BF5] text-white rounded-lg' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/CRM/follow-up')}
                    >
                        <PhoneCallIcon className="h-5" /> Follow-up
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Button
                        variant="default"
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#37384B] hover:rounded-lg mb-2 ${isActive('/CRM/products') ? 'bg-[#815BF5] text-white rounded-lg' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/CRM/products')}
                    >
                        <ShoppingCart className="h-5" /> Products
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CRMSidebar;
