import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentEditorDialogComponent } from './comment-editor-dialog.component';

describe('CommentEditorDialogComponent', () => {
  let component: CommentEditorDialogComponent;
  let fixture: ComponentFixture<CommentEditorDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentEditorDialogComponent]
    });
    fixture = TestBed.createComponent(CommentEditorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
