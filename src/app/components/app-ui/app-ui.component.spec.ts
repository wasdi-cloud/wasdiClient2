import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUiComponent } from './app-ui.component';

xdescribe('AppUiComponent', () => {
  let component: AppUiComponent;
  let fixture: ComponentFixture<AppUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppUiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
