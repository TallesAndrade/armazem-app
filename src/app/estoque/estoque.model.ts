import { Produto } from "../produto/produto.model";

export interface Estoque {
  id: number;
  produtoId: number;
  produtoNome: string;
  quantidadeKg: number | null;
  quantidadeUnidades: number | null;
  quantidadeMinima: number | null;
  ehPesavel: boolean;
  ativo: boolean;  
}

export interface AlterarSaldoEstoqueRequest {
  quantidadeKg?: number | null; 
  quantidadeUnidades?: number | null;
}