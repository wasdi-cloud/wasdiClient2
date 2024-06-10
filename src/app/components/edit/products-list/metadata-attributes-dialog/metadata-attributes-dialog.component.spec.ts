import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataAttributesDialogComponent } from './metadata-attributes-dialog.component';

describe('MetadataAttributesDialogComponent', () => {
  let component: MetadataAttributesDialogComponent;
  let fixture: ComponentFixture<MetadataAttributesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetadataAttributesDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetadataAttributesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
