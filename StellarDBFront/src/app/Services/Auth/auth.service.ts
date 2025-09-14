import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { GlobalConfig } from '../../global-config';
import { LoginRequest, LoginResponse, AuthResponse } from '../../Core/Models/Auth/auth.model';
import { JwtService } from '../jwt.service';

export interface TokenResponse {
  token: string;
  refreshToken: string;
  refreshTokenExpiryTime: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly authUrl = `${GlobalConfig.apiUrl}/Auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'currentUser';
  
  // For session-only storage (when rememberMe = false)
  private sessionToken: string | null = null;
  private sessionUser: LoginResponse | null = null;

  constructor(
    private http: HttpClient,
    private jwtService: JwtService
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const savedUser = localStorage.getItem(this.USER_KEY);
    let token = localStorage.getItem(this.TOKEN_KEY);

    // Handle both cases: separate token storage and embedded token in user object
    if (savedUser) {
      const user = JSON.parse(savedUser) as LoginResponse;

      // If no separate token, try to get it from the user object
      if (!token && user.token) {
        token = user.token;
        // Store it separately for consistency
        localStorage.setItem(this.TOKEN_KEY, token);
      }

      if (token) {
        // Use JwtService to validate token
        const isExpired = this.jwtService.isTokenExpired(token);
        if (isExpired !== true) {
          user.token = token; // Ensure token is set
          this.currentUserSubject.next(user);
          return;
        }
      }
    }
    // If we get here, clear everything
    this.clearStorageData();
  }

  private clearStorageData(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.sessionToken = null;
    this.sessionUser = null;
    this.currentUserSubject.next(null);
  }

  private saveUserToStorage(user: LoginResponse, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      if (user.token) {
        localStorage.setItem(this.TOKEN_KEY, user.token);
      }
      // Clear session storage
      this.sessionToken = null;
      this.sessionUser = null;
    } else {
      // Session-only storage (in memory)
      this.sessionToken = user.token;
      this.sessionUser = user;
      // Don't save to localStorage for session-only
    }
  }

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.authUrl}/login`, credentials)
      .pipe(
        map((response: TokenResponse) => {
          this.storeUser(response.token, credentials.rememberMe);
          return response;
        }),
        catchError(error => {
          this.clearStorageData();
          throw error;
        })
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/logout`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap({
        next: () => {
          this.clearStorageData();
        },
        error: (error) => {
          this.clearStorageData();
          throw error;
        }
      })
    );
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, { username, email, password })
      .pipe(
        catchError(error => {
          throw error;
        })
      );
  }

  isAuthenticated(): boolean {
    const currentUser = this.currentUserSubject.value;
    const token = this.getToken();
    
    if (!currentUser || !token) {
      return false;
    }

    // Use JwtService to check if token is still valid
    const isExpired = this.jwtService.isTokenExpired(token);
    const isAuth = isExpired !== true; // true if not expired, false if expired, true if cannot determine (null)
        
    return isAuth;
  }

  getToken(): string | null {
    // Check session storage first, then localStorage
    return this.sessionToken || localStorage.getItem(this.TOKEN_KEY);
  }

  private storeUser(token: string, rememberMe: boolean = false): void {
    // Use JwtService to decode the token
    const payload = this.jwtService.decodeJwtPayload(token);
    
    if (payload) {
      if (!payload.exp) {
        throw new Error('Invalid JWT token: missing expiration time');
      }

      const user: LoginResponse = {
        email: payload['email'] || '',
        userName: payload['unique_name'] || payload.sub || '',
        firstName: payload['given_name'] || '', // Add if available in your JWT
        lastName: payload['family_name'] || '', // Add if available in your JWT
        token: token,
        expiresAt: new Date(payload.exp * 1000)
      };
      
      // Always update the current user subject
      this.currentUserSubject.next(user);
      
      // Handle storage based on rememberMe preference
      this.saveUserToStorage(user, rememberMe);
    } else {
      throw new Error('Invalid JWT token received');
    }
  }

  // Authentication-specific helper methods using JwtService
  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    
    const payload = this.jwtService.decodeJwtPayload(token);
    if (!payload?.['role']) return [];
    
    return Array.isArray(payload['role']) ? payload['role'] : [payload['role']];
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    return token ? this.jwtService.getClaim(token, 'email') : null;
  }

  getUserId(): string | null {
    const token = this.getToken();
    return token ? this.jwtService.getClaim(token, 'sub') : null;
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  getTokenExpirationTime(): Date | null {
    const token = this.getToken();
    if (!token) return null;
    
    const payload = this.jwtService.decodeJwtPayload(token);
    return payload?.exp ? new Date(payload.exp * 1000) : null;
  }
}
