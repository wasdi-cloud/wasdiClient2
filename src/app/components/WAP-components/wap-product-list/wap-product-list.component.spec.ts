import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapProductListComponent } from './wap-product-list.component';

describe('WapProductListComponent', () => {
  let component: WapProductListComponent;
  let fixture: ComponentFixture<WapProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapProductListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
