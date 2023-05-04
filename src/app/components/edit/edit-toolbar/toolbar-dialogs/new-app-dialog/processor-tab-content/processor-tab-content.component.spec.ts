import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessorTabContentComponent } from './processor-tab-content.component';

describe('ProcessorTabContentComponent', () => {
  let component: ProcessorTabContentComponent;
  let fixture: ComponentFixture<ProcessorTabContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessorTabContentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessorTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
