import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from './produto.model';

export interface ProdutoRequest {
  nome: string;
  unidadeMedida: string; 
  precoKg: number | null;
  precoUnidade: number | null;
  dataValidade: string;
  ehPesavel: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private apiUrl = 'http://localhost:8080/produtos';

  constructor(private http: HttpClient) { }

  getProductos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }

  getProdutosAtivos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/ativos`);
  }

  getProdutosInativos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/inativos`);
  }

  getProdutoById(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/${id}`);
  }

  createProduto(produto: ProdutoRequest): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, produto);
  }

  updateProduto(id: number, produto: ProdutoRequest): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/${id}`, produto);
  }

  deleteProduto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  activateProduto(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/ativar`, {});
  }

  searchProdutos(nome: string): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/busca`, { params: { nome } });
  }

  searchProdutosAtivos(nome: string): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/busca/ativos`, { params: { nome } });
  }

  searchProdutosInativos(nome: string): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/busca/inativos`, { params: { nome } });
  }
}