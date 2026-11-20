import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { PayloadDialogComponent, parseProductTimeSeries } from './payload-dialog.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('PayloadDialogComponent', () => {
  const oChart = {
    'chart-type': 'line',
    'chart-name': 'Flood area',
    'x-axis-name': 'Date',
    'y-axis-name': 'Area',
    'chart-data': [{ name: '', series: [
      { name: '2026-10-09', value: 1.8957 },
      { name: '2026-10-03', value: 0 },
      { name: '2026-10-02', value: 0 }
    ] }]
  };
  let component: PayloadDialogComponent;
  let fixture: ComponentFixture<PayloadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [PayloadDialogComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [CommonModule, TranslateModule.forRoot()],
    providers: [
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(PayloadDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('prepares product observations on a real time scale without filling missing dates', () => {
    const oProductChart = parseProductTimeSeries(JSON.stringify(oChart));
    expect(oProductChart['chart-data'][0].series).toEqual([
      { name: new Date(2026, 9, 2), value: 0 },
      { name: new Date(2026, 9, 3), value: 0 },
      { name: new Date(2026, 9, 9), value: 1.8957 }
    ]);

    component.m_oProductChart = oProductChart;
    component.ngOnInit();
    expect(component.m_sActiveTab).toBe('dashboard');
    expect(component.m_aoChartsInformation).toEqual([oProductChart]);
    expect(component.m_bShowXAxisLabel).toBeFalse();
    expect(component.m_bShowYAxisLabel).toBeFalse();
  });

  it('rejects a product observation with an invalid timestamp', () => {
    const oInvalidChart = { ...oChart, 'chart-data': [{ name: '', series: [{ name: 'invalid', value: 0 }] }] };
    expect(() => parseProductTimeSeries(JSON.stringify(oInvalidChart))).toThrowError('Invalid observation timestamp');
  });

  it('scales the product chart to its values and shows date and time on the x axis', () => {
    const oTimestampChart = { ...oChart, 'chart-data': [{ name: '', series: [
      { name: '2026-11-19T11:00:00Z', value: 960 },
      { name: '2026-11-19T12:00:00Z', value: 970 }
    ] }] };
    component.m_oProductChart = parseProductTimeSeries(JSON.stringify(oTimestampChart));
    fixture.detectChanges();

    const oLineChart = fixture.debugElement.query(By.css('ngx-charts-line-chart')).nativeElement;
    expect(oLineChart.autoScale).toBeTrue();
    expect(oLineChart.trimXAxisTicks).toBeFalse();
    expect(oLineChart.xAxisTickFormatting(new Date(2026, 10, 19, 12, 5))).toBe('19/11/2026 12:05');
    expect(component.m_oProductChart['chart-data'][0].series[0].name.getTime())
      .toBe(new Date('2026-11-19T11:00:00Z').getTime());
  });

  it('leaves process dashboard labels as supplied', () => {
    component.m_oProcess = component.m_oData.process = {
      payload: JSON.stringify({ wasdi_dashboard: [oChart] }),
      status: 'DONE'
    };
    component.ngOnInit();
    expect(component.m_sActiveTab).toBe('dashboard');
    expect(component.m_aoChartsInformation).toEqual([oChart]);
    fixture.detectChanges();
    const oLineChart = fixture.debugElement.query(By.css('ngx-charts-line-chart')).nativeElement;
    expect(oLineChart.autoScale).toBeFalse();
    expect(oLineChart.trimXAxisTicks).toBeTrue();
    expect(oLineChart.xAxisTickFormatting).toBeUndefined();
  });
});
