import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';

import { Produto } from '../produto.model';
import { ProdutoService } from '../produto.service';

@Component({
  selector: 'app-produto-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './produto-list.html',
  styleUrls: ['./produto-list.css']
})
export class ProdutoListComponent implements OnInit {
  produtos: Produto[] = [];
  mensagemErro: string | null = null;
  mensagemSucesso: string | null = null;

  activeFilter: string = 'ativos';
  pageTitle: string = 'Produtos Ativos';

  // FormControl para o campo de busca
  searchControl = new FormControl('');

  constructor(
    private produtoService: ProdutoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Detecta o filtro pela URL atual
    const url = this.router.url;
    if (url.includes('/produtos/ativos')) {
      this.activeFilter = 'ativos';
    } else if (url.includes('/produtos/inativos')) {
      this.activeFilter = 'inativos';
    } else if (url.includes('/produtos/todos')) {
      this.activeFilter = 'todos';
    }

    this.atualizarTitulo();

    // Configura a busca reativa
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => this.carregarProdutos(searchTerm || ''))
    ).subscribe({
      next: (dados) => {
        this.produtos = dados;
        this.mensagemErro = null;
      },
      error: (erro) => this.handleError(erro)
    });
  }

  carregarProdutos(searchTerm: string): Observable<Produto[]> {
    this.mensagemSucesso = null;
    this.mensagemErro = null;

    // Se o usuário digitou algo, chama os serviços de BUSCA
    if (searchTerm) {
      switch (this.activeFilter) {
        case 'todos':
          return this.produtoService.searchProdutos(searchTerm);
        case 'inativos':
          return this.produtoService.searchProdutosInativos(searchTerm);
        default: // 'ativos'
          return this.produtoService.searchProdutosAtivos(searchTerm);
      }
    }
    // Se a busca está vazia, chama os serviços de LISTAGEM GERAL
    else {
      switch (this.activeFilter) {
        case 'todos':
          return this.produtoService.getProductos();
        case 'inativos':
          return this.produtoService.getProdutosInativos();
        default: // 'ativos'
          return this.produtoService.getProdutosAtivos();
      }
    }
  }

  // Método para recarregar a lista atual
  private recarregarLista(): void {
    const currentSearch = this.searchControl.value || '';
    this.carregarProdutos(currentSearch).subscribe({
      next: (dados) => {
        this.produtos = dados;
        this.mensagemErro = null;
      },
      error: (erro) => this.handleError(erro)
    });
  }

  atualizarTitulo(): void {
    switch (this.activeFilter) {
      case 'todos': this.pageTitle = 'Todos os Produtos'; break;
      case 'inativos': this.pageTitle = 'Produtos Inativos'; break;
      default: this.pageTitle = 'Produtos Ativos'; break;
    }
  }

   excluirProduto(id: number, nome: string): void {
    if (confirm(`Tem certeza que deseja desativar o produto "${nome}"?`)) {
      this.produtoService.deleteProduto(id).subscribe({
        next: () => {
          this.handleSuccess(`Produto "${nome}" desativado com sucesso.`);
          this.recarregarLista();
        },
        error: (err) => {
          this.handleError(err, 'desativar');
        }
      });
    }
  }

  reativarProduto(id: number, nome: string): void {
    if (confirm(`Tem certeza que deseja reativar o produto "${nome}"?`)) {
      this.produtoService.activateProduto(id).subscribe({
        next: () => {
          this.handleSuccess(`Produto "${nome}" reativado com sucesso.`);
          this.recarregarLista();
        },
        error: (err) => {
          this.handleError(err, 'reativar');
        }
      });
    }
  }

  private handleSuccess(mensagem: string): void {
    this.mensagemSucesso = mensagem;
    setTimeout(() => this.mensagemSucesso = null, 3000);
  }

  private handleError(erro: any, acao: string = 'buscar'): void {
    let mensagem: string;
    
    if (erro.error?.message) {
      mensagem = erro.error.message;
    } else if (erro.message) {
      mensagem = erro.message;
    } else if (erro.error?.error) {
      mensagem = `${erro.error.error} (${erro.error.status})`;
    } else {
      mensagem = `Não foi possível ${acao} os produtos. Verifique a conexão.`;
    }
    
    this.mensagemErro = mensagem;
    console.error('Erro detalhado:', erro);
  }
}