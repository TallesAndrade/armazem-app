// src/app/auth/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { LoginRequest, LoginResponse, User, Role, JwtPayload } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // ✅ Valida token ao iniciar
    if (!this.isAuthenticated() && this.getToken()) {
      console.warn('⚠️ Token expirado detectado ao iniciar. Limpando dados...');
      this.clearAuthData();
    }

    this.checkTokenExpiration();
  }

  /**
   * Login
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.token);

        const payload = this.decodeToken(response.token);
        if (payload) {
          const user: User = {
            id: '',
            username: payload.sub,
            email: '',
            role: this.mapRole(payload.role)
          };
          this.setUser(user);
        }
      }),
      catchError(error => {
        console.error('❌ Erro no login:', error);

        let errorMessage = 'Usuário ou senha inválidos';

        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.remainingAttempts !== undefined) {
          const attempts = error.error.remainingAttempts;
          errorMessage = `Credenciais inválidas. ${attempts} tentativa(s) restante(s)`;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  /**
   * Limpa dados de autenticação
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = this.decodeToken(token);
    if (!payload) return false;

    const now = Date.now() / 1000;
    return payload.exp > now;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === Role.ADMIN;
  }

  isUser(): boolean {
    const user = this.getCurrentUser();
    return user?.role === Role.USER;
  }

  getRole(): Role | null {
    return this.getCurrentUser()?.role || null;
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ Token inválido: não tem 3 partes');
        return null;
      }

      const payload = parts[1];
      const decoded = atob(payload);
      const parsed = JSON.parse(decoded) as JwtPayload;

      console.log('✅ Token decodificado:', parsed);
      return parsed;

    } catch (e) {
      console.error('❌ Erro ao decodificar token:', e);
      return null;
    }
  }

  private mapRole(role: string): Role {
    const upperRole = role.toUpperCase();
    if (upperRole === 'ADMIN') return Role.ADMIN;
    if (upperRole === 'USER') return Role.USER;

    console.warn('⚠️ Role desconhecida:', role, '- usando USER como padrão');
    return Role.USER;
  }

  private checkTokenExpiration(): void {
    setInterval(() => {
      if (!this.isAuthenticated() && this.getToken()) {
        console.warn('⚠️ Token expirado! Fazendo logout...');
        this.logout();
      }
    }, 60000);
  }

  createUser(request: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, request);
  }
}