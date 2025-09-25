// src/app/produto/produto.spec.ts

import { TestBed } from '@angular/core/testing';

// 1. Importe a classe correta: ProdutoService
import { ProdutoService } from './produto.service';

// 2. Corrija o nome no 'describe'
describe('ProdutoService', () => {
  // 3. Corrija o tipo da variável
  let service: ProdutoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});2
    // 4. Corrija a classe que está sendo injetada
    service = TestBed.inject(ProdutoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});