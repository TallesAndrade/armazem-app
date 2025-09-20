import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendasPage } from './vendas-page';

describe('VendasPage', () => {
  let component: VendasPage;
  let fixture: ComponentFixture<VendasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendasPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
