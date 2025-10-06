import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdutoService } from '../produto.service';
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
      precoKg: [0, [Validators.min(0)]],
      precoUnidade: [0, [Validators.min(0)]],
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

    // Validação condicional baseada em ehPesavel
    this.produtoForm.get('ehPesavel')?.valueChanges.subscribe(ehPesavel => {
      this.atualizarValidacoes(ehPesavel);
    });
  }

  atualizarValidacoes(ehPesavel: boolean): void {
    const precoKg = this.produtoForm.get('precoKg');
    const precoUnidade = this.produtoForm.get('precoUnidade');

    if (ehPesavel) {
      precoKg?.setValidators([Validators.required, Validators.min(0.01)]);
      precoUnidade?.clearValidators();
      precoUnidade?.setValue(0);
    } else {
      precoUnidade?.setValidators([Validators.required, Validators.min(0.01)]);
      precoKg?.clearValidators();
      precoKg?.setValue(0);
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
    const request: Produto = this.produtoForm.value;

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