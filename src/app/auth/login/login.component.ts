import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { login } from '../../store/user/user.actions';
import { selectCurrentUser, selectIsLoggedIn } from '../../store/user/user.selectors';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private _hidePassword = signal(true);

  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  user$ = this.store.select(selectCurrentUser);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  hidePassword = () => this._hidePassword();
  togglePasswordVisibility = () => this._hidePassword.set(!this._hidePassword());

  submit() {
    if (this.form.invalid) return;
    const { username, password } = this.form.value as { username: string; password: string };
    this.store.dispatch(login({ username, password }));
  }
}
