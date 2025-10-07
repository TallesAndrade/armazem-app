import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule,NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../produto.service';
import { Produto } from '../produto.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged,filter } from 'rxjs/operators';

@Component({
  selector: 'app-produto-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './produto-list.html',
  styleUrls: ['./produto-list.css']
})
export class ProdutoListComponent implements OnInit {
  produtos: Produto[] = [];
  termoBusca: string = '';
  mensagemSucesso: string | null = null;
  mensagemErro: string | null = null;
  loading: boolean = false;
  
  private searchSubject = new Subject<string>();

  constructor(
    private produtoService: ProdutoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();

     this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.carregarProdutos();
    });
    
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.buscarProdutos();
    });
  }

  carregarProdutos(): void {
    this.loading = true;
    const path = this.router.url;
    
    let observable;
    if (path.includes('inativos')) {
      observable = this.produtoService.getProdutosInativos();
    } else if (path.includes('ativos')) {
      observable = this.produtoService.getProdutosAtivos();
    } else {
      observable = this.produtoService.getProdutos();
    }

    observable.subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.loading = false;
      },
      error: (err) => {
        this.handleError('carregar produtos');
        this.loading = false;
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  buscarProdutos(): void {
    if (!this.termoBusca || this.termoBusca.trim() === '') {
      this.carregarProdutos();
      return;
    }

    this.loading = true;
    const path = this.router.url;
    
    let observable;
    if (path.includes('inativos')) {
      observable = this.produtoService.searchProdutosInativos(this.termoBusca);
    } else if (path.includes('ativos')) {
      observable = this.produtoService.searchProdutosAtivos(this.termoBusca);
    } else {
      observable = this.produtoService.searchProdutos(this.termoBusca);
    }

    observable.subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.loading = false;
      },
      error: (err) => {
        this.handleError('buscar produtos');
        this.loading = false;
      }
    });
  }

  navigateToForm(): void {
    this.router.navigate(['/produtos/novo']);
  }

  editarProduto(id: number): void {
    this.router.navigate(['/produtos/editar', id]);
  }

  desativarProduto(id: number): void {
    if (!confirm('Deseja realmente desativar este produto?')) return;

    this.produtoService.deleteProduto(id).subscribe({
      next: () => {
        this.handleSuccess('Produto desativado com sucesso!');
        this.carregarProdutos();
      },
      error: (err) => this.handleError('desativar produto')
    });
  }

  ativarProduto(id: number): void {
    if (!confirm('Deseja realmente ativar este produto?')) return;

    this.produtoService.activateProduto(id).subscribe({
      next: () => {
        this.handleSuccess('Produto ativado com sucesso!');
        this.carregarProdutos();
      },
      error: (err) => this.handleError('ativar produto')
    });
  }

  private handleSuccess(mensagem: string): void {
    this.mensagemErro = null;
    this.mensagemSucesso = mensagem;
    setTimeout(() => this.mensagemSucesso = null, 3000);
  }

  private handleError(acao: string): void {
    this.mensagemSucesso = null;
    this.mensagemErro = `Não foi possível ${acao}. Tente novamente.`;
    setTimeout(() => this.mensagemErro = null, 5000);
  }
}