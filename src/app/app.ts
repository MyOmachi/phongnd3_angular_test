import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from './store/user/user.selectors';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbar,
    MatButtonModule,
    AsyncPipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  @ViewChild('toolbar', { static: true }) toolbar!: ElementRef<HTMLElement>;
  toolbarHeight = signal(64);

  private store = inject(Store);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  ngAfterViewInit() {
    const height = this.toolbar.nativeElement?.offsetHeight;
    if (height) {
      this.toolbarHeight.set(height);
    }
  }
}
