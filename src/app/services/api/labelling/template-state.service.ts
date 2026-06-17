// src/app/services/template-state.service.ts
import { Injectable } from '@angular/core';

export type TemplateMode = 'create' | 'view' | 'edit';

@Injectable({ providedIn: 'root' })
export class TemplateStateService {
  templateId: string | null = null;
  mode: TemplateMode = 'create';

  setState(id: string | null, mode: TemplateMode) {
    this.templateId = id;
    this.mode = mode;
  }

  clear() {
    this.templateId = null;
    this.mode = 'create';
  }
}
