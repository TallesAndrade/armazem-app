import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs/operators';

import { Estoque } from '../estoque.model';
import { EstoqueService } from '../estoque.service';

@Component({
  selector: 'app-estoque-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './estoque-page.html',
  styleUrls: ['./estoque-page.css']
})
export class EstoquePageComponent implements OnInit {
  estoques: Estoque[] = [];
  mensagemErro: string | null = null;
  
  activeFilter: string = 'ativos';
  pageTitle: string = 'Estoque de Produtos Ativos';
  
  searchControl = new FormControl('');

  constructor(
    private estoqueService: EstoqueService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      tap(params => {
        this.activeFilter = params.get('filter') || 'ativos';
        this.atualizarTitulo();
      }),
      switchMap(() => 
        this.searchControl.valueChanges.pipe(
          startWith(''),
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(searchTerm => this.carregarEstoques(searchTerm || ''))
        )
      )
    ).subscribe({
      next: (dados) => {
        this.estoques = dados;
        this.mensagemErro = null;
      },
      error: (erro) => this.handleError(erro)
    });
  }

  carregarEstoques(searchTerm: string): Observable<Estoque[]> {
    this.mensagemErro = null;

    if (searchTerm) {
      switch (this.activeFilter) {
        case 'todos': return this.estoqueService.searchTodosEstoques(searchTerm);
        case 'inativos': return this.estoqueService.searchEstoquesInativos(searchTerm);
        default: return this.estoqueService.searchEstoquesAtivos(searchTerm);
      }
    } else {
      switch (this.activeFilter) {
        case 'todos': return this.estoqueService.getTodosEstoques();
        case 'inativos': return this.estoqueService.getEstoquesInativos();
        default: return this.estoqueService.getEstoquesAtivos();
      }
    }
  }

  atualizarTitulo(): void {
    switch (this.activeFilter) {
      case 'todos': this.pageTitle = 'Todo o Estoque'; break;
      case 'inativos': this.pageTitle = 'Estoque de Produtos Inativos'; break;
      default: this.pageTitle = 'Estoque de Produtos Ativos'; break;
    }
  }

  private handleError(erro: any): void {
    console.error('Erro ao buscar estoque:', erro);
    this.mensagemErro = 'Não foi possível carregar os dados do estoque. Verifique a API.';
  }

  // Função para determinar o status do estoque
  getStatusEstoque(item: Estoque): string {
    const quantidade = item.quantidadeKg ?? item.quantidadeUnidades ?? 0;
    const minimo = item.quantidadeMinima ?? 0;
    
    if (quantidade <= 0) return 'esgotado';
    if (minimo > 0 && quantidade <= minimo) return 'baixo';
    return 'ok';
  }
}