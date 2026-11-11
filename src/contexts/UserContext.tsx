"use client";

import { createContext, useContext } from "react";
import { User } from "@supabase/supabase-js";


export type UserRole = "super_admin" | "admin" | "cashier";

type UserProfile = {
  name: string | null;
  image_url: string | null;
  role: UserRole | null;
};

type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({ user: null, profile: null, isLoading: false });
export function UserProvider({ children, user = null }: { children: React.ReactNode; user?: User | null }) {
  const profile: UserProfile | null = user ? {
    name: user.user_metadata?.name ?? user.email ?? null,
    image_url: user.user_metadata?.image_url ?? null,
    role: "super_admin",
  } : null;
  return <UserContext.Provider value={{ user, profile, isLoading: false }}>{children}</UserContext.Provider>;
}
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}