"use client";

import { createContext, useContext } from "react";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/types/supabase";

export type UserRole = Tables<"staff_roles">["name"];

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

const mockUser = {
  id: "helenzinha-id",
  email: "helenzinhalr@hotmail.com",
} as User;

const mockProfile = {
  name: "Helen",
  image_url: null,
  role: "admin" as UserRole,
};

const UserContext = createContext<UserContextType>({
  user: mockUser,
  profile: mockProfile,
  isLoading: false,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const value = {
    user: mockUser,
    profile: mockProfile,
    isLoading: false,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}