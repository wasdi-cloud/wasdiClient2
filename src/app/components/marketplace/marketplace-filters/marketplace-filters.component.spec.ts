import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AuthService } from 'src/app/auth/service/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { FilterPipe } from 'src/app/shared/pipes/filter.pipe';
import { MarketplaceFiltersComponent } from './marketplace-filters.component';

describe('MarketplaceFiltersComponent', () => {
  let component: MarketplaceFiltersComponent;
  let fixture: ComponentFixture<MarketplaceFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketplaceFiltersComponent, FilterPipe ],
      imports: [HttpClientTestingModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(null) }) } },
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatBottomSheetRef, useValue: { dismiss: () => {} } },
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}), snapshot: {} } },
        { provide: AuthService, useValue: { getTokenObject: () => ({ access_token: null }) } },
        { provide: ConstantsService, useValue: { getUser: () => ({ userId: null }) } },
        { provide: NotificationDisplayService, useValue: { openAlertDialog: () => {} } },
        { provide: ProcessorMediaService, useValue: { getCategories: () => of([]), getPublishersFilterList: () => of([]) } },
        { provide: ProcessorService, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceFiltersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
