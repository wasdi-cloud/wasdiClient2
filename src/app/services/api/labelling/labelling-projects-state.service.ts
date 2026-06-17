import { Injectable } from '@angular/core';

export type LabellingProjectMode = 'create' | 'view' | 'edit';
@Injectable({
  providedIn: 'root',
})
export class LabellingProjectsStateService {
  m_sLabellingProjectId: string | null = null;
  m_sMode: 'create' | 'view' | 'edit' = 'create';

  // NEW: Tracks the project currently open for the "Labels" workspace
  m_sActiveWorkspaceProjectId: string | null = null;

  get projectId(): string | null {
    return this.m_sLabellingProjectId;
  }

  get mode(): 'create' | 'view' | 'edit' {
    return this.m_sMode;
  }

  setState(sProjectId: string | null, sMode: 'create' | 'view' | 'edit'): void {
    this.m_sLabellingProjectId = sProjectId;
    this.m_sMode = sMode;
  }

  clearState(): void {
    this.m_sLabellingProjectId = null;
    this.m_sMode = 'create';
  }
}


