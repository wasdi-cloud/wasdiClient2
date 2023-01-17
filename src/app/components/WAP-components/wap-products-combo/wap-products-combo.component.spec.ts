import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapProductsComboComponent } from './wap-products-combo.component';

describe('WapProductsComboComponent', () => {
  let component: WapProductsComboComponent;
  let fixture: ComponentFixture<WapProductsComboComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapProductsComboComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapProductsComboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
