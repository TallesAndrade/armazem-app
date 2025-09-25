import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlterarSaldoEstoqueRequest, Estoque } from './estoque.model';

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {

  // A URL base da sua API de estoque
  private apiUrl = 'http://localhost:8080/estoque';

  constructor(private http: HttpClient) { }

  // GET /estoque/ativos
  getEstoquesAtivos(): Observable<Estoque[]> {
    return this.http.get<Estoque[]>(`${this.apiUrl}/ativos`);
  }
  
  // GET /estoque/inativos
  getEstoquesInativos(): Observable<Estoque[]> {
    return this.http.get<Estoque[]>(`${this.apiUrl}/inativos`);
  }
  
  // GET /estoque
  getTodosEstoques(): Observable<Estoque[]> {
    return this.http.get<Estoque[]>(this.apiUrl);
  }

  // GET /estoque/{id}
  getEstoqueById(id: number): Observable<Estoque> {
    return this.http.get<Estoque>(`${this.apiUrl}/${id}`);
  }

  // PATCH /estoque/{id}/adicionar
  adicionarQuantidade(id: number, request: AlterarSaldoEstoqueRequest): Observable<Estoque> {
    return this.http.patch<Estoque>(`${this.apiUrl}/${id}/adicionar`, request);
  }

  // PATCH /estoque/{id}/remover
  removerQuantidade(id: number, request: AlterarSaldoEstoqueRequest): Observable<Estoque> {
    return this.http.patch<Estoque>(`${this.apiUrl}/${id}/remover`, request);
  }

  // GET /estoque/busca/ativos?nome=...
  searchEstoquesAtivos(nome: string): Observable<Estoque[]> {
    return this.http.get<Estoque[]>(`${this.apiUrl}/busca/ativos`, { params: { nome } });
  }
  
  // GET /estoque/busca/inativos?nome=...
  searchEstoquesInativos(nome: string): Observable<Estoque[]> {
    return this.http.get<Estoque[]>(`${this.apiUrl}/busca/inativos`, { params: { nome } });
  }
  
  // GET /estoque/busca?nome=...
  searchTodosEstoques(nome: string): Observable<Estoque[]> {
    return this.http.get<Estoque[]>(`${this.apiUrl}/busca`, { params: { nome } });
  }
}