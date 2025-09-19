import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProdutoListComponent } from './produto/produto-list/produto-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,ProdutoListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('armazem-app');
}
