export interface LoginRequest {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface LoginResponse {
    email: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    token: string;
    expiresAt: Date;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}
