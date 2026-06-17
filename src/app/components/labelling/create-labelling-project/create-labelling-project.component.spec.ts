import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLabellingProjectComponent } from './create-labelling-project.component';

describe('CreateLabellingProjectComponent', () => {
  let component: CreateLabellingProjectComponent;
  let fixture: ComponentFixture<CreateLabellingProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateLabellingProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateLabellingProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
