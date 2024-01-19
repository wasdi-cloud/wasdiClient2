import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBtnGrpComponent } from './search-btn-grp.component';

describe('SearchBtnGrpComponent', () => {
  let component: SearchBtnGrpComponent;
  let fixture: ComponentFixture<SearchBtnGrpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchBtnGrpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchBtnGrpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
