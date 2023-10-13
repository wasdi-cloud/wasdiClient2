import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchOrbit } from './search-orbit.component';

describe('SearchOrbit', () => {
  let component: SearchOrbit;
  let fixture: ComponentFixture<SearchOrbit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchOrbit]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SearchOrbit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
