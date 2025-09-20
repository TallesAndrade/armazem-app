import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout';
import { ProdutoListComponent } from './produto/produto-list/produto-list';
import { ProdutoFormComponent } from './produto/produto-form/produto-form';
import { EstoquePageComponent } from './estoque/estoque-page/estoque-page';
import { VendasPageComponent } from './vendas/vendas-page/vendas-page';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent, // O layout principal é a base
    children: [
      // Redireciona a rota raiz para a lista de produtos ativos
      { path: '', redirectTo: 'produtos/ativos', pathMatch: 'full' },
      
      // Rotas de Produtos com sub-rotas para os filtros
      { 
        path: 'produtos', 
        children: [
          { path: '', redirectTo: 'ativos', pathMatch: 'full' }, // /produtos -> /produtos/ativos
          { path: ':filter', component: ProdutoListComponent } // /produtos/ativos, /produtos/inativos, etc.
        ]
      },
      // Rotas para criar e editar, fora do fluxo de filtro
      { path: 'produtos/novo', component: ProdutoFormComponent },
      { path: 'produtos/editar/:id', component: ProdutoFormComponent },
      
      // Rotas para as outras seções
      { path: 'estoque', component: EstoquePageComponent },
      { path: 'vendas', component: VendasPageComponent }
    ]
  },
  // Rota curinga para redirecionar para a página inicial caso a URL não exista
  { path: '**', redirectTo: '' }
];