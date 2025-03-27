"use client";

import InfoBar from "@/components/infobar";
import PremiumTrialBanner from "@/components/premiumTrialBanner";
import MenuOptions from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { formatDistanceToNow, intervalToDuration } from "date-fns";
import { X, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = { children: React.ReactNode };

const Layout = (props: Props) => {
    const router = useRouter();
    const pathname = usePathname();


    return (
        <div className="flex flex-col overflow-hidden scrollbar-hide h-full w-full">
            <PremiumTrialBanner />
            <div className="flex flex-grow overflow-hidden">
                <MenuOptions />
                <div className="w-full overflow-hidden h-screen">
                    <InfoBar />
                    <div className="ml-16">{props.children}</div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
