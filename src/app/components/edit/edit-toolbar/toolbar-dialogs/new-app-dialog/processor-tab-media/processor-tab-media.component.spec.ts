import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessorTabMediaComponent } from './processor-tab-media.component';

describe('ProcessorTabMediaComponent', () => {
  let component: ProcessorTabMediaComponent;
  let fixture: ComponentFixture<ProcessorTabMediaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessorTabMediaComponent]
    });
    fixture = TestBed.createComponent(ProcessorTabMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
