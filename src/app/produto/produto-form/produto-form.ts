import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ProdutoService, ProdutoRequest } from '../produto.service';
import { UnidadeMedida } from '../produto.model';
import { Produto } from '../produto.model';

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
  
  isEditMode = false;
  produtoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.produtoForm = this.fb.group({
      nome: ['', Validators.required],
      unidadeMedida: [null, Validators.required],
      precoKg: [null],
      precoUnidade: [null],
      dataValidade: ['', Validators.required],
      ehPesavel: [false] // Removido do template, mas mantido para compatibilidade
    });
  }

  ngOnInit(): void {
    // Verificamos se há um 'id' nos parâmetros da rota
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.produtoId = +params['id'];
        this.carregarDadosProduto(this.produtoId);
      }
    });

    // Escuta mudanças na unidade de medida para aplicar lógica reativa
    this.produtoForm.get('unidadeMedida')?.valueChanges.subscribe(unidade => {
      this.aplicarLogicaUnidadeMedida(unidade);
    });
  }

  aplicarLogicaUnidadeMedida(unidade: UnidadeMedida): void {
    if (!unidade) return;

    const precoKgControl = this.produtoForm.get('precoKg');
    const precoUnidadeControl = this.produtoForm.get('precoUnidade');
    const ehPesavelControl = this.produtoForm.get('ehPesavel');

    if (unidade === UnidadeMedida.GRAMA || unidade === UnidadeMedida.KILO) {
      // Produto pesável
      ehPesavelControl?.setValue(true);
      precoUnidadeControl?.setValue(0.0);
      precoUnidadeControl?.disable();
      precoKgControl?.enable();
      
      // Adiciona validação obrigatória para precoKg
      precoKgControl?.setValidators([Validators.required, Validators.min(0.01)]);
      precoUnidadeControl?.clearValidators();
    } else if (unidade === UnidadeMedida.UNIDADE) {
      // Produto por unidade
      ehPesavelControl?.setValue(false);
      precoKgControl?.setValue(0.0);
      precoKgControl?.disable();
      precoUnidadeControl?.enable();
      
      // Adiciona validação obrigatória para precoUnidade
      precoUnidadeControl?.setValidators([Validators.required, Validators.min(0.01)]);
      precoKgControl?.clearValidators();
    }

    // Atualiza as validações
    precoKgControl?.updateValueAndValidity();
    precoUnidadeControl?.updateValueAndValidity();
  }

  carregarDadosProduto(id: number): void {
    this.produtoService.getProdutoById(id).subscribe({
      next: (produto) => {
        const dataFormatada = new Date(produto.dataValidade).toISOString().split('T')[0];
        
        this.produtoForm.patchValue({
          ...produto,
          dataValidade: dataFormatada
        });

        // Aplica a lógica após carregar os dados
        this.aplicarLogicaUnidadeMedida(produto.unidadeMedida);
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

    // Prepara o request incluindo campos desabilitados
    const formValue = { ...this.produtoForm.value };
    
    // Inclui valores de campos desabilitados manualmente
    if (this.produtoForm.get('precoKg')?.disabled) {
      formValue.precoKg = this.produtoForm.get('precoKg')?.value;
    }
    if (this.produtoForm.get('precoUnidade')?.disabled) {
      formValue.precoUnidade = this.produtoForm.get('precoUnidade')?.value;
    }

    const request: ProdutoRequest = formValue;

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