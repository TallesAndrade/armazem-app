import { Routes } from '@angular/router';
import { ProdutoListComponent } from './produto/produto-list/produto-list';
import { ProdutoFormComponent } from './produto/produto-form/produto-form';
import { EstoquePageComponent } from './estoque/estoque-page/estoque-page';
import { VendasPageComponent } from './vendas/vendas-page/vendas-page';

export const routes: Routes = [
  // Redireciona a rota raiz para produtos ativos
  { path: '', redirectTo: 'produtos/ativos', pathMatch: 'full' },
  
  // Rotas específicas primeiro
  { path: 'produtos/novo', component: ProdutoFormComponent },
  { path: 'produtos/editar/:id', component: ProdutoFormComponent },
  
  // Rotas de filtros de produtos
  { path: 'produtos/ativos', component: ProdutoListComponent },
  { path: 'produtos/inativos', component: ProdutoListComponent },
  { path: 'produtos/todos', component: ProdutoListComponent },
  
  // Redirecionamento padrão para produtos
  { path: 'produtos', redirectTo: 'produtos/ativos', pathMatch: 'full' },
  
  // Outras seções
  { path: 'estoque', component: EstoquePageComponent },
  { path: 'vendas', component: VendasPageComponent },
  
  // Rota curinga
  { path: '**', redirectTo: '' }
];