import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venda, AdicionarItemVendaRequest } from './venda.model';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private apiUrl = 'http://localhost:8080/vendas';

  constructor(private http: HttpClient) { }

  // POST /vendas
  criarVenda(): Observable<Venda> {
    return this.http.post<Venda>(this.apiUrl, {});
  }

  // GET /vendas
  getVendas(): Observable<Venda[]> {
    return this.http.get<Venda[]>(this.apiUrl);
  }

  // GET /vendas/abertas
  getVendasAbertas(): Observable<Venda[]> {
    return this.http.get<Venda[]>(`${this.apiUrl}/abertas`);
  }

  // GET /vendas/finalizadas
  getVendasFinalizadas(): Observable<Venda[]> {
    return this.http.get<Venda[]>(`${this.apiUrl}/finalizadas`);
  }

  // GET /vendas/{id}
  getVendaById(id: number): Observable<Venda> {
    return this.http.get<Venda>(`${this.apiUrl}/${id}`);
  }

  // POST /vendas/{id}/itens
  adicionarProduto(vendaId: number, request: AdicionarItemVendaRequest): Observable<Venda> {
    return this.http.post<Venda>(`${this.apiUrl}/${vendaId}/itens`, request);
  }

  // DELETE /vendas/{vendaId}/itens/{produtoVendaId}
  removerProduto(vendaId: number, produtoVendaId: number): Observable<Venda> {
    return this.http.delete<Venda>(`${this.apiUrl}/${vendaId}/itens/${produtoVendaId}`);
  }

  // PATCH /vendas/{id}/finalizar
  finalizarVenda(vendaId: number): Observable<Venda> {
    return this.http.patch<Venda>(`${this.apiUrl}/${vendaId}/finalizar`, {});
  }

  // DELETE /vendas/{id}
  deletarVenda(vendaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${vendaId}`);
  }
}