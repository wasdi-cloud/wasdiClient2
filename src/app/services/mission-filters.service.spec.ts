import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { MissionFiltersService } from './mission-filters.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MissionFiltersService', () => {
  let service: MissionFiltersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule, TranslateModule.forRoot()],
    providers: [
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(null) }) } },
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatBottomSheetRef, useValue: { dismiss: () => { } } },
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}), snapshot: {} } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(MissionFiltersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('adds valid custom key-value filters only when the mission allows them', () => {
    const mission = {
      name: 'CDS',
      indexname: 'platformname',
      indexvalue: 'CDS',
      allowCustomFilters: true,
      filters: [{
        indexname: 'dataset',
        indexvalue: 'A'
      }]
    };

    service.setAdvancedFilter(mission, [
      { key: 'variable', value: 'air temperature' },
      { key: 'invalid key', value: 'ignored' },
      { key: 'unused', value: '  ' }
    ]);

    expect(service.getAdvancedFilter()).toContain('dataset:A');
    expect(service.getAdvancedFilter()).toContain('variable:"air temperature"');
    expect(service.getAdvancedFilter()).not.toContain('invalid key');
    expect(service.getAdvancedFilter()).not.toContain('unused');
  });

  it('escapes query syntax in custom values', () => {
    const mission = {
      name: 'CDS',
      indexname: 'platformname',
      indexvalue: 'CDS',
      allowCustomFilters: true,
      filters: []
    };

    service.setAdvancedFilter(mission, [{ key: 'title', value: 'a" OR *' }]);

    expect(service.getAdvancedFilter()).toContain('title:"a\\" OR \\*"');
  });

  it('does not include custom filters when the mission does not allow them', () => {
    const mission = {
      name: 'Other',
      indexname: 'platformname',
      indexvalue: 'OTHER',
      filters: []
    };

    service.setAdvancedFilter(mission, [{ key: 'variable', value: 'temperature' }]);

    expect(service.getAdvancedFilter()).not.toContain('variable');
  });
});
