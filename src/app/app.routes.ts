import { Routes } from '@angular/router';
import { ProdutoListComponent } from './produto/produto-list/produto-list';
import { ProdutoFormComponent } from './produto/produto-form/produto-form';
import { EstoquePageComponent } from './estoque/estoque-page/estoque-page';
import { EstoqueFormComponent } from './estoque/estoque-form/estoque-form';
import { VendasListComponent } from './vendas/vendas-list/vendas-list';  // ← ADICIONAR
import { VendasPageComponent } from './vendas/vendas-page/vendas-page';

export const routes: Routes = [
  { path: '', redirectTo: 'produtos/ativos', pathMatch: 'full' },

  // --- ROTAS DE PRODUTOS ---
  { path: 'produtos/novo', component: ProdutoFormComponent },
  { path: 'produtos/editar/:id', component: ProdutoFormComponent },
  { path: 'produtos/ativos', component: ProdutoListComponent },
  { path: 'produtos/inativos', component: ProdutoListComponent },
  { path: 'produtos/todos', component: ProdutoListComponent },
  { path: 'produtos', redirectTo: 'produtos/ativos', pathMatch: 'full' },

  // --- ROTAS DE ESTOQUE ---
  { path: 'estoque/ajustar/:id', component: EstoqueFormComponent },
  { path: 'estoque/ativos', component: EstoquePageComponent },
  { path: 'estoque/inativos', component: EstoquePageComponent },
  { path: 'estoque/todos', component: EstoquePageComponent },
  { path: 'estoque', redirectTo: 'estoque/ativos', pathMatch: 'full' },
  
  // --- ROTAS DE VENDAS (MODIFICADO) ---
  { path: 'vendas', component: VendasListComponent },      // ← lista
  { path: 'vendas/:id', component: VendasPageComponent },  // ← edição
  
  // --- ROTA CURINGA ---
  { path: '**', redirectTo: '/produtos/ativos' }
];