import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginCoplacComponent } from './login-coplac.component';

describe('LoginCoplacComponent', () => {
  let component: LoginCoplacComponent;
  let fixture: ComponentFixture<LoginCoplacComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginCoplacComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginCoplacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
