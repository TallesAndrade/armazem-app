import { UnidadeMedida } from "../produto/produto.model";

export enum StatusVenda {
  ABERTA = 'ABERTA',
  FINALIZADA = 'FINALIZADA'
}

export interface ProdutoVenda {
  id: number;
  produtoId: number;
  nomeProduto: string;
  unidadeMedida: UnidadeMedida;
  quantidadeKg?: number;
  quantidadeUnidades?: number;
  precoUnitario: number;
  precoTotal: number;
}

export interface Venda {
  id: number;
  produtosVenda: ProdutoVenda[];
  dataVenda: string;
  valorTotal: number;
  status: StatusVenda;  // ← ADICIONAR
}

export interface AdicionarItemVendaRequest {
  produtoId: number;
  unidadeMedida: UnidadeMedida;
  quantidadeKg?: number;
  quantidadeUnidades?: number;
}