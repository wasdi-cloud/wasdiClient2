import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapListBoxComponent } from './wap-list-box.component';

describe('WapListBoxComponent', () => {
  let component: WapListBoxComponent;
  let fixture: ComponentFixture<WapListBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapListBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapListBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
