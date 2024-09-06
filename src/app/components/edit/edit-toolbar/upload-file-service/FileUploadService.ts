import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private isUploadingSubject = new BehaviorSubject<boolean>(false);
  isUploading$ = this.isUploadingSubject.asObservable();
  constructor() {}

  startUpload() {
    this.isUploadingSubject.next(true);
  }

  finishUpload() {
    this.isUploadingSubject.next(false);
  }

  getUploadStatus() {
    return this.isUploadingSubject.value;
  }
}
