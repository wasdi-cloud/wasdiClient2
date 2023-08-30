import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailPreferencesDisplayComponent } from './email-preferences-display.component';

describe('EmailPreferencesDisplayComponent', () => {
  let component: EmailPreferencesDisplayComponent;
  let fixture: ComponentFixture<EmailPreferencesDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmailPreferencesDisplayComponent]
    });
    fixture = TestBed.createComponent(EmailPreferencesDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
