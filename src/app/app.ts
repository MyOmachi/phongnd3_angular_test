import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from './store/user/user.selectors';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import * as UserActions from './store/user/user.actions';

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
  private store = inject(Store);
  private authService = inject(AuthService);

  @ViewChild('toolbar', { static: true }) toolbar!: ElementRef<HTMLElement>;
  toolbarHeight = signal(64);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  ngAfterViewInit() {
    const height = this.toolbar.nativeElement?.offsetHeight;
    if (height) {
      this.toolbarHeight.set(height);
    }
  }

  checkToken() {
    this.authService.me().subscribe();
  }

  logout() {
    this.store.dispatch(UserActions.logout());
  }
}
