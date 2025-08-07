"use client";
import React, { useState } from 'react';
import {
  CloudUpload,
  ShieldPlus,
  Settings,
  UserCog,
  Globe,
  Database,
  Bell,
  RefreshCw,
  HardDrive,
  LayoutDashboard,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddRole from '@/components/modals/roles/AddRole';

export default function GeneralSettings() {
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

  // Dummy organization ID - in a real app this would come from your auth context
  const orgId = "org_12345";

  // Define settings categories for better organization
  const settingsCategories = [
    {
      title: "User Management",
      description: "Configure user access and permissions",
      icon: <UserCog className="h-5 w-5" />,
      items: [
        {
          title: "Roles and Permissions",
          description: "Configure access levels and permissions for users",
          icon: <ShieldPlus className="h-4 w-4" />,
          action: () => setIsAddRoleOpen(true),
          badge: { text: "Security", variant: "destructive" as const }
        },
      ]
    },
    // {
    //   title: "Data Management",
    //   description: "Import, export and manage your data",
    //   icon: <Database className="h-5 w-5" />,
    //   items: [
    //     {
    //       title: "Bulk Data Import",
    //       description: "Import data from CSV, Excel or other sources",
    //       icon: <CloudUpload className="h-4 w-4" />,
    //       action: () => console.log("Import data"),
    //       badge: { text: "Data", variant: "outline" as const }
    //     },
    //     {
    //       title: "Data Backup",
    //       description: "Configure automatic backups of your data",
    //       icon: <HardDrive className="h-4 w-4" />,
    //       action: () => console.log("Backup settings")
    //     },
    //     {
    //       title: "Activity Logs",
    //       description: "View system and user activity history",
    //       icon: <RefreshCw className="h-4 w-4" />,
    //       action: () => console.log("View logs")
    //     }
    //   ]
    // },
    // {
    //   title: "System Settings",
    //   description: "Configure global system preferences",
    //   icon: <Settings className="h-5 w-5" />,
    //   items: [
    //     {
    //       title: "Notification Preferences",
    //       description: "Configure email and in-app notifications",
    //       icon: <Bell className="h-4 w-4" />,
    //       action: () => console.log("Notification settings")
    //     },
    //     {
    //       title: "Regional Settings",
    //       description: "Configure timezone, date format and language",
    //       icon: <Globe className="h-4 w-4" />,
    //       action: () => console.log("Regional settings")
    //     },
    //     {
    //       title: "Dashboard Layout",
    //       description: "Configure default views and dashboard layout",
    //       icon: <LayoutDashboard className="h-4 w-4" />,
    //       action: () => console.log("Dashboard settings")
    //     }
    //   ]
    // }
  ];

  const handleRoleAdded = () => {
    // You would typically refresh your roles data here
    console.log("Role added successfully");
  };

  return (
    <div className=" mx-auto py-6 ">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your application preferences and system settings.
          </p>
        </div>
        <Button className="bg-[#815BF5] hover:bg-[#815BF5]/90">
          Save Changes
        </Button>
      </div>

      <div className="grid gap-8">
        {settingsCategories.map((category, index) => (
          <Card key={index} className="overflow-hidden border-muted/40">
            <CardHeader className="bg-muted/20">
              <div className="flex items-center gap-2">
                {category.icon}
                <CardTitle>{category.title}</CardTitle>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={item.action}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#815BF5]/10 text-[#815BF5]">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge variant={item.badge.variant}>
                          {item.badge.text}
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            {index === 0 && ( // Only add this for the first card
              <CardFooter className="bg-muted/10 border-t flex justify-center p-2">
                <Button
                  variant="ghost"
                  className="w-full text-[#815BF5] hover:bg-[#815BF5]/10 hover:text-[#815BF5]"
                  onClick={() => setIsAddRoleOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Role
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      {/* Add Role Modal */}
      <AddRole
        isOpen={isAddRoleOpen}
        setIsOpen={setIsAddRoleOpen}
        onAdded={handleRoleAdded}
      />
    </div>
  );
}
