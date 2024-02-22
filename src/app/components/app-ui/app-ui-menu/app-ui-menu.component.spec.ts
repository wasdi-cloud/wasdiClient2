import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUiMenuComponent } from './app-ui-menu.component';

describe('AppUiMenuComponent', () => {
  let component: AppUiMenuComponent;
  let fixture: ComponentFixture<AppUiMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppUiMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppUiMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
