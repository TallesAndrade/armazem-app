
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../auth/models/auth.model';

export interface ChangeEmailRequest {
  emailNovo: string;
  emailNovoConfirmacao: string;
  senha: string;
}

export interface ChangePasswordRequest {
  senhaAtual: string;
  senhaNova: string;
  senhaNovaConfirmacao: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/user';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  changeEmail(request: ChangeEmailRequest): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/me/email`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/me/password`, request);
  }
}