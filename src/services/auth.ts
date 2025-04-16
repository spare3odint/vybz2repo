// Simple authentication service for demo purposes
// In a real application, this would connect to a backend service

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

// Mock user database
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "user@example.com": {
    password: "password123",
    user: {
      id: "1",
      email: "user@example.com",
      name: "Demo User",
    },
  },
};

// Store the current user in localStorage
const USER_STORAGE_KEY = "vybz_current_user";

export const authService = {
  // Check if user is logged in
  isAuthenticated: (): boolean => {
    return localStorage.getItem(USER_STORAGE_KEY) !== null;
  },

  // Get current user
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

  // Login user
  login: async ({ email, password }: LoginCredentials): Promise<User> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const lowerEmail = email.toLowerCase();
    const userRecord = MOCK_USERS[lowerEmail];

    if (!userRecord || userRecord.password !== password) {
      throw new Error("Invalid email or password");
    }

    // Store user in localStorage
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userRecord.user));

    return userRecord.user;
  },

  // Register new user
  register: async ({
    email,
    password,
    name,
  }: RegisterCredentials): Promise<User> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const lowerEmail = email.toLowerCase();

    // Check if user already exists
    if (MOCK_USERS[lowerEmail]) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: lowerEmail,
      name,
    };

    // Add to mock database
    MOCK_USERS[lowerEmail] = {
      password,
      user: newUser,
    };

    // Store user in localStorage
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));

    return newUser;
  },

  // Logout user
  logout: async (): Promise<void> => {
    localStorage.removeItem(USER_STORAGE_KEY);
  },
};
