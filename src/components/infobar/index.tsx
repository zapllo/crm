"use client";
import React, { useEffect, useState } from "react";
import {
  Bell,
  BellDot,
  Book,
  DollarSign,
  Headphones,
  LogOut,
  LogOutIcon,
  Search,
  Settings,
  User,
  User2,
  XIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ModeToggle } from "../globals/mode-toggle";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { BellIcon } from "@radix-ui/react-icons";
import { Label } from "../ui/label";
import MainLoader from "../loaders/loader";
import { ModeToggle2 } from "../globals/mode-toggle2";
import { FaAndroid, FaApple } from "react-icons/fa";
import { useUserContext } from "@/contexts/userContext";

type Props = {};

const InfoBar = (props: Props) => {
  const router = useRouter();
  const pathName = usePathname();
  const { user, loading } = useUserContext();

  const getPageTitle = () => {
    if (pathName === "/settings/customize") {
      return "Customize";
    }
    if (pathName === "/CRM/contacts") {
      return "Contacts";
    } else if (pathName === "/settings/customize") {
      return "General";
    } else if (pathName === "/CRM/follow-up") {
      return "Follow-ups";
    } else if (pathName === "/dashboard/teams") {
      return "My Team";
    } else if (pathName === "/dashboard/settings") {
      return "Settings";
    } else if (pathName === "/dashboard/settings/categories") {
      return "Categories";
    } else if (pathName === "/dashboard/billing") {
      return "Billing & Wallet";
    } else if (pathName === "/dashboard/billing/wallet-logs") {
      return "Billing Logs";
    } else if (pathName === "/dashboard/checklist") {
      return "My Checklist";
    } else if (pathName === "/help/tickets") {
      return "My Tickets";
    } else if (pathName === "/help/mobile-app") {
      return "Mobile App";
    }
    // Handle the dynamic route for /dashboard/tickets/[id]
    else if (pathName.startsWith("/help/tickets/")) {
      return "Ticket Details";
    } else if (pathName === "/dashboard/profile") {
      return "My Profile";
    } else if (pathName === "/dashboard/integrations") {
      return "Integrations";
    } else if (pathName === "/intranet") {
      return "Intranet";
    } else if (pathName === "/help/tutorials") {
      return "Tutorials";
    } else if (pathName === "/help/events") {
      return "Events";
    } else if (pathName === "/admin/dashboard") {
      return "Admin Dashboard";
    } else if (pathName === "/dashboard/settings/changePassword") {
      return "Change Password";
    } else if (pathName === "/attendance") {
      return "Dashboard";
    } else if (pathName === "/attendance/settings") {
      return "Settings";
    } else if (pathName === "/attendance/settings/leave-types") {
      return "Leave Types";
    } else if (pathName === "/attendance/settings/register-faces") {
      return "Register Faces";
    } else if (pathName === "/attendance/my-leaves") {
      return "My Leaves";
    } else if (pathName === "/attendance/my-attendance") {
      return "My Attendance";
    } else if (pathName === "/attendance/holidays") {
      return "Holidays";
    } else if (pathName === "/attendance/all-leaves") {
      return "All Leaves";
    } else if (pathName === "/attendance/all-attendance") {
      return "All Attendance";
    } else if (pathName === "/attendance/approvals") {
      return "Approvals";
    }
  };

  const logout = async () => {
    try {
      await axios.get("/api/auth/logout");
      router.push('/login');
      // router.push("/login");
    } catch (error: any) {
      console.log(error.message);
    }
  };
  // console.log(user, 'user?')
  return (
    <>
      {/* {userLoading && (
        <MainLoader />
      )} */}
      <div className="  fixed  w-[100%]  z-[10]">
        <div className="gap-6 ml-12 border-b  items-center px-4 py-2 w-[100%] z-[10] flex flex-row  ">
          {/* <img src='/icons/ellipse.png' className='absolute h-[50%] z-[10]   opacity-30 -ml-32 ' /> */}
          <div
            className={`flex   ${pathName === "/dashboard" ? "text-center ml-[42%] w-screen" : ""
              }`}
          >
            <h1 className={`text-md mt-1 ml-4 text-white font-bold `}>
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4 ml-auto mx-12 font-bold">
            {/* <h1 className='text-xs mt- '>Access Expires in <span className='text-red-500 font-bold'>{remainingTime || 'Loading...'}</span></h1> */}
            {/* <Label className="text-xs p-2 bg-red-500 rounded-full">
              <h1>Trial Expired</h1>
            </Label> */}
            {/* <ModeToggle /> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="relative rounded-full hover:bg-[] bg-[] border p-2 h-9 w-9"
                  size="icon"
                >
                  <img
                    src="/icons/bell.png"
                    className="h"
                    alt="Notification Bell"
                  />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-red-500 "></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 -ml-36">
                <DropdownMenuLabel>
                  Notifications Coming Soon.
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex gap-2 ">
                  <div className="h-9 w-9 text-xs items-center cursor-pointer flex justify-center border bg-[#815BF5] rounded-full">
                    {`${user?.firstName}`.slice(0, 1)}
                    {`${user?.lastName}`.slice(0, 1)}
                  </div>

                  <div>
                    <h1 className="text-[#ffffff] text-sm ">{user?.firstName}


                    </h1>

                    <h1 className=" text-[10px] text-muted-foreground font-thin ">
                      Admin
                    </h1>

                  </div>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 -ml-36">
                <DropdownMenuLabel>
                  {user?.firstName}
                  {user?.lastName}
                  <p className="text-xs text-gray-400 capitalize">
                    Role:{" "}

                    <span>Admin</span>

                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href="/dashboard/profile">
                    <DropdownMenuItem className="gap-1">
                      <User2 className="h-4" />
                      Profile
                      {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
                    </DropdownMenuItem>
                  </Link>

                  <Link href="/dashboard/billing">
                    <DropdownMenuItem className="gap-1">
                      <DollarSign className="h-4" />
                      Billing
                      {/* <DropdownMenuShortcut>⌘B</DropdownMenuShortcut> */}
                    </DropdownMenuItem>
                  </Link>


                  <Link href="/dashboard/settings">
                    <DropdownMenuItem className="gap-1">
                      <Settings className="h-4" />
                      Settings
                      {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/help/mobile-app">
                    <DropdownMenuItem className="gap-1 ">
                      <div className="flex items-center gap-2 px-1 ">
                        <FaAndroid className="h-4" />
                        <h1>Android App</h1>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/help/mobile-app">
                    <DropdownMenuItem className="gap-1">
                      <div className="flex items-center gap-2 px-1 ">
                        <FaApple className="h-4" />
                        <h1>Iphone App</h1>
                      </div>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuSeparator />

                  <div className="gap-1 p-2">
                    <ModeToggle2 />
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />


                <DropdownMenuItem className="gap-1" onClick={logout} >
                  <LogOut className="h-4" />
                  Log out
                  {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoBar;
