import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VendaService } from '../venda.service';
import { ProdutoService } from '../../produto/produto.service';
import { Venda, AdicionarItemVendaRequest,StatusVenda } from '../venda.model';
import { Produto, UnidadeMedida } from '../../produto/produto.model';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-vendas-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vendas-page.html',
  styleUrl: './vendas-page.css'
})
export class VendasPageComponent implements OnInit {
  vendaAtual: Venda | null = null;
  produtosFiltrados$: Observable<Produto[]> = of([]);
  produtoSelecionado: Produto | null = null;
  mostrarListaAutoComplete: boolean = true;
  vendaFinalizada: boolean = false;
  
  itemForm: FormGroup;
  mensagemErro: string | null = null;
  mensagemSucesso: string | null = null;

  constructor(
    private vendaService: VendaService,
    private produtoService: ProdutoService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      produtoId: [null, Validators.required],
      quantidade: [null, [Validators.required, Validators.min(0.01)]],
      unidadeMedida: [null, Validators.required],
      termoBusca: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.carregarVenda(+id);
    }
    
    this.itemForm.get('quantidade')?.disable();
    this.itemForm.get('unidadeMedida')?.disable();
    
    this.produtosFiltrados$ = this.itemForm.get('termoBusca')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.trim() === '') {
          return of([]);
        }
        return this.produtoService.searchProdutosAtivos(term);
      }),
      catchError(err => {
        this.handleError(err, 'buscar produtos');
        return of([]);
      })
    );
  }

  carregarVenda(id: number): void {
    this.vendaService.getVendaById(id).subscribe({
      next: (venda) => {
        this.vendaAtual = venda;
        this.vendaFinalizada = venda.status === StatusVenda.FINALIZADA;  // ← ADICIONAR
      },
      error: (err) => this.handleError(err, 'carregar venda')
    });
  }

  selecionarProduto(produto: Produto): void {
    this.produtoSelecionado = produto;
    this.mostrarListaAutoComplete = false;
    this.itemForm.patchValue({
      produtoId: produto.id,
      termoBusca: produto.nome,
      unidadeMedida: produto.ehPesavel ? 'KILO' : 'UNIDADE'
    });
    
    this.itemForm.get('quantidade')?.enable();
    this.itemForm.get('unidadeMedida')?.enable();
  }

  adicionarItem(): void {
    if (this.itemForm.invalid || !this.vendaAtual) {
      this.mensagemErro = "Por favor, preencha todos os campos do item.";
      return;
    }

    const form = this.itemForm.value;
    const produtoSelecionado = this.itemForm.get('termoBusca')?.value;
    
    if (!form.produtoId || !produtoSelecionado) {
        this.mensagemErro = 'Selecione um produto válido da lista.';
        return;
    }

    const request: AdicionarItemVendaRequest = {
      produtoId: form.produtoId,
      unidadeMedida: form.unidadeMedida,
    };

    if (form.unidadeMedida === UnidadeMedida.UNIDADE) {
      request.quantidadeUnidades = form.quantidade;
    } else if (form.unidadeMedida === UnidadeMedida.GRAMA) {
      request.quantidadeKg = form.quantidade / 1000;
    } else {
      request.quantidadeKg = form.quantidade;
    }

    this.vendaService.adicionarProduto(this.vendaAtual.id, request).subscribe({
      next: (venda) => {
        this.vendaAtual = venda;
        this.handleSuccess('Produto adicionado com sucesso!');
        this.limparFormulario();
      },
      error: (err) => this.handleError(err, 'adicionar produto')
    });
  }

  removerItem(produtoVendaId: number): void {
    if (!this.vendaAtual || !confirm('Deseja remover este item da venda?')) {
      return;
    }

    this.vendaService.removerProduto(this.vendaAtual.id, produtoVendaId).subscribe({
      next: (venda) => {
        this.vendaAtual = venda;
        this.handleSuccess('Item removido com sucesso!');
      },
      error: (err) => this.handleError(err, 'remover item')
    });
  }

  finalizarVenda(): void {
    if (!this.vendaAtual || !confirm('Deseja finalizar esta venda?')) {
      return;
    }

    this.vendaService.finalizarVenda(this.vendaAtual.id).subscribe({
      next: () => {
        this.handleSuccess('Venda finalizada com sucesso!');
        setTimeout(() => this.router.navigate(['/vendas']), 2000);
      },
      error: (err) => this.handleError(err, 'finalizar venda')
    });
  }

  voltarParaLista(): void {
    this.router.navigate(['/vendas']);
  }

  private limparFormulario(): void {
    this.produtoSelecionado = null;
    this.mostrarListaAutoComplete = true;
    this.itemForm.patchValue({
      produtoId: null,
      quantidade: null,
      unidadeMedida: null,
      termoBusca: ''
    });
    this.itemForm.get('quantidade')?.disable();
    this.itemForm.get('unidadeMedida')?.disable();
  }
  
  private resetarMensagens() {
    this.mensagemErro = null;
    this.mensagemSucesso = null;
  }

  private handleSuccess(mensagem: string): void {
    this.resetarMensagens();
    this.mensagemSucesso = mensagem;
    setTimeout(() => this.mensagemSucesso = null, 3000);
  }

  private handleError(err: any, acao: string): void {
    this.resetarMensagens();
    let mensagem: string;
    
    if (err.error?.message) {
      mensagem = err.error.message;
    } else {
      mensagem = `Não foi possível ${acao}. Tente novamente.`;
    }
    
    this.mensagemErro = mensagem;
    console.error(`Erro ao ${acao}:`, err);
  }
}