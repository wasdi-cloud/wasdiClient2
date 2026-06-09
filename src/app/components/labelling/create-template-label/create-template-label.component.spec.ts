import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTemplateLabelComponent } from './create-template-label.component';

describe('CreateTemplateLabelComponent', () => {
  let component: CreateTemplateLabelComponent;
  let fixture: ComponentFixture<CreateTemplateLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTemplateLabelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTemplateLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
