export interface User {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  terms_accepted: boolean;
  two_factor_enabled: boolean;
  terms_accepted_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface APIResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

export interface ApiError {
  success: false;
  statusCode: number;
  error: {
    code: string;
    message: string;
  };
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  validate2FA: (userId: string, code: string) => Promise<void>;
}
