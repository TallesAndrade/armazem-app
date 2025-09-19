
export enum UnidadeMedida {
  GRAMA = 'GRAMA',
  KILO = 'KILO',
  UNIDADE = 'UNIDADE'
}

export interface Produto {
  id: number;
  nome: string;
  unidadeMedida: UnidadeMedida;
  precoKg: number | null;
  precoUnidade: number | null;
  dataValidade: string; 
  ehPesavel: boolean;
  ativo: boolean;
}