import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapSearchEoImageComponent } from './wap-search-eo-image.component';

describe('WapSearchEoImageComponent', () => {
  let component: WapSearchEoImageComponent;
  let fixture: ComponentFixture<WapSearchEoImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapSearchEoImageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapSearchEoImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
