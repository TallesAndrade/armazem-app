
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  role: Role;
}

export interface JwtPayload {
  sub: string;      
  exp: number;      
  iss: string;      
}