import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VendaService } from '../venda.service';
import { Venda } from '../venda.model';

@Component({
  selector: 'app-vendas-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendas-list.html',
  styleUrls: ['./vendas-list.css']
})
export class VendasListComponent implements OnInit {
  vendas: Venda[] = [];
  filtroAtivo: 'todas' | 'abertas' | 'finalizadas' = 'abertas';
  mensagemErro: string | null = null;
  mensagemSucesso: string | null = null;

  constructor(
    private vendaService: VendaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarVendas();
  }

  carregarVendas(): void {
    const observable = this.filtroAtivo === 'todas' 
      ? this.vendaService.getVendas()
      : this.filtroAtivo === 'abertas'
        ? this.vendaService.getVendasAbertas()
        : this.vendaService.getVendasFinalizadas();

    observable.subscribe({
      next: (vendas) => {
        this.vendas = vendas.sort((a, b) => b.id - a.id); // ordena por ID decrescente
        this.mensagemErro = null;
      },
      error: (err) => {
        this.mensagemErro = 'Erro ao carregar vendas';
        console.error(err);
      }
    });
  }

  alterarFiltro(filtro: 'todas' | 'abertas' | 'finalizadas'): void {
    this.filtroAtivo = filtro;
    this.carregarVendas();
  }

  novaVenda(): void {
    this.vendaService.criarVenda().subscribe({
      next: (venda) => this.router.navigate(['/vendas', venda.id]),
      error: (err) => {
        this.mensagemErro = 'Erro ao criar venda';
        console.error(err);
      }
    });
  }

  editarVenda(id: number): void {
    this.router.navigate(['/vendas', id]);
  }

  deletarVenda(id: number, event: Event): void {
    event.stopPropagation();
    
    if (!confirm('Deseja realmente cancelar esta venda? Os produtos serão devolvidos ao estoque.')) {
      return;
    }

    this.vendaService.deletarVenda(id).subscribe({
      next: () => {
        this.mensagemSucesso = 'Venda cancelada com sucesso!';
        setTimeout(() => this.mensagemSucesso = null, 3000);
        this.carregarVendas();
      },
      error: (err) => {
        this.mensagemErro = 'Erro ao cancelar venda';
        console.error(err);
      }
    });
  }
}