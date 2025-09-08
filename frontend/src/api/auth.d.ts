export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export function login(loginData: LoginData): Promise<{ data: { token: string; user: UserProfile } }>;
export function register(registerData: RegisterData): Promise<{ data: { token: string; user: UserProfile } }>;
export function getMyProfile(): Promise<{ data: UserProfile }>;
export function updateProfile(profileData: UpdateProfileData): Promise<{ data: UserProfile }>;
export function updateUser(userId: string, updates: UpdateProfileData): Promise<{ data: UserProfile }>;
export function forgotPassword(email: string): Promise<{ data: { message: string } }>;
export function resetPassword(token: string, password: string, confirmPassword: string): Promise<{ data: { message: string } }>;
export function validateResetToken(token: string): Promise<{ data: { valid: boolean } }>;