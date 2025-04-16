// Authentication service using Supabase
import { supabase } from "./supabaseClient";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

// Store the current user in localStorage for persistence between page refreshes
const USER_STORAGE_KEY = "vybz_current_user";

export const authService = {
  // Check if user is logged in
  isAuthenticated: (): boolean => {
    return localStorage.getItem(USER_STORAGE_KEY) !== null;
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      return null;
    }
  },

  // Login user with Supabase
  login: async ({ email, password }: LoginCredentials): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("No user returned from authentication");
    }

    // Get user profile data from the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    }

    // Create user object
    const user: User = {
      id: data.user.id,
      email: data.user.email || "",
      name: profileData?.name || data.user.email?.split("@")[0] || "User",
    };

    // Store user in localStorage
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    return user;
  },

  // Register new user with Supabase
  register: async ({
    email,
    password,
    name,
  }: RegisterCredentials): Promise<User> => {
    // Create new user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("No user returned from registration");
    }

    // Insert user profile data
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        name,
        email,
      },
    ]);

    if (profileError) {
      console.error("Error creating user profile:", profileError);
    }

    // Create user object
    const user: User = {
      id: data.user.id,
      email: data.user.email || "",
      name,
    };

    // Store user in localStorage
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    return user;
  },

  // Logout user from Supabase
  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error during logout:", error);
    }
    localStorage.removeItem(USER_STORAGE_KEY);
  },
};
