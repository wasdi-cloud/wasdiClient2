import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchOrbitResourcesComponent } from './search-orbit-resources.component';

describe('SearchOrbitResourcesComponent', () => {
  let component: SearchOrbitResourcesComponent;
  let fixture: ComponentFixture<SearchOrbitResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchOrbitResourcesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchOrbitResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
