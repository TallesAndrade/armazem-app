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
  estoqueItem: Estoque | null = null;
  estoqueId: number | null = null;

  mensagemSucesso: string | null = null;
  mensagemErro: string | null = null;
  
  // Controla qual aba está ativa: 'adicionar' ou 'remover'
  modo: 'adicionar' | 'remover' = 'adicionar';

  constructor(
    private fb: FormBuilder,
    private estoqueService: EstoqueService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.ajusteForm = this.fb.group({
      quantidadeKg: [null, [Validators.min(0.01)]], // Mudança: min(0.01) em vez de min(0)
      quantidadeUnidades: [null, [Validators.min(1)]] // Mudança: min(1) em vez de min(0)
    });
  }

  ngOnInit(): void {
    // Pega o ID do estoque a partir da URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.estoqueId = +id;
      this.carregarDadosEstoque(this.estoqueId);
    } else {
      // Se não houver ID, volta para a lista
      this.voltarParaLista();
    }
  }

  carregarDadosEstoque(id: number): void {
    this.estoqueService.getEstoqueById(id).subscribe({
      next: (data) => {
        this.estoqueItem = data;
      },
      error: (err) => {
        console.error('Erro ao carregar item de estoque:', err);
        this.mensagemErro = 'Não foi possível carregar os dados do item.';
      }
    });
  }
  
  onSubmit(): void {
    if (this.ajusteForm.invalid || !this.estoqueId) {
      return;
    }

    const formValue = this.ajusteForm.value;
    const request: AlterarSaldoEstoqueRequest = {};

    // Validação melhorada: verifica se há valores válidos (> 0) antes de montar o request
    const quantidadeKgValida = formValue.quantidadeKg && formValue.quantidadeKg > 0;
    const quantidadeUnidadesValida = formValue.quantidadeUnidades && formValue.quantidadeUnidades > 0;

    // Monta o objeto de requisição apenas com os campos válidos
    if (quantidadeKgValida) {
      request.quantidadeKg = formValue.quantidadeKg;
    }
    if (quantidadeUnidadesValida) {
      request.quantidadeUnidades = formValue.quantidadeUnidades;
    }

    // Validação: se nenhum valor válido foi inserido
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
        setTimeout(() => this.voltarParaLista(), 2000);
      },
      error: (err) => {
        console.error('Erro ao ajustar saldo:', err);
        this.mensagemErro = err.error?.message || err.message || 'Erro ao ajustar saldo';
      }
    });
  }

  // Limpa mensagens de erro quando o usuário troca de aba
  onModoChange(): void {
    this.mensagemErro = null;
    this.mensagemSucesso = null;
  }

  // Navega de volta para a página de estoque
  voltarParaLista(): void {
    this.router.navigate(['/estoque']);
  }
}