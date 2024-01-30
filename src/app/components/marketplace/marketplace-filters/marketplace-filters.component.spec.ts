import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceFiltersComponent } from './marketplace-filters.component';

describe('MarketplaceFiltersComponent', () => {
  let component: MarketplaceFiltersComponent;
  let fixture: ComponentFixture<MarketplaceFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketplaceFiltersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
