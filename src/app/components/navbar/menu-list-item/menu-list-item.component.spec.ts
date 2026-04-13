import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ConstantsService } from 'src/app/services/constants.service';
import { MenuListItemComponent } from './menu-list-item.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MenuListItemComponent', () => {
  let component: MenuListItemComponent;
  let fixture: ComponentFixture<MenuListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [MenuListItemComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [RouterTestingModule, TranslateModule.forRoot()],
    providers: [
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(null) }) } },
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatBottomSheetRef, useValue: { dismiss: () => { } } },
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}), snapshot: {} } },
        { provide: TranslateService, useValue: { get: () => of('label') } },
        { provide: ConstantsService, useValue: { m_oSkin$: of(null), getSkin: () => null } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(MenuListItemComponent);
    component = fixture.componentInstance;
    component.m_oMenuItemInfo = {
      name: 'home',
      routerLink: '/home',
      materialIcon: 'home',
      label: 'HOME'
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
