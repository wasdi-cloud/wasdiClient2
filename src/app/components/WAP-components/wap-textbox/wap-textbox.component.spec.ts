import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapTextboxComponent } from './wap-textbox.component';

describe('WapTextboxComponent', () => {
  let component: WapTextboxComponent;
  let fixture: ComponentFixture<WapTextboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapTextboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapTextboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
