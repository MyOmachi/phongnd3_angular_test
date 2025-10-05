import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from './store/user/user.selectors';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbar, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private store = inject(Store);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  ngOnInit() {
    this.isLoggedIn$.subscribe((u) => console.log('isLoggedIn$', u));
  }
}
