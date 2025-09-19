// src/app/produto/produto-form/produto-form.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { ProdutoFormComponent } from './produto-form';

describe('ProdutoFormComponent', () => {
  let component: ProdutoFormComponent;
  let fixture: ComponentFixture<ProdutoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProdutoFormComponent,
        ReactiveFormsModule // Importa o módulo necessário para o formulário
      ],
      providers: [
        provideHttpClientTesting(), // Fornece um mock para requisições HTTP
        provideRouter([]) // Fornece um mock para o sistema de rotas
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdutoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});