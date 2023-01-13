import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceAppCardComponent } from './marketplace-app-card.component';

describe('MarketplaceAppCardComponent', () => {
  let component: MarketplaceAppCardComponent;
  let fixture: ComponentFixture<MarketplaceAppCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketplaceAppCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceAppCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
