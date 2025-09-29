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
  ajusteForm: FormGroup;
  quantidadeMinimaForm: FormGroup;
  estoqueItem: Estoque | null = null;
  estoqueId: number | null = null;

  mensagemSucesso: string | null = null;
  mensagemErro: string | null = null;
  
  // Controla qual aba está ativa: 'adicionar', 'remover' ou 'minimo'
  modo: 'adicionar' | 'remover' | 'minimo' = 'adicionar';

  constructor(
    private fb: FormBuilder,
    private estoqueService: EstoqueService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.ajusteForm = this.fb.group({
      quantidadeKg: [null, [Validators.min(0.01)]],
      quantidadeUnidades: [null, [Validators.min(1)]]
    });

    this.quantidadeMinimaForm = this.fb.group({
      quantidadeMinima: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.estoqueId = +id;
      this.carregarDadosEstoque(this.estoqueId);
    } else {
      this.voltarParaLista();
    }
  }

  carregarDadosEstoque(id: number): void {
    this.estoqueService.getEstoqueById(id).subscribe({
      next: (data) => {
        this.estoqueItem = data;
        // Preenche o form de quantidade mínima com o valor atual
        this.quantidadeMinimaForm.patchValue({
          quantidadeMinima: data.quantidadeMinima || 0
        });
      },
      error: (err) => {
        console.error('Erro ao carregar item de estoque:', err);
        this.mensagemErro = this.extrairMensagemErro(err);
      }
    });
  }
  
  onSubmit(): void {
    if (this.modo === 'minimo') {
      this.atualizarQuantidadeMinima();
      return;
    }

    if (this.ajusteForm.invalid || !this.estoqueId) {
      return;
    }

    const formValue = this.ajusteForm.value;
    const request: AlterarSaldoEstoqueRequest = {};

    const quantidadeKgValida = formValue.quantidadeKg && formValue.quantidadeKg > 0;
    const quantidadeUnidadesValida = formValue.quantidadeUnidades && formValue.quantidadeUnidades > 0;

    if (quantidadeKgValida) {
      request.quantidadeKg = formValue.quantidadeKg;
    }
    if (quantidadeUnidadesValida) {
      request.quantidadeUnidades = formValue.quantidadeUnidades;
    }

    if (!quantidadeKgValida && !quantidadeUnidadesValida) {
        this.mensagemErro = "Informe uma quantidade maior que zero para adicionar ou remover.";
        return;
    }

    const operacao = this.modo === 'adicionar' 
      ? this.estoqueService.adicionarQuantidade(this.estoqueId, request)
      : this.estoqueService.removerQuantidade(this.estoqueId, request);
      
    operacao.subscribe({
      next: () => {
        this.mensagemSucesso = `Saldo do produto "${this.estoqueItem?.produtoNome}" atualizado com sucesso!`;
        this.ajusteForm.reset();
        this.carregarDadosEstoque(this.estoqueId!); // Atualiza os dados
        setTimeout(() => this.mensagemSucesso = null, 3000);
      },
      error: (err) => {
        console.error('Erro ao ajustar saldo:', err);
        this.mensagemErro = this.extrairMensagemErro(err);
      }
    });
  }

  atualizarQuantidadeMinima(): void {
    if (this.quantidadeMinimaForm.invalid || !this.estoqueId) {
      return;
    }

    const quantidadeMinima = this.quantidadeMinimaForm.value.quantidadeMinima;
    const request: AlterarSaldoEstoqueRequest = {};

    // Define qual campo usar baseado no tipo do produto
    if (this.estoqueItem?.ehPesavel) {
      request.quantidadeKg = quantidadeMinima;
    } else {
      request.quantidadeUnidades = Math.floor(quantidadeMinima); // Garante que seja inteiro para unidades
    }

    this.estoqueService.alterarQuantidadeMinima(this.estoqueId, request).subscribe({
      next: () => {
        this.mensagemSucesso = `Quantidade mínima do produto "${this.estoqueItem?.produtoNome}" atualizada com sucesso!`;
        this.carregarDadosEstoque(this.estoqueId!);
        setTimeout(() => this.mensagemSucesso = null, 3000);
      },
      error: (err) => {
        console.error('Erro ao atualizar quantidade mínima:', err);
        this.mensagemErro = this.extrairMensagemErro(err);
      }
    });
  }

  // Extrai mensagem de erro da resposta da API
  private extrairMensagemErro(err: any): string {
    if (err.error?.message) {
      return err.error.message;
    } else if (err.message) {
      return err.message;
    } else if (err.error?.error) {
      return `Erro ${err.error.status}: ${err.error.error}`;
    }
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  onModoChange(): void {
    this.mensagemErro = null;
    this.mensagemSucesso = null;
    this.ajusteForm.reset();
  }

  voltarParaLista(): void {
    this.router.navigate(['/estoque']);
  }
}