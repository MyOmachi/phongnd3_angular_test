# Phongnd3 Angular Test

This is a sample Angular application (generated with Angular CLI v20.x) used to demonstrate a small app architecture and tooling choices.

Key technologies used

- Styling: Tailwind CSS + PostCSS and Angular Material for component UI
- State management: NgRx (@ngrx/store, @ngrx/effects, @ngrx/store-devtools)
- End-to-end testing: Cypress
- Unit testing: Karma + Jasmine (default Angular test stack)

Repository layout (important folders)

- `src/app` - application source
- `src/app/features` - feature modules and components
- `src/app/services` - services (API, auth, products)
- `src/app/store` - NgRx store, actions, reducers, effects, selectors
- `cypress` - E2E tests, fixtures and configuration

Getting started

1. Install dependencies

```powershell
npm install
```

2. Start the dev server

```powershell
npm start
# or: ng serve
```

Open http://localhost:4200 in your browser.

Build for production

```powershell
npm run build
# or: ng build --configuration production
```

Unit tests (Karma + Jasmine)

This project uses the default Angular unit test setup with Karma as the test runner and Jasmine for the test framework. Run unit tests with:

```powershell
npm test
# or: ng test
```

End-to-end tests (Cypress)

E2E tests are implemented with Cypress. You can open the Cypress UI or run tests headless:

```powershell
npm run cypress:open
npm run cypress:run
```

Styling

- Tailwind CSS is installed and configured via PostCSS. You can use Tailwind utility classes throughout the Angular templates and component styles.
- Angular Material is included for ready-made, accessible UI components. Look for Material module imports in the app module(s).

State management

NgRx is used for application state (store, effects, and devtools are included). The `src/app/store` folder contains actions, reducers, effects, and selectors. Use `Store` and `Effects` in components and services to interact with app state.

Most complex part: NgRx-based authentication flow

One of the more complex and central areas of this project is the NgRx-based authentication flow — the combined system of actions, reducer, effects, the `AuthService`, the `AuthInterceptor`, and the routing `authGuard`. Together these pieces implement login HTTP calls, token storage and lifecycle, route protection, and global 401 handling. This flow is intentionally split across layers (UI dispatches actions, effects do side effects and navigation, reducers store user state, the interceptor appends tokens and redirects on 401s) which makes it robust and testable but requires careful coordination and good RxJS discipline.

Note on Signal Store

Signal Store (Angular's newer reactive store built on signals) is an interesting alternative to NgRx for some use cases. It's not yet used in this repo because I'm not familiar with it yet — something I plan to explore soon (maybe after today). If Signal Store fits the app's patterns, some parts of the state handling could be simplified in the future.
