import { Routes } from '@angular/router';
import { ProdutoListComponent } from './produto/produto-list/produto-list';
import { ProdutoFormComponent } from './produto/produto-form/produto-form';
import { EstoquePageComponent } from './estoque/estoque-page/estoque-page';
import { VendasPageComponent } from './vendas/vendas-page/vendas-page';
import { EstoqueFormComponent } from './estoque/estoque-form/estoque-form';

export const routes: Routes = [
  // Redirecionamento da rota raiz para a página inicial padrão
  { path: '', redirectTo: 'produtos/ativos', pathMatch: 'full' },

  // --- ROTAS DE PRODUTOS ---
  { path: 'produtos/novo', component: ProdutoFormComponent },
  { path: 'produtos/editar/:id', component: ProdutoFormComponent },
  { path: 'produtos/ativos', component: ProdutoListComponent },
  { path: 'produtos/inativos', component: ProdutoListComponent },
  { path: 'produtos/todos', component: ProdutoListComponent },
  { path: 'produtos', redirectTo: 'produtos/ativos', pathMatch: 'full' },

  // --- ROTAS DE ESTOQUE (replicando o padrão de produtos) ---
  { path: 'estoque/ajustar/:id', component: EstoqueFormComponent },
  { path: 'estoque/ativos', component: EstoquePageComponent },
  { path: 'estoque/inativos', component: EstoquePageComponent },
  { path: 'estoque/todos', component: EstoquePageComponent },
  { path: 'estoque', redirectTo: 'estoque/ativos', pathMatch: 'full' },
  
  // --- ROTAS DE VENDAS ---
  { path: 'vendas', component: VendasPageComponent },
  
  // --- ROTA CURINGA ---
  // Redireciona qualquer URL não encontrada
  { path: '**', redirectTo: '' }
];