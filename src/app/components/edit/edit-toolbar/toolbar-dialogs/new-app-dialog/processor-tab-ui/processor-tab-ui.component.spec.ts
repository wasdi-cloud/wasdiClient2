import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessorTabUiComponent } from './processor-tab-ui.component';

describe('ProcessorTabUiComponent', () => {
  let component: ProcessorTabUiComponent;
  let fixture: ComponentFixture<ProcessorTabUiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessorTabUiComponent]
    });
    fixture = TestBed.createComponent(ProcessorTabUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
