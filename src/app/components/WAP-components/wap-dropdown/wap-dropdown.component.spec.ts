import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapDropdownComponent } from './wap-dropdown.component';

describe('WapDropdownComponent', () => {
  let component: WapDropdownComponent;
  let fixture: ComponentFixture<WapDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
