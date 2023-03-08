import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPropertiesDialogComponent } from './product-properties-dialog.component';

describe('ProductPropertiesDialogComponent', () => {
  let component: ProductPropertiesDialogComponent;
  let fixture: ComponentFixture<ProductPropertiesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductPropertiesDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductPropertiesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
