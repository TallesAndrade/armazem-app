import { Routes } from '@angular/router';
import { ProdutoListComponent } from './produto/produto-list/produto-list';
import { ProdutoFormComponent } from './produto/produto-form/produto-form';
import { EstoquePageComponent } from './estoque/estoque-page/estoque-page';
import { EstoqueFormComponent } from './estoque/estoque-form/estoque-form';
import { VendasListComponent } from './vendas/vendas-list/vendas-list';
import { VendasPageComponent } from './vendas/vendas-page/vendas-page';
import { LoginComponent } from './auth/login/login.component';
import { UserFormComponent } from './user/user-form/user-form.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { AdminGuard } from './auth/guards/admin.guard';

export const routes: Routes = [
  // ROTA PÚBLICA
  { path: 'login', component: LoginComponent },

  // --- ROTAS ADMIN (só admin) ---
  { 
    path: 'produtos/novo', 
    component: ProdutoFormComponent,
    canActivate: [AdminGuard]
  },
  { 
    path: 'produtos/editar/:id', 
    component: ProdutoFormComponent,
    canActivate: [AdminGuard]
  },
  { 
    path: 'estoque/ajustar/:id', 
    component: EstoqueFormComponent,
    canActivate: [AdminGuard]
  },
  { 
    path: 'users/novo', 
    component: UserFormComponent,
    canActivate: [AdminGuard]
  },

  // --- ROTAS PROTEGIDAS (qualquer usuário autenticado) ---
  { 
    path: 'produtos/ativos', 
    component: ProdutoListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'produtos/inativos', 
    component: ProdutoListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'produtos/todos', 
    component: ProdutoListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'produtos', 
    redirectTo: 'produtos/ativos', 
    pathMatch: 'full' 
  },

  { 
    path: 'estoque/ativos', 
    component: EstoquePageComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'estoque/inativos', 
    component: EstoquePageComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'estoque/todos', 
    component: EstoquePageComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'estoque', 
    redirectTo: 'estoque/ativos', 
    pathMatch: 'full' 
  },

  { 
    path: 'vendas', 
    component: VendasListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'vendas/:id', 
    component: VendasPageComponent,
    canActivate: [AuthGuard]
  },

  // ROTAS PADRÃO
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
