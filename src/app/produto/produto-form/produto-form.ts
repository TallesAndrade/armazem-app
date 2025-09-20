// src/app/produto/produto-form/produto-form.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router'; // ActivatedRoute para ler a URL
import { CommonModule } from '@angular/common';

import { ProdutoService, ProdutoRequest } from '../produto';
import { UnidadeMedida } from '../produto.model';
import { Produto } from '../produto.model'; // Importamos o modelo completo

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './produto-form.html',
  styleUrls: ['./produto-form.css']
})
export class ProdutoFormComponent implements OnInit {

  produtoForm: FormGroup;
  unidadesMedida = Object.values(UnidadeMedida);
  mensagemSucesso: string | null = null;
  mensagemErro: string | null = null;
  
  isEditMode = false; // Flag para saber se estamos editando
  produtoId: number | null = null; // Para armazenar o ID do produto em edição

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private router: Router,
    private route: ActivatedRoute // Injetamos o ActivatedRoute
  ) {
    this.produtoForm = this.fb.group({
      nome: ['', Validators.required],
      unidadeMedida: [null, Validators.required],
      precoKg: [null],
      precoUnidade: [null],
      dataValidade: ['', Validators.required],
      ehPesavel: [false, Validators.required]
    });
  }

  ngOnInit(): void {
    // Verificamos se há um 'id' nos parâmetros da rota
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.produtoId = +params['id']; // O '+' converte a string para número
        this.carregarDadosProduto(this.produtoId);
      }
    });
  }

  carregarDadosProduto(id: number): void {
    this.produtoService.getProdutoById(id).subscribe({
      next: (produto) => {
        // Formata a data para o formato que o input[type=date] aceita (YYYY-MM-DD)
        const dataFormatada = new Date(produto.dataValidade).toISOString().split('T')[0];
        
        // Preenche o formulário com os dados do produto
        this.produtoForm.patchValue({
          ...produto,
          dataValidade: dataFormatada
        });
      },
      error: (err) => {
        this.mensagemErro = 'Erro ao carregar os dados do produto.';
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.produtoForm.invalid) {
      this.produtoForm.markAllAsTouched();
      return;
    }

    const request: ProdutoRequest = this.produtoForm.value;

    // Se estiver em modo de edição, chama o update, senão, o create
    if (this.isEditMode && this.produtoId) {
      this.produtoService.updateProduto(this.produtoId, request).subscribe({
        next: () => {
          this.mensagemSucesso = 'Produto atualizado com sucesso! Redirecionando...';
          setTimeout(() => this.router.navigate(['/']), 2000);
        },
        error: (err) => {
          this.mensagemErro = 'Erro ao atualizar o produto.';
          console.error(err);
        }
      });
    } else {
      this.produtoService.createProduto(request).subscribe({
        next: () => {
          this.mensagemSucesso = 'Produto criado com sucesso! Redirecionando...';
          setTimeout(() => this.router.navigate(['/']), 2000);
        },
        error: (err) => {
          this.mensagemErro = 'Erro ao salvar o produto.';
          console.error(err);
        }
      });
    }
  }

  voltarParaLista(): void {
    this.router.navigate(['/']);
  }
}