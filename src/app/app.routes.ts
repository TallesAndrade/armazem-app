// src/app/app.routes.ts

import { Routes } from '@angular/router';
// 1. Importe seus componentes
import { ProdutoListComponent } from './produto/produto-list/produto-list';
import { ProdutoFormComponent } from './produto/produto-form/produto-form';

// 2. Defina as rotas
export const routes: Routes = [
  // Quando a URL for a raiz ('/'), mostre a lista de produtos
  { path: '', component: ProdutoListComponent },

  // Quando a URL for '/produtos/novo', mostre o formulário
  { path: 'produtos/novo', component: ProdutoFormComponent }
];