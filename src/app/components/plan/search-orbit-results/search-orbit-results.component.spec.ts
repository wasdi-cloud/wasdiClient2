import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchOrbitResultsComponent } from './search-orbit-results.component';

describe('SearchOrbitResultsComponent', () => {
  let component: SearchOrbitResultsComponent;
  let fixture: ComponentFixture<SearchOrbitResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchOrbitResultsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchOrbitResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
