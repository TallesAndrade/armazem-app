import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EstoqueService } from '../estoque.service';
import { Estoque } from '../estoque.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'app-estoque-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './estoque-page.html',
  styleUrls: ['./estoque-page.css']
})
export class EstoquePageComponent implements OnInit {
  estoques: Estoque[] = [];
  termoBusca: string = '';
  loading: boolean = false;

  private searchSubject = new Subject<string>();

  constructor(
    private estoqueService: EstoqueService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarEstoques();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.carregarEstoques();
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.buscarEstoques();
    });
  }

  carregarEstoques(): void {
    this.loading = true;
    const path = this.router.url;

    let observable;
    if (path.includes('inativos')) {
      observable = this.estoqueService.getEstoquesInativos();
    } else if (path.includes('ativos')) {
      observable = this.estoqueService.getEstoquesAtivos();
    } else {
      observable = this.estoqueService.getTodosEstoques();
    }

    observable.subscribe({
      next: (estoques) => {
        this.estoques = estoques;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar estoques:', err);
        this.loading = false;
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  buscarEstoques(): void {
    if (!this.termoBusca || this.termoBusca.trim() === '') {
      this.carregarEstoques();
      return;
    }

    this.loading = true;
    const path = this.router.url;

    let observable;
    if (path.includes('inativos')) {
      observable = this.estoqueService.searchEstoquesInativos(this.termoBusca);
    } else if (path.includes('ativos')) {
      observable = this.estoqueService.searchEstoquesAtivos(this.termoBusca);
    } else {
      observable = this.estoqueService.searchTodosEstoques(this.termoBusca);
    }

    observable.subscribe({
      next: (estoques) => {
        this.estoques = estoques;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar estoques:', err);
        this.loading = false;
      }
    });
  }

  isEstoqueZerado(estoque: Estoque): boolean {
    if (estoque.ehPesavel) {
      return (estoque.quantidadeKg ?? 0) === 0;
    }
    return (estoque.quantidadeUnidades ?? 0) === 0;
  }

  isEstoqueBaixo(estoque: Estoque): boolean {
    if (estoque.ehPesavel) {
      return (estoque.quantidadeKg ?? 0) < (estoque.quantidadeMinima ?? 0) && (estoque.quantidadeKg ?? 0) > 0;
    }
    return (estoque.quantidadeUnidades ?? 0) < (estoque.quantidadeMinima ?? 0) && (estoque.quantidadeUnidades ?? 0) > 0;
  }

  ajustarEstoque(id: number): void {
    this.router.navigate(['/estoque/ajustar', id]);
  }
}