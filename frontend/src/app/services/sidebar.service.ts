import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private openedSubject = new BehaviorSubject<boolean>(true);
  opened$ = this.openedSubject.asObservable();

  toggle() {
    this.openedSubject.next(!this.openedSubject.value);
  }

  setOpened(opened: boolean) {
    this.openedSubject.next(opened);
  }
}
