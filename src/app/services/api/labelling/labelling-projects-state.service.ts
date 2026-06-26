import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from "rxjs";

export type LabellingProjectMode = 'create' | 'view' | 'edit';
@Injectable({
  providedIn: 'root',
})
export class LabellingProjectsStateService {
  m_sLabellingProjectId: string | null = null;
  m_sLabellingProjectName: string | null = null;
  m_sMode: 'create' | 'view' | 'edit' = 'create';

  // NEW: Tracks the project currently open for the "Labels" workspace
  m_sActiveProjectId: string | null = null;
  private _m_sTargetWorkspaceId: string | null = null;

  // ── Track the currently selected image ──
  private m_oActiveImageSubject = new BehaviorSubject<string | null>(null);
  public m_oActiveImage$ = this.m_oActiveImageSubject.asObservable();

  // Emits whenever a labelling project workspace is opened/closed.
  private m_oProjectWorkspaceChangedSubject = new Subject<void>();
  public m_oProjectWorkspaceChanged$ = this.m_oProjectWorkspaceChangedSubject.asObservable();

  get projectId(): string | null {
    return this.m_sLabellingProjectId;
  }


  get mode(): 'create' | 'view' | 'edit' {
    return this.m_sMode;
  }


  getTargetWorkspaceId(): string | null {
    return this._m_sTargetWorkspaceId;
  }

  setTargetWorkspaceId(value: string | null) {
    this._m_sTargetWorkspaceId = value;
  }

  setState(sProjectId: string | null, sMode: 'create' | 'view' | 'edit'): void {
    this.m_sLabellingProjectId = sProjectId;
    this.m_sMode = sMode;
  }

  clearState(): void {
    this.m_sLabellingProjectId = null;
    this.m_sMode = 'create';
  }

  setActiveImage(sImageName: string): void {
    this.m_oActiveImageSubject.next(sImageName);
  }

  notifyProjectWorkspaceChanged(): void {
    this.m_oProjectWorkspaceChangedSubject.next();
  }
}


