import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvaderComponent } from './invader.component';

describe('InvaderComponent', () => {
  let component: InvaderComponent;
  let fixture: ComponentFixture<InvaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
