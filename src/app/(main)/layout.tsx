"use client";

import InfoBar from "@/components/infobar";
import PremiumTrialBanner from "@/components/premiumTrialBanner";
import TrialExpiredBanner from "@/components/TrialExpiredBanner";
import DynamicAnnouncement from "@/components/DynamicAnnoucement";
import MenuOptions from "@/components/sidebar";
import { useUserContext } from "@/contexts/userContext";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = { children: React.ReactNode };

const Layout = (props: Props) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useUserContext();

    // Check if trial is expired
    const isTrialExpired = () => {
        if (!user?.organization?.trialExpires) return false;
        const trialExpiry = new Date(user.organization.trialExpires);
        const now = new Date();
        return now >= trialExpiry;
    };

    // Check if user is on premium plan
    const isPremium = () => {
        return user?.organization?.isPro === true;
    };

    // Check if current page is billing page
    const isBillingPage = (): boolean => {
        return pathname.includes('/settings/billing');
    };

    // If trial is expired and not premium and not on billing page, only show trial expired message
    if (isTrialExpired() && !isPremium() && !isBillingPage()) {
        return <TrialExpiredBanner />;
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="sticky top-0 z-[100]">
                {/* Show trial banner if:
                   - User is not premium AND
                   - (Trial hasn't expired OR we're on the billing page)
                */}
                {!isPremium() && (!isTrialExpired() || isBillingPage()) && <PremiumTrialBanner />}

                {/* Optionally show a special expired notice on the billing page */}
                {isTrialExpired() && !isPremium() && isBillingPage() && (
                    <div className="bg-red-600 text-white py-2 px-4 text-center text-sm font-medium">
                        Your trial has expired. Choose a plan below to continue enjoying premium features.
                    </div>
                )}
            </div>
            <div className="flex flex-grow overflow-hidden">
                <MenuOptions />
                <div className="w-full overflow-hidden h-screen">
                    <InfoBar />
                    <div className="ml-16">{props.children}</div>
                </div>
            </div>

            {/* Floating announcements component */}
            <DynamicAnnouncement />
        </div>
    );
};

export default Layout;
