'use client'
import React from 'react';
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import { BellRingIcon, GitBranchPlus, GitGraphIcon, Grid2X2, Grid2x2X, Grid3x3, MessageSquare, MessageSquareDashed, MessageSquareQuote, MessageSquareText, Plug, Settings, Wallet } from 'lucide-react';

const SettingsSidebar: React.FC = () => {
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
                        className={`w-[90%] rounded-lg mt-6 gap-2 px-4 justify-start hover:bg-[#37384B] hover:rounded-lg bg-transparent mb-2 ${isActive('/settings/general') ? 'bg-[#815BF5] hover:bg-[#815BF5] rounded-lg text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/settings/general')}
                    >
                        <Settings className="h-5" /> General
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Button
                        variant="default"
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:rounded-lg hover:bg-[#37384B]  mb-2 ${isActive('/settings/customize') ? 'bg-[#815BF5] hover:bg-[#815BF5] text-white rounded-lg' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/settings/customize')}
                    >
                        <Grid3x3 className="h-5" /> Customize
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Button
                        variant="default"
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:rounded-lg hover:bg-[#37384B]  mb-2 ${isActive('/settings/integrations') ? 'bg-[#815BF5] hover:bg-[#815BF5] text-white rounded-lg' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/settings/integrations')}
                    >
                        <Plug className="h-5" /> Integrations
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Button
                        variant="default"
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#37384B] hover:rounded-lg mb-2 ${isActive('/settings/channels') ? 'bg-[#815BF5] text-white rounded-lg' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/settings/channels')}
                    >
                        <MessageSquareText className="h-5" /> Channels
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Button
                        variant="default"
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#37384B] hover:rounded-lg mb-2 ${isActive('/settings/notifications') ? 'bg-[#815BF5] text-white rounded-lg' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/settings/notifications')}
                    >
                        <BellRingIcon className="h-5" /> Notifications
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SettingsSidebar;
