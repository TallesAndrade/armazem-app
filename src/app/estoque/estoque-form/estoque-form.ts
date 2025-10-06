import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EstoqueService } from '../estoque.service';
import { Estoque, AlterarSaldoEstoqueRequest } from '../estoque.model';

@Component({
  selector: 'app-estoque-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './estoque-form.html',
  styleUrls: ['./estoque-form.css']
})
export class EstoqueFormComponent implements OnInit {
  estoqueForm: FormGroup;
  estoque: Estoque | null = null;
  estoqueId: number | null = null;
  mensagemErro: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private estoqueService: EstoqueService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.estoqueForm = this.fb.group({
      operacao: ['adicionar', Validators.required],
      quantidadeKg: [null],
      quantidadeUnidades: [null]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.estoqueId = +id;
      this.carregarEstoque();
    }

    // Validação condicional baseada na operação
    this.estoqueForm.get('operacao')?.valueChanges.subscribe(() => {
      this.atualizarValidacoes();
    });
  }

  carregarEstoque(): void {
    if (!this.estoqueId) return;

    this.estoqueService.getEstoqueById(this.estoqueId).subscribe({
      next: (estoque) => {
        this.estoque = estoque;
        this.atualizarValidacoes();
      },
      error: (err) => {
        this.mensagemErro = 'Não foi possível carregar o estoque.';
        console.error(err);
      }
    });
  }

  atualizarValidacoes(): void {
    const quantidadeKg = this.estoqueForm.get('quantidadeKg');
    const quantidadeUnidades = this.estoqueForm.get('quantidadeUnidades');

    quantidadeKg?.clearValidators();
    quantidadeUnidades?.clearValidators();

    if (this.estoque?.ehPesavel) {
      quantidadeKg?.setValidators([Validators.required, Validators.min(0.01)]);
    } else {
      quantidadeUnidades?.setValidators([Validators.required, Validators.min(1)]);
    }

    quantidadeKg?.updateValueAndValidity();
    quantidadeUnidades?.updateValueAndValidity();
  }

  salvar(): void {
    if (this.estoqueForm.invalid || !this.estoqueId) {
      this.mensagemErro = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.loading = true;
    const operacao = this.estoqueForm.get('operacao')?.value;
    const request: AlterarSaldoEstoqueRequest = {
      quantidadeKg: this.estoqueForm.get('quantidadeKg')?.value,
      quantidadeUnidades: this.estoqueForm.get('quantidadeUnidades')?.value
    };

    let observable;
    
    if (operacao === 'adicionar') {
      observable = this.estoqueService.adicionarQuantidade(this.estoqueId, request);
    } else if (operacao === 'remover') {
      observable = this.estoqueService.removerQuantidade(this.estoqueId, request);
    } else {
      observable = this.estoqueService.alterarQuantidadeMinima(this.estoqueId, request);
    }

    observable.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/estoque/ativos']);
      },
      error: (err) => {
        this.loading = false;
        this.mensagemErro = err.error?.message || 'Não foi possível processar a operação.';
        console.error(err);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/estoque/ativos']);
  }
}