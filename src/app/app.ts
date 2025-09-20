import { Component } from '@angular/core';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainLayoutComponent], // Apenas o layout principal
  template: '<app-main-layout></app-main-layout>', // Carrega o layout
  styleUrls: ['./app.css']
})
export class App {
  title = 'armazem-app';
}