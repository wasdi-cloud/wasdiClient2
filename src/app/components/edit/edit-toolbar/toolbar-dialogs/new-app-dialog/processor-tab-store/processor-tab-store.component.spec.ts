import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessorTabStoreComponent } from './processor-tab-store.component';

describe('ProcessorTabStoreComponent', () => {
  let component: ProcessorTabStoreComponent;
  let fixture: ComponentFixture<ProcessorTabStoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessorTabStoreComponent]
    });
    fixture = TestBed.createComponent(ProcessorTabStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
