import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessesBarComponent } from './processes-bar.component';

describe('ProcessesBarComponent', () => {
  let component: ProcessesBarComponent;
  let fixture: ComponentFixture<ProcessesBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessesBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessesBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
