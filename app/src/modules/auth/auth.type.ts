

// Auth
export interface RegisterType {
  login: string;
  email: string;
  password: string;
}

export interface LoginType {
  email: string;
  password: string;
}


// User
export interface AuthUser {
  id: number;
  login: string;
  email: string;
  role: "USER" | "ADMIN";
}

// Token


export interface RefreshType {
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
} 

export interface LogoutType {
  id: number;
  refreshToken: string;
}

