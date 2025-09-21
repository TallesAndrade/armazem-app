import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs/operators';

import { Produto } from '../produto.model';
import { ProdutoService } from '../produto';

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
    // Este bloco agora é "reativo". Ele escuta tanto a URL quanto a busca.
    this.route.paramMap.pipe(
      // 1. Pega o filtro da URL (ativos, inativos, todos)
      tap(params => {
        this.activeFilter = params.get('filter') || 'ativos';
        this.atualizarTitulo();
      }),
      // 2. Com base no filtro, começa a escutar o campo de busca
      switchMap(() =>
        this.searchControl.valueChanges.pipe(
          startWith(''), // Garante a primeira carga de dados
          debounceTime(300), // Espera 300ms após o usuário parar de digitar
          distinctUntilChanged(), // Evita buscas repetidas com o mesmo texto
          // 3. Cancela a busca anterior e faz uma nova com o termo atual
          switchMap(searchTerm => this.carregarProdutos(searchTerm || ''))
        )
      )
    ).subscribe({
      next: (dados) => {
        this.produtos = dados;
        this.mensagemErro = null;
      },
      error: (erro) => this.handleError(erro)
    });
  }

  // A função agora recebe o termo da busca como parâmetro
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
          // Recarrega a lista para refletir a mudança
          this.searchControl.setValue(this.searchControl.value);
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
          // Recarrega a lista para refletir a mudança
          this.searchControl.setValue(this.searchControl.value);
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
