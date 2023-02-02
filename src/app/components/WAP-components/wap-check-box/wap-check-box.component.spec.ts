import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapCheckBoxComponent } from './wap-check-box.component';

describe('WapCheckBoxComponent', () => {
  let component: WapCheckBoxComponent;
  let fixture: ComponentFixture<WapCheckBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapCheckBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapCheckBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
