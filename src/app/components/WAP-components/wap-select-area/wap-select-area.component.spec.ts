import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapSelectAreaComponent } from './wap-select-area.component';

describe('WapSelectAreaComponent', () => {
  let component: WapSelectAreaComponent;
  let fixture: ComponentFixture<WapSelectAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapSelectAreaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapSelectAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
