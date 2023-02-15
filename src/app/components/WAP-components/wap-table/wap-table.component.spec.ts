import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapTableComponent } from './wap-table.component';

describe('WapTableComponent', () => {
  let component: WapTableComponent;
  let fixture: ComponentFixture<WapTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
