
import { Component, OnInit } from '@angular/core';
import { ProdutoService } from '../produto';
import { Produto } from '../produto.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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

  constructor(private produtoService: ProdutoService) { }

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.produtoService.getProductos().subscribe({
      next: (dados) => {
        this.produtos = dados;
        this.mensagemErro = null;
      },
      error: (erro) => {
        console.error('Erro ao buscar produtos:', erro);
        this.mensagemErro = 'Não foi possível carregar os produtos. Verifique se a API está em execução.';
      }
    });
  }
}