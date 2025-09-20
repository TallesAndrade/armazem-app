import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Produto } from '../produto.model';
import { ProdutoService } from '../produto';

@Component({
  selector: 'app-produto-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './produto-list.html',
  styleUrls: ['./produto-list.css']
})
export class ProdutoListComponent implements OnInit {
  produtos: Produto[] = [];
  mensagemErro: string | null = null;
  mensagemSucesso: string | null = null;
  
  activeFilter: string = 'ativos'; // Filtro padrão
  pageTitle: string = 'Produtos Ativos';

  constructor(
    private produtoService: ProdutoService,
    private route: ActivatedRoute, // Para ler a URL
    private router: Router // Para navegar
  ) {}

  ngOnInit(): void {
    // Escuta as mudanças no parâmetro 'filter' da URL
    this.route.paramMap.pipe(
      switchMap(params => {
        this.activeFilter = params.get('filter') || 'ativos';
        return this.carregarProdutos();
      })
    ).subscribe({
      next: (dados) => {
        this.produtos = dados;
        this.mensagemErro = null;
      },
      error: (erro) => this.handleError(erro)
    });
  }

  carregarProdutos(): Observable<Produto[]> {
    this.mensagemSucesso = null;
    this.mensagemErro = null;

    switch (this.activeFilter) {
      case 'todos':
        this.pageTitle = 'Todos os Produtos';
        return this.produtoService.getProductos();
      case 'inativos':
        this.pageTitle = 'Produtos Inativos';
        return this.produtoService.getProdutosInativos();
      default:
        this.activeFilter = 'ativos';
        this.pageTitle = 'Produtos Ativos';
        return this.produtoService.getProdutosAtivos();
    }
  }

  excluirProduto(id: number, nome: string): void {
    if (confirm(`Tem certeza que deseja desativar o produto "${nome}"?`)) {
      this.produtoService.deleteProduto(id).subscribe({
        next: () => {
          this.handleSuccess(`Produto "${nome}" desativado com sucesso.`);
          this.produtos = this.produtos.filter(p => p.id !== id);
        },
        error: (err) => this.handleError(err, 'desativar')
      });
    }
  }

  reativarProduto(id: number, nome: string): void {
    if (confirm(`Tem certeza que deseja reativar o produto "${nome}"?`)) {
      this.produtoService.activateProduto(id).subscribe({
        next: () => {
          this.handleSuccess(`Produto "${nome}" reativado com sucesso.`);
          this.produtos = this.produtos.filter(p => p.id !== id);
        },
        error: (err) => this.handleError(err, 'reativar')
      });
    }
  }

  private handleSuccess(mensagem: string): void {
    this.mensagemSucesso = mensagem;
    setTimeout(() => this.mensagemSucesso = null, 3000);
  }

  private handleError(erro: any, acao: string = 'buscar'): void {
    console.error(`Erro ao ${acao} produtos:`, erro);
    this.mensagemErro = `Não foi possível ${acao} os produtos. Verifique a API.`;
  }
}