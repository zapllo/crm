"use client";

import { useUserContext } from '@/contexts/userContext';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  UserRound,
  Settings,
  KeyRound,
  Ticket,
  BookOpen,
  LogOut,
  Settings2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ProfileImage } from './ProfileImage';
import { ProfileInformation } from './ProfileInformation';
import { UpdateProfileForm } from './UpdateProfileForm';
import { ChangePasswordForm } from './ChangePassword';

export function ProfilePage() {
  const { user, loading, logout } = useUserContext();
  const [activeTab, setActiveTab] = useState('information');

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-2xl font-bold mb-4">Not Logged In</h1>
        <p className="mb-6">Please log in to view your profile</p>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full pt-12 pb-16 px-4 mt-12 h-full overflow-y-auto scrollbar-hide md:px-6 lg:px-8"
    style={{
        maxHeight: 'calc(100vh - 16px)', // Adjust based on your layout
        scrollBehavior: 'auto' // Prevent smooth scrolling which can interfere
    }}>
      <h1 className="text-3xl font-bold mb-8 text-start">My Profile</h1>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          {/* Profile Image Card */}
          <Card>
            <CardContent className="pt-6">
              <ProfileImage
                profileImage={user.profileImage}
                name={`${user.firstName} ${user.lastName}`}
                email={user.email}
              />
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/help/tickets">
                <Button variant="ghost" className="w-full justify-start">
                  <Ticket className="mr-2 h-4 w-4" />
                  My Tickets
                </Button>
              </Link>
              <Link href="https://zapllo.com/tutorials-zapllo">
                <Button variant="ghost" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Tutorials
                </Button>
              </Link>
              <Link href="/settings/general">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start text-red-500" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>View and manage your profile settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid bg-accent gap-2 w-full grid-cols-3">
                <TabsTrigger className='border-none' value="information">
                  <UserRound className="mr-2 h-4 w-4" />
                  Information
                </TabsTrigger>
                <TabsTrigger className='border-none' value="update">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </TabsTrigger>
                <TabsTrigger className='border-none' value="password">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Password
                </TabsTrigger>
              </TabsList>

              <TabsContent value="information" className="pt-4">
                <ProfileInformation user={user} />
              </TabsContent>

              <TabsContent value="update" className="pt-4">
                <UpdateProfileForm user={user} />
              </TabsContent>

              <TabsContent value="password" className="pt-4">
                <ChangePasswordForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container mt-12 mx-auto py-10 px-4 max-w-5xl">
      <Skeleton className="h-10 w-[250px] mx-auto mb-8" />

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full rounded-md" />
          <Skeleton className="h-[200px] w-full rounded-md" />
        </div>

        <Skeleton className="h-[500px] w-full rounded-md" />
      </div>
    </div>
  );
}
