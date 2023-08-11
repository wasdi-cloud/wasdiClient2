import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionProjectsDialogComponent } from './subscription-projects-dialog.component';

describe('SubscriptionProjectsDialogComponent', () => {
  let component: SubscriptionProjectsDialogComponent;
  let fixture: ComponentFixture<SubscriptionProjectsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriptionProjectsDialogComponent]
    });
    fixture = TestBed.createComponent(SubscriptionProjectsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
