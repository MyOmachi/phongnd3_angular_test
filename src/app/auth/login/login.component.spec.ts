// src/app/features/login/auth-login.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { FormBuilder } from '@angular/forms';

import { LoginComponent as AuthLoginComponent } from './login.component';
import { login } from '../../store/user/user.actions';
import { selectCurrentUser, selectIsLoggedIn } from '../../store/user/user.selectors';

describe('Login Component', () => {
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLoginComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectIsLoggedIn, value: false },
            { selector: selectCurrentUser, value: null },
          ],
        }),
        FormBuilder,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
  });

  it('renders login form when not logged in', async () => {
    store.overrideSelector(selectIsLoggedIn, false);
    store.overrideSelector(selectCurrentUser, null);

    const fixture = TestBed.createComponent(AuthLoginComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const form: HTMLFormElement | null = fixture.nativeElement.querySelector('form');
    expect(form).not.toBeNull();

    const userInput: HTMLInputElement | null = fixture.nativeElement.querySelector(
      'input[formControlName="username"]'
    );
    const passInput: HTMLInputElement | null = fixture.nativeElement.querySelector(
      'input[formControlName="password"]'
    );
    const submitBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[type="submit"]');

    expect(userInput).not.toBeNull();
    expect(passInput).not.toBeNull();
    expect(submitBtn).not.toBeNull();

    expect(submitBtn!.disabled).toBeTrue();

    userInput!.value = 'alice';
    userInput!.dispatchEvent(new Event('input'));
    passInput!.value = '123456';
    passInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(submitBtn!.disabled).toBeFalse();
  });

  it('toggles password visibility', async () => {
    const fixture = TestBed.createComponent(AuthLoginComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const passInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="password"]'
    );
    const eyeBtn: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[mat-icon-button]');

    expect(passInput).not.toBeNull();
    expect(eyeBtn).not.toBeNull();

    expect(passInput.type).toBe('password');
    eyeBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(passInput.type).toBe('text');

    eyeBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(passInput.type).toBe('password');
  });

  it('dispatches login action with form values on submit', async () => {
    const fixture = TestBed.createComponent(AuthLoginComponent);
    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

    fixture.detectChanges();
    await fixture.whenStable();

    const userInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="username"]'
    );
    const passInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formControlName="password"]'
    );
    const submitBtn: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[type="submit"]');

    userInput.value = 'bob';
    userInput.dispatchEvent(new Event('input'));
    passInput.value = 'secret';
    passInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    submitBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dispatchSpy).toHaveBeenCalledWith(login({ username: 'bob', password: 'secret' }));
  });

  it('shows signed-in message when logged in', async () => {
    store.overrideSelector(selectIsLoggedIn, true);
    store.overrideSelector(selectCurrentUser, { id: 1, username: 'bob', email: 'bob@example.com' });

    const fixture = TestBed.createComponent(AuthLoginComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeNull();

    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).toContain('Signed in as');
    expect(text).toContain('bob');
  });

  it('does not dispatch when form invalid', async () => {
    const fixture = TestBed.createComponent(AuthLoginComponent);
    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

    fixture.detectChanges();
    await fixture.whenStable();

    const submitBtn: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[type="submit"]');
    submitBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
