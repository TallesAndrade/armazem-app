// src/app/produto/produto-form/produto-form.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // 1. Verifique se ReactiveFormsModule está aqui
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProdutoService, ProdutoRequest } from '../produto';
import { UnidadeMedida } from '../produto.model';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // 2. E AQUI!
    RouterLink
  ],
  templateUrl: './produto-form.html',
  styleUrls: ['./produto-form.css']
})
export class ProdutoFormComponent {
  // O resto do código permanece o mesmo...
  produtoForm: FormGroup;
  unidadesMedida = Object.values(UnidadeMedida);
  mensagemSucesso: string | null = null;
  mensagemErro: string | null = null;

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private router: Router
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

  onSubmit(): void {
    if (this.produtoForm.invalid) {
      this.produtoForm.markAllAsTouched();
      return;
    }

    const request: ProdutoRequest = this.produtoForm.value;

    this.produtoService.createProduto(request).subscribe({
      next: () => {
        this.mensagemSucesso = 'Produto criado com sucesso! Redirecionando...';
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err) => {
        this.mensagemErro = 'Erro ao salvar o produto. Tente novamente.';
        console.error(err);
      }
    });
  }

  voltarParaLista(): void {
    this.router.navigate(['/']);
  }
}