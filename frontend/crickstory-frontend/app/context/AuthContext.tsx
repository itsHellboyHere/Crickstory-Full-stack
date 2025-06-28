'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
};
type Profile = {
  username: string;
  name?: string;
  image?: string;
  bio?: string;
  location?: string;
  birth_date?: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  setUser: () => { },
  setProfile: () => { },
  loading: true,
  logout: async () => { },
  refreshProfile: async () => { },
  refreshUser: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch logged-in user info
  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/user/', { withCredentials: true });
      // console.log('[AuthContext] fetchUser success:', res.data);
      const data = res.data;
      const user: User = {
        id: data.pk,
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      };
      setUser(user);
    } catch (error: any) {
      // console.error('[AuthContext] fetchUser error:', error);
      if (error.response?.status !== 401) {
        console.error('[AuthContext] fetchUser error:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile info (can be called anytime to refresh profile state)
  const fetchProfile = async () => {

    try {
      const res = await axios.get('/api/user/profile/', { withCredentials: true });
      // console.log('[AuthContext] fetchProfile success:', res.data);
      setProfile(res.data);
    } catch (error: any) {
      // console.error('[AuthContext] fetchProfile error:', error);
      if (error.response?.status !== 401) { // Only log non-auth errors
        console.error('[AuthContext] fetchUser error:', error);
      }
      setProfile(null);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout/', {}, { withCredentials: true });
      setUser(null);
      setProfile(null);
      router.push('/login');
    } catch (error) {
      console.error('[AuthContext] logout error:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchProfile();

    // Optional: periodic token refresh
    const refreshInterval = setInterval(() => {
      axios
        .post('/api/auth/token/refresh/', {}, { withCredentials: true })
        .catch(() => {
          // Fail silently; actual requests will handle unauthorized errors
        });
    }, 15 * 60 * 1000); // every 15 mins

    return () => clearInterval(refreshInterval);
  }, []);
  // console.log('AuthProvider rendering', {
  //   user,
  //   profile,
  //   refreshProfile: fetchProfile
  // });
  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        setUser,
        setProfile,
        loading,
        logout,
        refreshProfile: fetchProfile,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
