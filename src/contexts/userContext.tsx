"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface Organization {
  _id: string;
  companyName: string;
  trialExpires: string; // This will be a date string
  isPro: boolean;
  subscribedPlan?: string;
  subscriptionExpires?: string;
}

interface IUser {
  userId: string;
  email: string;
  isOrgAdmin: boolean;
  firstName?: string;
  lastName?: string;
  whatsappNo?: string;
  profileImage?: string;
  organization?: Organization;
  role:{
    name:string;
  };
}

interface UserContextProps {
  user: IUser | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  loading: true,
  fetchUser: async () => { },
  logout: () => { }
});

export const useUserContext = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/me'); // Cookie-based auth
      if (res.data && !res.data.error) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    // You can create a /api/auth/logout that clears the cookie.
    // For simplicity, we'll just set an expired cookie:
    document.cookie = "token=; Path=/; Max-Age=0;";
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, fetchUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}
