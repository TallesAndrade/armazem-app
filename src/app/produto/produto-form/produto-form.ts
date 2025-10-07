import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdutoService, ProdutoRequest } from '../produto.service';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './produto-form.html',
  styleUrls: ['./produto-form.css']
})
export class ProdutoFormComponent implements OnInit {
  produtoForm: FormGroup;
  isEditMode: boolean = false;
  produtoId: number | null = null;
  mensagemErro: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.produtoForm = this.fb.group({
      nome: ['', Validators.required],
      unidadeMedida: ['', Validators.required],
      precoKg: [0],
      precoUnidade: [0],
      dataValidade: ['', Validators.required],
      ehPesavel: [false]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.isEditMode = true;
      this.produtoId = +id;
      this.carregarProduto();
    }

    // Reage à mudança da unidade de medida
    this.produtoForm.get('unidadeMedida')?.valueChanges.subscribe(unidade => {
      this.atualizarValidacoes(unidade);
    });
  }

  atualizarValidacoes(unidadeMedida: string): void {
    const precoKg = this.produtoForm.get('precoKg');
    const precoUnidade = this.produtoForm.get('precoUnidade');
    const ehPesavel = this.produtoForm.get('ehPesavel');

    // Limpa validações
    precoKg?.clearValidators();
    precoUnidade?.clearValidators();

    if (unidadeMedida === 'KILO') {
      // Produto pesável
      precoKg?.setValidators([Validators.required, Validators.min(0.01)]);
      precoUnidade?.setValue(0);
      ehPesavel?.setValue(true);
    } else if (unidadeMedida === 'UNIDADE') {
      // Produto por unidade
      precoUnidade?.setValidators([Validators.required, Validators.min(0.01)]);
      precoKg?.setValue(0);
      ehPesavel?.setValue(false);
    } else {
      // Nenhuma unidade selecionada
      precoKg?.setValue(0);
      precoUnidade?.setValue(0);
      ehPesavel?.setValue(false);
    }

    precoKg?.updateValueAndValidity();
    precoUnidade?.updateValueAndValidity();
  }

  carregarProduto(): void {
    if (!this.produtoId) return;

    this.produtoService.getProdutoById(this.produtoId).subscribe({
      next: (produto) => {
        this.produtoForm.patchValue({
          nome: produto.nome,
          unidadeMedida: produto.unidadeMedida,
          precoKg: produto.precoKg,
          precoUnidade: produto.precoUnidade,
          dataValidade: produto.dataValidade,
          ehPesavel: produto.ehPesavel
        });
      },
      error: (err) => {
        this.mensagemErro = 'Não foi possível carregar o produto.';
        console.error(err);
      }
    });
  }

  salvar(): void {
    if (this.produtoForm.invalid) {
      this.mensagemErro = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.loading = true;
    const formValue = this.produtoForm.value;

    const request: ProdutoRequest = {
      nome: formValue.nome,
      unidadeMedida: formValue.unidadeMedida,
      precoKg: formValue.precoKg || null,
      precoUnidade: formValue.precoUnidade || null,
      dataValidade: formValue.dataValidade,
      ehPesavel: formValue.ehPesavel
    };

    const observable = this.isEditMode && this.produtoId
      ? this.produtoService.updateProduto(this.produtoId, request)
      : this.produtoService.createProduto(request);

    observable.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/produtos/ativos']);
      },
      error: (err) => {
        this.loading = false;
        this.mensagemErro = err.error?.message || 'Não foi possível salvar o produto.';
        console.error(err);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/produtos/ativos']);
  }
}