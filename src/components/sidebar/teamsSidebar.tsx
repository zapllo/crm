'use client'
import React from 'react';
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import { GearIcon, PieChartIcon, CardStackIcon } from '@radix-ui/react-icons';
import { Building2, Contact2, GitBranchPlus, GitGraphIcon, Grid2X2, PhoneCallIcon, Shield, ShoppingCart, User2, Users2 } from 'lucide-react';
import { FaFunnelDollar, FaShoppingCart } from 'react-icons/fa';

const TeamsSidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className="w-[250px] border-r bg-[#04061E] text-white h-screen">
            <div className="space-y-4">
                <div className="flex justify-center">
                    <Button
                        variant="default"
                        className={`w-[90%] rounded-lg mt-6 gap-2 px-4 justify-start hover:bg-[#37384B] hover:rounded-lg bg-transparent mb-2 ${isActive('/teams/sales-team') ? 'bg-[#815BF5] hover:bg-[#815BF5] rounded-lg text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/teams/sales-team')}
                    >
                        <User2 className="h-5" /> Sales Team
                    </Button>
                </div>
                <div className="flex items-center justify-center">
                    <Button
                        variant="default"
                        className={`w-[90%] rounded-lg gap-2 ml-2 px-4 bg-transparent justify-start hover:rounded-lg hover:bg-[#37384B]  mb-2 ${isActive('teams/user-roles') ? 'bg-[#815BF5] hover:bg-[#815BF5] text-white rounded-lg' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/teams/user-roles')}
                    >
                        <Shield className="scale-125" />
                        <h1 className='ml-1'>User Roles</h1>
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Button
                        variant="default"
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#37384B] hover:rounded-lg mb-2 ${isActive('/teams/members') ? 'bg-[#815BF5] text-white rounded-lg' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/teams/members')}
                    >
                        <Users2 className="h-5" /> All Members
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default TeamsSidebar;
